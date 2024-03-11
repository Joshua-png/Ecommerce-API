import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/CustomErrors.js";
import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";
import { checkPermissions } from "../utils/checkPermissions.js";

const faskeStripeAPI = async ({ amount, currency }) => {
  const clientSecret = "clientSecret";
  return {
    clientSecret,
    amount,
  };
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

export const getSingleOrder = async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({ _id: id });
  if (!order) {
    throw new NotFoundError(`Order with id:${id} not found`);
  }

  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

export const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

export const createOrder = async (req, res) => {
  const { items, tax, shippingFee } = req.body;
  if (!items || items.length < 1) {
    throw new BadRequestError("No cart items provided");
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide the tax and shipping fee");
  }

  let orderItems = [];
  let subtotal = 0;

  for (const cartItem of items) {
    const dbProduct = await Product.findOne({ _id: cartItem.product });
    if (!dbProduct) {
      throw new NotFoundError(
        `Product with the id:${cartItem.product} not found.`
      );
    }

    const { name, price, image } = dbProduct;

    const singleOrderItem = {
      amount: cartItem.amount,
      name,
      price,
      image,
      product: cartItem.product,
    };

    orderItems = [...orderItems, singleOrderItem];

    subtotal += cartItem.amount * price;
  }

  const total = tax + shippingFee + subtotal;

  const paymentIntent = await faskeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.clientSecret,
    user: req.user.userId,
  });

  //   Communicate with stripe for client secret
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret, msg: "Create Order" });
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id });

  if (!order) {
    throw new NotFoundError(`Order with the id:${id} not found.`);
  }
  const { paymentId } = req.body;

  checkPermissions(req.user, order.user);

  order.paymentId = paymentId;
  order.status = "paid";

  await order.save;
  res.status(StatusCodes.OK).json({ order, msg: "Update Order" });
};
