const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,     
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    is_home: {
      type: Boolean,
      default: false,
    },
    is_top: {
      type: Boolean,
      default: false,
    },
    is_popular: {
      type: Boolean,
      default: false,
    },
    categoryId:[
      {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
        default : []
      }
    ]
  },  
  {
    timestamps: true,
  },
);  

const BrandModel = mongoose.model("Brand", BrandSchema);

module.exports = BrandModel;
