import mongoose from "mongoose";

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide this rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
    },
    comment: {
      type: String,
      required: [true, "Please provide review comment"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numberOfReviews: result[0]?.numOfReviews || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function (next) {
  await this.constructor.calculateAverageRating(this.product);
  console.log("Post save hook");
  // next();
});

ReviewSchema.post("remove", async function (next) {
  await this.constructor.calculateAverageRating(this.product);
  console.log("Post remove hook");
  // next();
});

const Review = mongoose.model("Review", ReviewSchema);

export default Review;

// For static methods, we called them on the schema not on the instance
