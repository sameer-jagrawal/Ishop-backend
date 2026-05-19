const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },

    addressLine1: { type: String, required: true },
    addressLine2: { type: String },

    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "India" },
    type: { type: String, default: "Home" },


    isDefault: { type: Boolean, default: false },
  },
);

const userSchema = new mongoose.Schema(
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
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin","superAdmin"],
      default: "user",
    },

    addresses: [addressSchema],

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: Number
    },

    otpExpiry: {
      type: Date,
    },

    status: {
      type: Boolean,
      default: true,
    },

  },
  { timestamps: true },
);

const UserModel = mongoose.model("User",userSchema);

module.exports = UserModel;
