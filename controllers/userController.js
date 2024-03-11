import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/CustomErrors.js";
import { User } from "../models/UserModel.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { attachCookiesToResponse } from "../utils/tokenUtils.js";
import { checkPermissions } from "../utils/checkPermissions.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" });

  if (users.length === 0) {
    throw new NotFoundError("No user was found");
  }

  res.status(StatusCodes.OK).json({ users });
};

export const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });

  if (!user) {
    throw new NotFoundError(`User with this id: ${id} not found`);
  }

  checkPermissions(req.user, user._id);
  res.status(200).json({ user });
};

export const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

export const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new BadRequestError("Both values must be provided");
  }

  const user = await User.findByOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    { new: true, runValidators: true }
  );

  const tokenUser = {
    name: user.name,
    userId: user._id,
    role: user.role,
  };

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ msg: "Update User", user: tokenUser });
};

export const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide both passwords");
  }

  const { userId } = req.user;
  const user = await User.findOne({ _id: userId });

  //   Check if the old password matches with the old password in the database
  const isPasswordCorrect = await verifyPassword(oldPassword, user.password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credential");
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Update User Password" });
};
