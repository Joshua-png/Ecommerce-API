import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  getSingleProductReviews,
  updateProduct,
  uploadImage,
} from "../controllers/productController.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")], createProduct)
  .get(getAllProducts);

router
  .route("/uploadImage")
  .post(
    [authenticateUser, authorizePermissions("admin")],
    upload.single("image"),
    uploadImage
  );

router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

export default router;
