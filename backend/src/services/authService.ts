
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID, createHash } from "crypto";
import { AppDataSource } from "../config/database";
import { User } from "../models/user";
import { RefreshSession } from "../models/refreshSession";
import { IsNull } from "typeorm";

const ACCESS_TOKEN_LIFETIME = "15m";
const REFRESH_TOKEN_DAYS = 7;

function getSecret(name: string): string {
  const secret = process.env[name];

  if (!secret || secret.length < 32) {
    throw new Error(`${name} must be configured with a strong secret`);
  }

  return secret;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createAccessToken(userId: number): string {
  return jwt.sign(
    { sub: String(userId) },
    getSecret("ACCESS_TOKEN_SECRET"),
    { expiresIn: ACCESS_TOKEN_LIFETIME }
  );
}

function createRefreshToken(userId: number, sessionId: string): string {
  return jwt.sign(
    { sub: String(userId), sid: sessionId },
    getSecret("REFRESH_TOKEN_SECRET"),
    { expiresIn: `${REFRESH_TOKEN_DAYS}d` }
  );
}

function getRefreshExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_DAYS);
  return expiry;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const userRepository = AppDataSource.getRepository(User);
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await userRepository.findOneBy({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = userRepository.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  try {
    const savedUser = await userRepository.save(user);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository
    .createQueryBuilder("user")
    .addSelect("user.passwordHash")
    .where("user.email = :email", {
      email: email.trim().toLowerCase(),
    })
    .getOne();

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const sessionId = randomUUID();
  const refreshToken = createRefreshToken(user.id, sessionId);

  const sessionRepository = AppDataSource.getRepository(RefreshSession);

  const session = sessionRepository.create({
    id: sessionId,
    user,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshExpiry(),
    revokedAt: null,
  });

  await sessionRepository.save(session);

  return {
    accessToken: createAccessToken(user.id),
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function refreshAccessToken(rawToken: string) {
  let payload: jwt.JwtPayload;

  try {
    const decoded = jwt.verify(
      rawToken,
      getSecret("REFRESH_TOKEN_SECRET")
    );

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.sid !== "string"
    ) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    payload = decoded;
  } catch {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const result = await AppDataSource.transaction(async (manager) => {
    const sessions = manager.getRepository(RefreshSession);

    const session = await sessions
  .createQueryBuilder("session")
  .innerJoinAndSelect("session.user", "user")
  .where("session.id = :id", {
    id: payload.sid as string,
  })
  .setLock("pessimistic_write", undefined, ["session"])
  .getOne();

    if (!session) {
      return { kind: "invalid" as const };
    }

    const tokenMatches = session.tokenHash === hashToken(rawToken);
    const expired = session.expiresAt.getTime() <= Date.now();

    if (session.revokedAt || !tokenMatches) {
      const activeSessions = await sessions.find({
        where: {
          user: { id: session.user.id },
          revokedAt: IsNull(),
        },
      });

      for (const activeSession of activeSessions) {
        activeSession.revokedAt = new Date();
      }

      await sessions.save(activeSessions);

      return { kind: "invalid" as const };
    }

    if (expired) {
      session.revokedAt = new Date();
      await sessions.save(session);

      return { kind: "invalid" as const };
    }
    session.revokedAt = new Date();
    await sessions.save(session);
    const newSessionId = randomUUID();
    const newRefreshToken = createRefreshToken(
      session.user.id,
      newSessionId
    );

    const newSession = sessions.create({
      id: newSessionId,
      user: session.user,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: getRefreshExpiry(),
      revokedAt: null,
    });

    await sessions.save(newSession);

    return {
      kind: "success" as const,
      accessToken: createAccessToken(session.user.id),
      refreshToken: newRefreshToken,
    };
  });

  if (result.kind !== "success") {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  return result;
}

export async function logoutUser(rawToken: string | undefined) {
  if (!rawToken) {
    return;
  }
  const decoded = jwt.decode(rawToken);

  if (
    !decoded ||
    typeof decoded === "string" ||
    typeof decoded.sid !== "string"
  ) {
    return;
  }

  const sessions = AppDataSource.getRepository(RefreshSession);

  const session = await sessions.findOne({
    where: { id: decoded.sid },
    relations: { user: true },
  });

  if (
    session &&
    session.tokenHash === hashToken(rawToken) &&
    !session.revokedAt
  ) {
    session.revokedAt = new Date();
    await sessions.save(session);
  }
}

