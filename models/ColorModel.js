const mongoose = require("mongoose");

const ColorSchema = new mongoose.Schema(
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
    status: {
      type: Boolean,
      default: true,
    },
    colorCode: {
        type: String,
        unique:true,
        required : true,   
        trim: true,
        uppercase: true,
    }
  },  
  {
    timestamps: true,
  },
);

const ColorModel = mongoose.model("Color", ColorSchema);

module.exports = ColorModel;
