import cloudinary from "cloudinary";
import { NextFunction, Request, Response } from "express";

// ~ local imports
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { createProduct } from "../services/product.service";
import ErrorHandler from "../utils/ErrorHandler";
import ProductModel from "../models/product.model";
import { redis } from "../utils/redis";

// ! ----------- functions

//~ upload products
export const uploadProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "products",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createProduct(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// ~ edit product
export const editProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "products",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.url,
        };
      }

      const productId = req.params.id;
      const product = await ProductModel.findByIdAndUpdate(
        productId,
        {
          $set: data,
        },
        {
          new: true,
        }
      );

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// ~ get single products
export const getSingleProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id;

      const isCachedExist = await redis.get(productId);

      if (isCachedExist) {
        const product = JSON.parse(isCachedExist);
        res.status(200).json({
          success: true,
          product,
        });
      } else {
        const product = await ProductModel.findById(req.params.id);
        await redis.set(productId, JSON.stringify(product));

        res.status(200).json({
          success: true,
          product,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// ~ get all products
export const getAllProducts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCatcheExist = await redis.get("allProducts");

      if (isCatcheExist) {
        const products = JSON.parse(isCatcheExist);
        //   console.log(`🚀 Hitting Redis`)

        res.status(200).json({
          success: true,
          products,
        });
      } else {
        const products = await ProductModel.find();

        await redis.set("allProducts", JSON.stringify(products));

        // console.log(`🚀 Hitting MongoDB`)
        res.status(200).json({
          success: true,
          products,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// ~ get products according to the user
// ! to access the cart
export const getProductByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userProductList = req.user?.products;
      const productId = req.params.id;

      const productExist = userProductList?.find(
        (product: any) => product._id.toString() === productId
      );

      if (!productExist) {
        return next(
          new ErrorHandler(
            `⚠️ You Are Not Eligible To Access This Product`,
            400
          )
        );
      }

      const product = await ProductModel.findById(productId);

      if (product) {
      //   console.log(`Produts : ${product}`);
        res.status(200).json({
          success: true,
          product,
        });
      } else {
        console.log(`No Products Found`);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
