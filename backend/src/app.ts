
import express, { Request, Response, NextFunction } from "express";
import itemRoutes from "./routes/itemRoutes";

const app = express();

app.use(express.json());

app.use(itemRoutes);

app.use(
  (
    error: SyntaxError & { status?: number },
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error instanceof SyntaxError && error.status === 400) {
      res.status(400).json({
        message: "Invalid JSON in request body",
      });
      return;
    }

    next(error);
  }
);

export default app;
