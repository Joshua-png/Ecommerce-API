// Dot env setup
import * as dotenv from "dotenv";
dotenv.config();

import "express-async-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import AuthRouter from "./routes/AuthRouter.js";
import UserRouter from "./routes/UserRouter.js";
import ProductRouter from "./routes/ProductRouter.js";
import ReviewRouter from "./routes/ReviewRouter.js";
import OrderRouter from "./routes/OrderRouter.js";
import { connect } from "./db/connect.js";
import { errorHandlerMiddleware } from "./middleware/errorHandlerMiddleware.js";
import cookieParser from "cookie-parser";
// Limites the amount of requests from a single IP
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
// import { v2 as cloudinary } from "cloudinary";

// Initializing an express app
const app = express();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
//   secure: true,
// });

// Public folder
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

// Bcos of es6 we have to do this acrobatics
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json()); //Have access to the json data in the req.body
app.use(cookieParser(process.env.JWT_SECRET));
app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
  })
);
app.use(helmet());
app.use(xss());
app.use(cors());
app.use(mongoSanitize());

// Public folder middlemware
app.use(express.static(path.resolve(__dirname, "./public")));

// Routers
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/products", ProductRouter);
app.use("/api/v1/reviews", ReviewRouter);
app.use("/api/v1/orders", OrderRouter);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./public", "index.html"));
});

const port = process.env.PORT || 3000;

// app.get("/api/v1/test", (req, res) => {
//   res.json({ msg: "welcome" });
// });

// app.get("/api/v1", (req, res) => {
//   console.log(req.signedCookies);
//   res.json({ msg: "welcome" });
// });

// Not found
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Route not Found" });
});

// Error Route
app.use(errorHandlerMiddleware);

try {
  connect();
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
