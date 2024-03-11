import jwt from "jsonwebtoken";

export const creatJWT = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

export const verifyJWT = (token) => {
  const data = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(data);
  return data;
};

export const attachCookiesToResponse = ({ res, user }) => {
  const token = creatJWT(user);

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  // res.status(200).json({ user });
};

export const createTokenUser = (user) => {
  return {
    name: user.name,
    userId: user._id,
    role: user.role,
  };
};
