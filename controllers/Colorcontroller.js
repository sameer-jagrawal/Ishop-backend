// const categoryModel = require("../models/CategoryModel");
const ColorModel = require("../models/ColorModel");
const {
  sendServerError,
  sendBadReaquest,
  sendConflict,
  sendSuccess,
  sendDelete,
  sendupdate,
} = require("../utils/response");

// create api

const create = async (req, res) => {
  try {
    const { name, slug, colorCode } = req.body;
    if (!name || !slug || !colorCode)
      return sendBadReaquest(res, "All feilds Required");

    const existColor = await ColorModel.findOne({ slug });
    if (existColor) {
      return sendConflict(res, "Color already exists");
    }
    const data = await ColorModel.create({ name, slug, colorCode });
    return sendSuccess(res, "Color add succesfully", data);
  } catch (error) {
    console.log(error);
    sendServerError(res, "something went wrong");
  }
};

// read

const read = async (req, res) => {
  try {
    const query = req.query
    const filter = {}
    if(query.status) filter.status = query.status === "true";
    if(query.id) filter._id = query.id
    // console.log(req.body)
    const color = await ColorModel.find(filter);
    const total = await ColorModel.countDocuments();

    return sendSuccess(res, "success", color, {
      total,
      imagebaseurl: "http://localhost:5000/brand/",
    });
  } catch (error) {
    sendServerError(res, "something went wrong");
  }
};

// delete api

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const color = await ColorModel.findById(id);
    if (!color) {
      return sendBadReaquest(res, "Color not exists");
    }

    await ColorModel.findByIdAndDelete(id);
    return sendDelete(res, "Color deleted successfully");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
};

// updatestatus

const updateStatus = async (req, res) => {
  try {
    const { feild } = req.body;
    const { id } = req.params;
    console.log(id);
    const color = await ColorModel.findById(id);
    console.log(color);
    if (!color) {
      return sendBadReaquest(res, "No data found");
    }
    const feilds = ["is_home", "is_top", "status", "is_popular"];
    if (!feilds.includes(feild)) {
      return sendBadReaquest(res);
    }

    const newRecord = await ColorModel.findByIdAndUpdate(id,{
        [feild] : !color[feild]
    })

    return sendupdate(res, "Status updated succesfully", newRecord);
  } catch (error) {}
};

module.exports = { create, read, deleteById, updateStatus };
