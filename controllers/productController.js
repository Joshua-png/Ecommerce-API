import { StatusCodes } from "http-status-codes";
import Product from "../models/ProductModel.js";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors.js";
import Review from "../models/ReviewModel.js";

export const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "Product Created", product });
};

export const getAllProducts = async (req, res) => {
  const products = await Product.find({}).populate("reviews");

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

export const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new NotFoundError(`No product with this id:${productId} was found`);
  }
  res.status(StatusCodes.OK).json({ product });
};

export const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new NotFoundError(`No product with this id:${productId} was found`);
  }
  res.status(StatusCodes.OK).json({ msg: "Product Updated" });
};

export const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with this id:${productId} was found`);
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Product Deleted" });
};

export const uploadImage = async (req, res) => {
  const { file } = req;
  if (!file) {
    throw new BadRequestError("No Image File");
  }

  if (!file.mimetype.startsWith("image")) {
    throw new BadRequestError("File must be of an image type");
  }

  req.body.image = file.path;
  console.log(req.body.image);
  //   const product = await Product.save();
  res.status(StatusCodes.OK).json({ image: `${req.body.image}` });
};

// cannot use populate to access reviews since there is no connection like that.
// we can use mongoose virtuals: properties that donot persist or are stored in a database. They only exist logically
// you wont be able to query .populate() because it is a virtual property

export const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
