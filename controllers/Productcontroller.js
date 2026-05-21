const ProductModel = require("../models/ProductModel");
const mongoose = require("mongoose");
const fs = require("fs");
const { imageName } = require("../utils/helper");
const {
  sendBadReaquest,
  sendConflict,
  sendServerError,
  sendSuccess,
  sendupdate,
  sendDelete,
  sendNotFound,
} = require("../utils/response");
const categoryModel = require("../models/CategoryModel");
const BrandModel = require("../models/BrandModel");
const ColorModel = require("../models/ColorModel");

// create api
const create = async (req, res) => {
  try {
    // 1. Destructure with defaults
    const {
      name,
      slug,
      categoryId,
      brandId,
      discount_percentage,
      final_price,
      original_price,
      short_description,
      long_description,
    } = req.body;

    // 2. Get uploaded files
    const images = req.files?.images;
    const thumbnailFile = req.files?.thumbnail;

    // 3. Validate required fields (including categoryId and brandId)
    if (
      !name ||
      !slug ||
      !categoryId ||
      !brandId ||
      !images ||
      !thumbnailFile
    ) {
      return sendBadReaquest(res, "All required fields must be provided:");
    }

    // 4. Validate ObjectId format for categoryId and brandId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return sendBadReaquest(res, "Invalid categoryId");
    }
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return sendBadReaquest(res, "Invalid brandId");
    }

    // 5. Check for duplicate product by slug
    const existingProduct = await ProductModel.findOne({ slug });
    if (existingProduct) {
      return sendConflict(res, "Product already exists");
    }

    // 6. Parse colorId (optional, can be array or JSON string)
    let colorId = [];
    if (req.body.colorId) {
      try {
        colorId =
          typeof req.body.colorId === "string"
            ? JSON.parse(req.body.colorId)
            : req.body.colorId;
        if (!Array.isArray(colorId)) colorId = [colorId];
      } catch (err) {
        return sendBadReaquest(res, "Invalid colorId format");
      }
    }

    // 7. Process multiple images
    const files = Array.isArray(images) ? images : [images];
    const imageNames = [];
    for (const file of files) {
      const imagename = imageName(file.name);
      const destination = `./public/product/${imagename}`;
      await new Promise((resolve, reject) => {
        file.mv(destination, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      imageNames.push(imagename);
    }

    // 8. Process thumbnail
    const thumbName = imageName(thumbnailFile.name);
    const thumbPath = `./public/product/${thumbName}`;
    await new Promise((resolve, reject) => {
      thumbnailFile.mv(thumbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 9. Create product in database
    const data = await ProductModel.create({
      name,
      slug,
      images: imageNames,
      thumbnail: thumbName,
      categoryId,
      brandId,
      colorId,
      long_description,
      short_description,
      final_price,
      discount_percentage,
      original_price,
    });
    const imageBaseUrl = "http://localhost:5000/product/";
    const plainData = data.toObject();
    // console.log("Plain object categoryId:", plainData.categoryId);
    return sendSuccess(
      res,
      "Product created sucessfully",
      plainData,
      imageBaseUrl,
    );
    // return res.status(200).json({ success: true, data: plainData });
  } catch (error) {
    // console.error("Product creation error:", error);
    // Always send an error response to the client
    return sendServerError(res, error.message || "Internal Server Error", 500);
  }
};

// edit updateBySlug

// read api
const read = async (req, res) => {
  try {
    //     console.log("RAW QUERY:", req.query);
    // console.log("TYPE:", typeof req.query.brand_slug);
    const query = req.query;
    const sorted = {};
    const filter = {};
    const limit = parseInt(query.limit) || 10;
    const page = query.pages || 1;
    const skip = parseInt((page - 1) * limit);
    if (query.status) filter.status = query.status === "true";
    if (query.is_home) filter.is_home = query.is_home === "true";
    if (query.is_top) filter.is_top = query.is_top === "true";
    if (query.is_popular) filter.is_popular = query.is_popular === "true";
    if (query.is_best) filter.is_best = query.is_best === "true";
    if (query.is_hot) filter.is_hot = query.is_hot === "true";
    if (query.id) filter._id = query.id;
    // for category
    if (query.category_slug) {
      const category = await categoryModel.findOne({
        slug: query.category_slug,
      });
      filter.categoryId = category._id;
    }
    // for brand
    if (query.brand_slug) {
      let brandSlugs = [];

      if (typeof query.brand_slug === "string") {
        brandSlugs = query.brand_slug.split(",");
      } else if (Array.isArray(query.brand_slug)) {
        brandSlugs = query.brand_slug;
      }

      const brands = await BrandModel.find({
        slug: { $in: brandSlugs },
      });

      const brandIds = brands.map((b) => b._id);

      // console.log("brandIds:", brandIds);

      if (brandIds.length > 0) {
        filter.brandId = { $in: brandIds };
      }
    }

    // for color
    if (query.color_slug) {
      let color_slug = [];

      if (typeof query.color_slug == "string") {
        color_slug = query.color_slug.split(",");
      } else if (Array.isArray(query.color_slug)) {
        color_slug = query.color_slug;
      }
      color_slug = color_slug.map((slug) => slug.trim()).filter(Boolean);

      const colors = await ColorModel.find({
        slug: { $in: color_slug },
      });

      const colorIds = colors.map((c) => c._id);

      if (colorIds.length > 0) {
        filter.colorId = { $in: colorIds };
      }
    }

    // for price
    if (query.min_price && query.max_price) {
      filter.final_price = {
        $gte: parseInt(query.min_price),
        $lte: parseInt(query.max_price),
      };
    }

    //for sort

    const sortOption = query.sort?.toLowerCase();

    if (sortOption === "asc") {
      sorted.final_price = 1;
    } else if (sortOption === "desc") {
      sorted.final_price = -1;
    } else {
      sorted.createdAt = -1;
    }
    const [total, product] = await Promise.all([
      ProductModel.find().countDocuments(),
      ProductModel.find(filter)
        .skip(skip)
        .sort(sorted)
        .limit(limit)
        .populate(["categoryId", "brandId", "colorId"]),
    ]);

    sendSuccess(res, "Product find succesfully", product, {
      total,
      limit,
      pages: Math.ceil(total / limit),
      imageBaseUrl:"https://ishop-backend-2mld.onrender.com/product"
    });
  } catch (error) {
    sendServerError(res);
  }
};

// readbyId api
const readById = async (req, res) => {
  try {
    const id = req.params.id;
    product = await ProductModel.findById(id).populate([
      "categoryId",
      "brandId",
      "colorId",
    ]);
    if (product) {
      return sendSuccess(res, "Product Found Successfully", product, {
        image: "https://ishop-backend-2mld.onrender.com/product"
      });
    }
    // const data = sendSuccess(res, "Product find succesfully", data);
  } catch (error) {
    sendServerError(res);
  }
};

// readbyslug
const readBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await ProductModel.findOne({ slug: slug }).populate([
      "categoryId",
      "brandId",
      "colorId",
    ]);
    if (product) {
      return sendSuccess(res, "Product Found Successfully", product, {
        image: "https://ishop-backend-2mld.onrender.com/product",
      });
    } else {
      return sendNotFound(res, "Product not found");
    }
  } catch (error) {
    // console.log(error)
    sendServerError(res, error.message);
  }
};

// Delete By Id

const deleteById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deleted = await ProductModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Brand not found" });
    }

    return sendDelete(res, "deleted succesfully");
  } catch (error) {
    // console.error("DELETE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// delete images

const deleteImage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { image_name } = req.body;
    // console.log(image_name);

    const product = await ProductModel.findOne({ slug });
    if (!product) {
      return sendBadReaquest(res, "Product not found");
    }

    // Remove image from DB array
    await ProductModel.findOneAndUpdate(
      { slug },
      { $pull: { images: image_name } },
      { new: true },
    );

    // Delete file from storage
    fs.unlink(`./public/product/${image_name}`, (error) => {
      if (error) {
        return sendBadReaquest(res, "Unable to delete image");
      }
      return sendSuccess(res, "Image deleted successfully");
    });
  } catch (error) {
    return sendServerError(res, "Internal server error");
  }
};

