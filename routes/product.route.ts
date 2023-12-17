import express from "express";

// ~ local imports
import {
  editProduct,
  getAllProducts,
  getProductByUser,
  getSingleProduct,
  uploadProduct,
} from "../controllers/product.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const productRoute = express.Router();

productRoute.post(
  "/add-product",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadProduct
);

productRoute.put(
  "/edit-product/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  editProduct
);
productRoute.get("/get-product/:id", getSingleProduct);

productRoute.get("/get-all-product", getAllProducts);

productRoute.get("/get-product-user/:id", isAuthenticated, getProductByUser);

export default productRoute;
