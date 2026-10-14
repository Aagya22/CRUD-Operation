
import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../services/authService";

const REFRESH_COOKIE = "refreshToken";
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/auth",
  maxAge: REFRESH_TOKEN_MAX_AGE,
};

const isObject = (body: unknown): body is Record<string, unknown> =>
  typeof body === "object" && body !== null && !Array.isArray(body);

// POST /auth/register
export async function registerController(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({
        message: "Name, email, and password are required",
      });
      return;
    }

    if (!isObject(req.body)) {
      res.status(400).json({ message: "Request body must be a JSON object" });
      return;
    }

    if (name.trim().length > 100) {
      res.status(400).json({ message: "Name must be 100 characters or fewer" });
      return;
    }

    if (email.trim().length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ message: "Enter a valid email address" });
      return;
    }

    if (password.length < 8 || password.length > 72) {
      res.status(400).json({
        message: "Password must be between 8 and 72 characters",
      });
      return;
    }

    const user = await registerUser(name, email, password);

    res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register account" });
  }
}

// POST /auth/login
export async function loginController(req: Request, res: Response) {
  try {
    if (!isObject(req.body)) {
      res.status(400).json({ message: "Request body must be a JSON object" });
      return;
    }

    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const result = await loginUser(email, password);

    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
}

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth",
  });
};

// POST /auth/refresh
export async function refreshController(req: Request, res: Response) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];

    if (typeof rawToken !== "string" || !rawToken) {
      clearRefreshCookie(res);
      res.status(401).json({ message: "Refresh token is required" });
      return;
    }

    const result = await refreshAccessToken(rawToken);

    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: result.accessToken,
    });
  } catch (error) {
    clearRefreshCookie(res);

    if (error instanceof Error && error.message === "INVALID_REFRESH_TOKEN") {
      res.status(401).json({
        message: "Refresh token is invalid, expired, or revoked",
      });
      return;
    }

    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
}

// POST /auth/logout
export async function logoutController(req: Request, res: Response) {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE];

    await logoutUser(typeof rawToken === "string" ? rawToken : undefined);

    clearRefreshCookie(res);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Failed to log out" });
  }
}
