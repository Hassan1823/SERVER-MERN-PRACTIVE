require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";

// ! local imports
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";

// ! body parser
app.use(express.json({ limit: "50mb" }));

// ! cookies parser
app.use(cookieParser());

// ! cors
app.use(cors({ origin: process.env.ORIGIN }));

// ! routes
app.use("/api/v1", userRouter);

app.use("/api/v1", courseRouter);

// ! for testing API route
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  console.log(`😁 API is Working At ${req.originalUrl}`);
  res.status(200).json({
    success: true,
    message: "😁 API is Working",
  });
});

// ! for unknown API routre
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`🥲 Route ${req.originalUrl} Not Found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
