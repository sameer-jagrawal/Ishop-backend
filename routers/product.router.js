const productRouter = require("express").Router();
const {protect,authorized} = require("../middleware/auth")
const {
  create,
  read,
  deleteById,
  updateById,
  readById,
  updateDataBySlug,
  readBySlug,
  deleteImage
} = require("../controllers/Productcontroller");
const fileUploader = require("express-fileupload");
productRouter.post(
  "/create",
  fileUploader({ createParentPath: true }),
  protect,authorized("admin","superAdmin"),
  create,
);

productRouter.get("/", read)
productRouter.get("/:id", readById )
productRouter.get("/slug/:slug", readBySlug )
productRouter.delete("/delete/:id",protect,authorized("admin","superAdmin"), deleteById )
productRouter.put("/image_delete/:slug",protect,authorized("admin","superAdmin"), deleteImage )
productRouter.put("/update/:id",protect,authorized("admin","superAdmin"), updateById )
productRouter.put("/edit/:slug", fileUploader({ createParentPath: true }),protect,authorized("admin","superAdmin"),updateDataBySlug )



module.exports = productRouter;
