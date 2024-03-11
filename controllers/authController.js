import { StatusCodes } from "http-status-codes";
import { User } from "../models/UserModel.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { attachCookiesToResponse, creatJWT } from "../utils/tokenUtils.js";
import { UnauthenticatedError } from "../errors/CustomErrors.js";

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const { name, email, password } = req.body;

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  const tokenUser = {
    name: user.name,
    userId: user._id,
    role: user.role,
  };

  //   const token = creatJWT(tokenUser);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ msg: "User created", user });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new UnauthenticatedError("Invalid Credentials");
  const isPasswordCorrect = await verifyPassword(
    req.body.password,
    user.password
  );
  if (!isPasswordCorrect) throw new UnauthenticatedError("Invalid Credentials");

  const tokenUser = {
    name: user.name,
    userId: user._id,
    role: user.role,
  };

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ msg: "User Logged In", user });
};

export const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "User Logged Out" });
};
