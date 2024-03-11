import mongoose from "mongoose";

export const connect = async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(process.env.MONGODB_URI);
  //   console.log(connection.connection.host);
  console.log("Connected to Database");
};
