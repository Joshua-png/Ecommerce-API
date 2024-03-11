import { body, param, validationResult } from "express-validator";
import { BadRequestError } from "../errors/CustomErrors.js";
import { User } from "../models/UserModel.js";
import mongoose from "mongoose";

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg); //error.msg
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

// export const validateUser = withValidationErrors([
//   body("name").trim().notEmpty().withMessage("Please provide a name"),
// ]);

export const validateIdParams = withValidationErrors([
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid MongoDB Id"),
]);

export const validateUser = withValidationErrors([
  body("name").trim().notEmpty().withMessage("Please provide a name"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (email) => {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw new BadRequestError("Email already in use");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters long"),
]);

export const validateLogin = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
]);
