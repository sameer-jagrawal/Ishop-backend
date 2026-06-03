const categoryModel = require("../models/CategoryModel");
const {sendBadReaquest,sendConflict,sendCreated,sendDelete,sendNotFound,sendServerError,sendSuccess,sendupdate} = require("../utils/response")

// create api
const {cloudinary} = require("../utils/helper");

const create = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const image = req.files?.image;

    if (!name || !slug || !image) {
      return sendBadReaquest(res, "All fields are required");
    }

    const existCategory = await categoryModel.findOne({ slug });

    if (existCategory) {
      return sendConflict(res);
    }

    const uploadedImage = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: "category",
      }
    );

    console.log(uploadedImage.secure_url,uploadedImage.public_id,"hii this cloudinary data")
    const data = await categoryModel.create({
      name,
      slug,
      image: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
    });

    return sendCreated(res, "Created Successfully", data);
  } catch (error) {
    console.log(error);
    return sendServerError(res, "Something went wrong");
  }
};

// read api
const read = async (req,res)=>{
    try {
        // console.log(req.body)
        const query = req.query
        const filter = {}
        const limit = parseInt(query.limit) || 10
        if(query.status) filter.status = query.status === "true";
        if(query.is_home) filter.is_home = query.is_home === "true";
        if(query.is_top) filter.is_top = query.is_top === "true";
        if(query.is_popular) filter.is_popular = query.is_popular === "true";
        if(query.id) filter._id = query._id === "true";


        const category = await categoryModel.find(filter).limit(limit)
        const total = await categoryModel.countDocuments()
        // console.log(category)
        if(category){
            return sendSuccess(res,"success",category,{
            total,
            },{imagebaseurl: "https://ishop-backend-2mld.onrender.com/category"})
        }

    } catch (error) {
       sendServerError(res)
    }
}

// readbyid

const readById = async (req,res)=>{
    try {
        const id = req.params.id 
        const category = await categoryModel.findById(id)
        // console.log(category)
        if(category){
            return sendSuccess(res, "category find", category)
        } 
    } catch (error) {
       sendServerError(res)
    }
}

// read by slug
const readBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;

        const category = await categoryModel.findOne({ slug: slug });

        if (category) {
            return sendSuccess(res, "success", category,{
                image:"https://ishop-backend-2mld.onrender.com/category"
            });
        } else {
            return sendNotFound(res, "Category not found");
        }
    } catch (error) {
        return sendServerError(res);
    }
};

// update api
const updateById = async (req,res)=>{
    try {
        const {feild, value} = req.body;
        const id =  (req.params.id)
        const category = await categoryModel.findById(id)
        if(!category){
            return sendNotFound(res)    
        }
        const feilds = ["is_home","is_top","status","is_popular"]
        if(!feilds.includes(feild)){
            return sendBadReaquest(res)
        }
        const nextValue = typeof value === "boolean" ? value : !category[feild]

        const newRecord = await categoryModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    [feild] : nextValue
                }
            },
            { new: true, runValidators: true }
        )

        sendupdate(res,"updated successfully",newRecord)
    } catch (error) {
        // console.log(error)
        return sendServerError(res,)
    }
}

// update category data 

const updateDataBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
      const { name, slug: newSlug, } = req.body;
      const image = req.files?.image;
      if (!name || !slug) {
        return sendBadReaquest(res, "Name and slug required");
      }
  
      const category = await categoryModel.findOne({ slug });
      if (!category) {
        return sendNotFound(res, "Category not found");
      }
  
      if (newSlug) {
        const existCategory = await categoryModel.findOne({ slug: newSlug });
        if (existCategory && existCategory.slug !== slug) {
          return sendConflict(res, "Slug already exists");
        }
      }
  
      let updateData = {
        name,
        slug: newSlug || slug
      };
  
      if (image) {
        if (category.imagePublicId) {
          await cloudinary.uploader.destroy(category.imagePublicId);
        }

        const uploadedImage = await cloudinary.uploader.upload(
          image.tempFilePath,
          {
            folder: "category",
          }
        );

        updateData.image = uploadedImage.secure_url;
        updateData.imagePublicId = uploadedImage.public_id;
      }
  
      const updated = await categoryModel.findOneAndUpdate(
        { slug },
        updateData,
        { new: true }
      );
      
      
      return sendupdate(res, "Updated Successfully", updated,{
        imagebaseurl : "https://ishop-backend-2mld.onrender.com/category/"
      });
  
    } catch (error) {
      // console.log(error);
      return sendServerError(res, "Something went wrong");
    }
  };


// delete api

const deleteById = async (req,res)=>{
    try {
        const id = req.params.id 
        const category = await categoryModel.findById(id)
        // console.log(category)
        if(category){
           if (category.imagePublicId) {
             await cloudinary.uploader.destroy(category.imagePublicId);
           }
           await categoryModel.findByIdAndDelete(id)
        } 
        sendDelete(res)
    } catch (error) {
       sendServerError(res)
    }
}

module.exports = {
    create,read,updateById,readById,deleteById,readBySlug,updateDataBySlug
}
