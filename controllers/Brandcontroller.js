const BrandModel = require("../models/BrandModel");
const { imageName } = require("../utils/helper");
const { sendBadReaquest, sendConflict, sendServerError, sendSuccess, sendupdate,sendDelete } = require("../utils/response");



// create api

const create = async (req,res) => {
    try {
        const {name,slug} = req.body;
        // console.log(categoryId)
        // console.log(name,slug,)
        const image = req.files?.image;
        // console.log(image)
        if (!name || !slug || !image) {
            return sendBadReaquest(res, "All fields required");
        }
        
        const existBrand = await BrandModel.findOne({slug})


        if(existBrand) return sendConflict(res,"Brand already exists")
        let categoryId = []
        if(req.body.categoryId){
            categoryId = JSON.parse(req.body.categoryId)
        }
        
      if (!Array.isArray(categoryId) || categoryId.length === 0) {
        return sendBadReaquest(res, "Category required");
      }
        // console.log(categoryId)
        const imagename = imageName(image.name)
        const destination = `./public/brand/${imagename}`;
        image.mv(destination, async (error)=>{
            if(error) return sendServerError(res,"image not uploaded")
            const data = (await BrandModel.create({name,slug,image:imagename,categoryId}))
            return sendSuccess(res,"Brand Created Successfully", data)
        })


    } catch (error) {
        // console.log(error)
    }
}

// read api
const read = async (req,res)=>{
    try {

      const query = req.query
        const filter = {}
        if(query.status) filter.status = query.status === "true";
        if(query.is_home) filter.is_home = query.is_home === "true";
        if(query.is_top) filter.is_top = query.is_top === "true";
        if(query.is_popular) filter.is_popular = query.is_popular === "true";
        if(query.id) filter._id = query._id === "true";
        // console.log(req.body)
        const brand = await BrandModel.find(filter).populate("categoryId");
        const total = await BrandModel.countDocuments()
     
            return sendSuccess(res,"success",brand,{
            total,
            imagebaseurl : "http://localhost:5000/brand/"
            })

    } catch (error) {
       sendServerError(res,"something went wrong")
    }
}





// delete api
const mongoose = require("mongoose");

const deleteById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const deleted = await BrandModel.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Brand not found" });
        }

        return sendDelete(res, "deleted succesfully");

    } catch (error) {
        // console.error("DELETE ERROR:", error);
        return res.status(500).json({ message: error.message });
    }
};



// update by slug

const updateDataBySlug = async (req, res) => {
    try {
      const { slug } = req.params;
      const { name, slug: newSlug,} = req.body;
      let categoryId = []
      if(req.body.categoryId){
          categoryId = JSON.parse(req.body.categoryId)
      }
        
      if (!Array.isArray(categoryId) || categoryId.length === 0) {
        return sendBadReaquest(res, "Category required");
      }
      const image = req.files?.image;
        
      
      if (!name || !slug ) {
        return sendBadReaquest(res, "Name and slug required");
      }
  
      const brand = await BrandModel.findOne({ slug });
      if (!brand) {
        return sendNotFound(res, "brand not found");
      }
  
      if (newSlug) {
        const existBrand = await BrandModel.findOne({ slug: newSlug });
        if (existBrand && existBrand.slug !== slug) {
          return sendConflict(res, "Slug already exists");
        }
      }

      let updateData = {
        name,
        slug: newSlug || slug,
        categoryId
      };

  
      // handle image
      if (image) {
        const imagename = imageName(image.name);
        const destination = `./public/brand/${imagename}`;
  
        await image.mv(destination);
        updateData.image = imagename;
      }
  
      const updated = await BrandModel.findOneAndUpdate(
        { slug },
        updateData,
        { new: true }
      );
  
      return sendupdate(res, "Updated Successfully", updated,{
        imagebaseurl : "http://localhost:5000/brand/"
      });
  
    } catch (error) {
      // console.log(error);
      return sendServerError(res, "Something went wrong");
    }
  };

// read by slug
const readBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;

        const brand = await BrandModel.findOne({slug:slug }).populate("categoryId");

        if (brand) {
            return sendSuccess(res, "success", brand,{
                image:"http://localhost:5000/brand"
            });
        } else {
            return sendNotFound(res, "brand not found");
        }
    } catch (error) {
        return sendServerError(res);
    }
};


module.exports = {create,read,deleteById,updateDataBySlug,readBySlug}