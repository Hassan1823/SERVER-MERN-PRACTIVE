import { Request, Response, NextFunction } from "express";
import cron from "node-cron";

// ~ local imports
import NotificationModel from "../models/notification.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

// ~ get notification ---only for admin
export const getNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// ~ update notification --- only for admin
export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler(`⚠️ Notification Not Found`, 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification.status;
      }

      await notification.save();

      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//! to run the function without hitting api we use node-corn
// cron.schedule("*/5 * * * * *", function () {
      //   console.log(`-----------------------`);
      //   console.log(`🚀 Corn Is Working`);
//   console.log(`-----------------------`);
// });

// ~ delete notification  --- only for admin
cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 100);
  //   ! delete those notifications thats status is read and created more then 30 days ago
  await NotificationModel.deleteMany({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
  console.log(`🚀 deleting Read Notifications`);
});

