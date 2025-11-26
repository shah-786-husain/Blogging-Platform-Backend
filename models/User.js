import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,

      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      default: "default.png",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

const UserModal = mongoose.model("User", UserSchema);

export default UserModal;
