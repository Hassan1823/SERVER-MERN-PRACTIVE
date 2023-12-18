import express from "express";
import { getNotification, updateNotification } from "../controllers/notification.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";

const notificationRouter = express.Router();

notificationRouter.get(
  "/get-all-notification",
  isAuthenticated,
  authorizeRoles("admin"),
  getNotification
);

notificationRouter.put(
  "/get-updated-notification/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotification
);

export default notificationRouter;
