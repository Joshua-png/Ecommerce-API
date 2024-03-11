import mongoose from "mongoose";

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      trim: true,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: ["kitchen", "office", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Please provide product company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      required: true,
      default: ["#000"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 1,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// create the property
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  // match: {rating: 5}
});

// Removing reviews before product is deleted
ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;

// To include virtuals toJSON: {virtuals:true}, toObject:{virtuals:true} beside the timestamps
