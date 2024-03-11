import { Router } from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getSingleReview,
  updateReview,
} from "../controllers/reviewController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/").get(getAllReviews).post(authenticateUser, createReview);

router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

export default router;
