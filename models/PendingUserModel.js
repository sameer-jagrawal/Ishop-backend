const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    otpExpiry: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

pendingUserSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

const PendingUserModel = mongoose.model("PendingUser", pendingUserSchema);

module.exports = PendingUserModel;
