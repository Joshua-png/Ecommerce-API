import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  updateOrder,
} from "../controllers/orderController.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authMiddleware.js";

const router = Router();

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllOrders)
  .post(authenticateUser, createOrder);
router
  .route("/get-current-user-orders")
  .get(authenticateUser, getCurrentUserOrders);
router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

export default router;
