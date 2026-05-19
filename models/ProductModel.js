const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    short_description: {
      type: String,
    },
    long_description: {
      type: String,
    },
    original_price: {
      type: Number,
      default: 200,
    },
    discount_percentage: {
      type: Number,
    },
    final_price: {
      type: Number,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    images: [
      {
        type: String,
      },
    ],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },  
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    colorId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
        default: [],
      },
    ],
    stock: {
      type: Boolean,
      default: true,
    },
    is_home: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    is_top: {
      type: Boolean,
      default: true,
    },
    is_hot: {
      type: Boolean,
      default: true,
    },
    is_best: {
      type: Boolean,
      default: true,
    },
    is_popular: {
      type: Boolean,
      default: true,
    },
    is_return : {
      type : Boolean,
      default : false
    }
    
  },
  {
    timestamps: true,
  },
);

const ProductModel = mongoose.model("product", productSchema);

module.exports = ProductModel;
