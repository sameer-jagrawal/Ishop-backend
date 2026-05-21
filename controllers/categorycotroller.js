const categoryModel = require("../models/CategoryModel");
const {sendBadReaquest,sendConflict,sendCreated,sendDelete,sendNotFound,sendServerError,sendSuccess,sendupdate} = require("../utils/response")
const {imageName,} = require("../utils/helper")

// create api
const create = async (req,res)=>{
    try {
        // console.log(req.cookies,"cookies")
        const {name,slug} = req.body;
        const image = req.files?.image;
        // console.log(image)
        if(!name || !slug || !image){
            return sendBadReaquest(res,"All feild are required")
        }
        const existCategory =  await categoryModel.findOne({slug});
        if(existCategory){
            return sendConflict(res)
        }
        const imagename = imageName(image.name)
       const destination = `./public/category/${imagename}`;
        image.mv(destination, async(error) =>{
            if(error) return sendServerError (res, "image not upload");
            const data =   await categoryModel.create({name,slug,image:imagename});

             return sendCreated(res,"Created Successfully",data)  
        })
      
    } catch (error) {
        // console.log(error)
        return sendServerError(res, "Something went wrong");
    }
}

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
        const {feild} = req.body;
        const id =  (req.params.id)
        const category = await categoryModel.findById(id)
        if(!category){
            return sendNotFound(res)    
        }
        const feilds = ["is_home","is_top","status","is_popular"]
        if(!feilds.includes(feild)){
            return sendBadReaquest(res)
        }
        const newRecord = await categoryModel.findByIdAndUpdate(
            id,
            {
                [feild] : !category[feild]
            },
            { new: true }
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
  
      // handle image
      if (image) {
        const imagename = imageName(image.name);
        const destination = `./public/category/${imagename}`;
  
        await image.mv(destination);
        updateData.image = imagename;
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
