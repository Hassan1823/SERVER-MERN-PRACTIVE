import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "🤙 Internal Server Error";

  // wrong mongodb id error
  if (err.name === "CastError") {
    const message = `🤙 Resourse Not Found. Invalid : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //   duplicate the error
  if (err.code === 11000) {
    const message = `🤙 Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  //   wromg JWT Error
  if (err.name === "JsonWebTokenError") {
    const message = `🤙 Invalid JWT Token, Please Try Again`;
    err = new ErrorHandler(message, 400);
  }

  //   JWT Exprie error
  if (err.name === "TokenExpiredError") {
    const message = `🤙 JWT Token Is Expired, Please Try Again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