// update status

const updateById = async (req, res) => {
  try {
    const { feild } = req.body;
    const id = req.params.id;
    const category = await ProductModel.findById(id);
    if (!category) {
      return sendNotFound(res);
    }
    const feilds = [
      "is_best",
      "is_top",
      "status",
      "stock",
      "is_popular",
      "is_home",
      "is_hot",
      "is_return",
    ];
    if (!feilds.includes(feild)) {
      return sendBadReaquest(res);
    }
    const newRecord = await ProductModel.findByIdAndUpdate(
      id,
      {
        [feild]: !category[feild],
      },
      { new: true },
    );

    sendupdate(res, "status updated successfully", newRecord);
  } catch (error) {
    // console.log(error);
    return sendServerError(res);
  }
};

// updateDataBySlug
const updateDataBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      name,
      slug: newSlug,
      categoryId,
      brandId,
      discount_percentage,
      final_price,
      original_price,
      short_description,
      long_description,
    } = req.body;

    // console.log(req?.body?.name);
    const images = req.files?.images;
    const thumbnailFile = req.files?.thumbnail;

    if (
      !name ||
      !categoryId ||
      !brandId ||
      !short_description ||
      !long_description
    ) {
      return sendBadReaquest(res, "All fields required");
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return sendBadReaquest(res, "Invalid categoryId");
    }
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return sendBadReaquest(res, "Invalid brandId");
    }

    const product = await ProductModel.findOne({ slug });
    if (!product) {
      return sendNotFound(res, "Product not found");
    }

    if (newSlug) {
      const existproduct = await ProductModel.findOne({ slug: newSlug });
      if (existproduct && existproduct.slug !== slug) {
        return sendConflict(res, "Slug already exists");
      }
    }

    let colorId = [];
    if (req.body.colorId) {
      try {
        colorId =
          typeof req.body.colorId === "string"
            ? JSON.parse(req.body.colorId)
            : req.body.colorId;
        if (!Array.isArray(colorId)) colorId = [colorId];
      } catch (err) {
        return sendBadReaquest(res, "Invalid colorId format");
      }
    }

    // 7. Process multiple images
    let imageNames = product.images;

    if (images) {
      const files = Array.isArray(images) ? images : [images];
      imageNames = [];

      for (const file of files) {
        const imagename = imageName(file.name);
        await file.mv(`./public/product/${imagename}`);
        imageNames.push(imagename);
      }
    }

    // 8. Process thumbnail
    let thumbName = product.thumbnail;

    if (thumbnailFile) {
      thumbName = imageName(thumbnailFile.name);
      await thumbnailFile.mv(`./public/product/${thumbName}`);
    }

    // 9. Create product in database
    const updateObject = {
      name,
      slug: newSlug || slug,
      categoryId,
      brandId,
      colorId,
      long_description,
      short_description,
      final_price,
      discount_percentage,
      original_price,
    };

    if (imageNames.length) {
      updateObject.images = imageNames;
    }

    if (thumbName) {
      updateObject.thumbnail = thumbName;
    }
    // 10. Update product
    const updated = await ProductModel.findOneAndUpdate(
      { slug },
      updateObject,
      { new: true },
    );

    return sendSuccess(res, "Data updated successfully", updated);
  } catch (error) {
    // console.error("Product creation error:", error);
    // Always send an error response to the client
    return sendServerError(res, error.message || "Internal Server Error", 500);
  }
};

module.exports = {
  create,
  read,
  deleteById,
  updateById,
  readById,
  updateDataBySlug,
  readBySlug,
  deleteImage,
};
