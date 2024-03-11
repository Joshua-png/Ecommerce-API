import { Router } from "express";
import { register, login, logout } from "../controllers/authController.js";
import {
  validateLogin,
  validateUser,
} from "../middleware/validationMiddleware.js";

const router = Router();

router.route("/register").post(validateUser, register);
router.route("/login").post(validateLogin, login);
router.route("/logout").get(logout);

export default router;
