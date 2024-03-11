import { StatusCodes } from "http-status-codes";
import Review from "../models/ReviewModel.js";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors.js";
import Product from "../models/ProductModel.js";
import { checkPermissions } from "../utils/checkPermissions.js";

export const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id:${productId} has been found`);
  }

  //   Checking to see if the current user has already left a review for this product;
  const pastProductReview = await Review.findOne({
    product: productId,
    user: req.user.id,
  });

  if (pastProductReview) {
    throw new BadRequestError("Review already submitted for this product");
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

export const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "user",
      select: "name",
    });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

export const getSingleReview = async (req, res) => {
  const { id } = req.params;

  const review = await Review.findOne({ _id: id });

  if (!review) {
    throw new NotFoundError(`Review with id:${id} not found`);
  }

  res.status(StatusCodes.OK).json({ review });
};

export const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`Review with this id:${id} not found`);
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review, msg: "Update Review" });
};

export const deleteReview = async (req, res) => {
  const { id } = req.params;

  const review = await Review.findOne({ _id: id });
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  console.log(req.user.userId);
  console.log(review.user);
  console.log(req.user === review.user);
  checkPermissions(req.user, review.user);

  await review.remove(); //.remove would the pre hook when deleting
  res.status(StatusCodes.OK).json({ msg: "Delete Review" });
};

// A user can only leave one review per product using mongoose compound Indexing
// ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// populate allows us to reference documents in other collections
// we could get specific info about a product when requesting reviews
