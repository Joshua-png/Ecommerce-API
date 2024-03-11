import {
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors/CustomErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";

export const authenticateUser = async (req, res, next) => {
  const { token } = req.signedCookies;

  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  try {
    const { name, userId, role } = verifyJWT(token);
    // const testUser = userId === "652ce3013a4b2c0502dc018d";
    // req.user = { userId, role, testUser };
    req.user = { name, userId, role };
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  next();
};

// export const checkForTestUser = (req, res, next) => {
//   if (req.user.testUser) {
//     throw new BadRequestError("Demo User, Read Only");
//   }

//   next();
// };

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(
        "Do not have permission to access this route"
      );
    }
    next();
  };
};

// Just for checking admins
// export const authorizePermissions = (req, res, next) => {
//   if (!req.user.role === "admin") {
//     throw new UnauthorizedError("Do not have permission to access this route");
//   }
//   next();
// };
