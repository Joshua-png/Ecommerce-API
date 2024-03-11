import express from "express";

import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from "../controllers/userController.js";
import { validateIdParams } from "../middleware/validationMiddleware.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);
router.route("/showCurrentUser").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, validateIdParams, getSingleUser);
// patch(updateUser);

export default router;
