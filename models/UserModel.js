import mongoose, { model } from "mongoose";

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    minlength: 3,
    maxlength: 60,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
  },
  password: {
    type: String,
    unique: true,
    required: [true, "Please provide a password"],
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  //   avatar: String,
  //   avatarPublicId: String,
});

UserSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model("User", UserSchema);

// avatarPublicId identifies the previous image that has to be removed
