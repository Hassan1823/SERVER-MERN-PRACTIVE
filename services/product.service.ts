import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ProductModel from "../models/product.model";

// ~ create product
export const createProduct = CatchAsyncError(
  async (data: any, res: Response) => {
    const product = await ProductModel.create(data);
    res.status(200).json({
      success: true,
      product,
    });
  }
);
