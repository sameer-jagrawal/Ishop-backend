const BrandRouter = require("express").Router();
const {protect,authorized} = require("../middleware/auth")
const {
  create,
  read,
  deleteById,
  updateDataBySlug,
  readBySlug
} = require("../controllers/Brandcontroller");
const fileUploader = require("express-fileupload");
BrandRouter.post(
  "/create",
  fileUploader({ createParentPath: true }),
  protect,authorized("admin","superAdmin"),
  create,
);
BrandRouter.get("/", read);
BrandRouter.get("/:slug", readBySlug);
BrandRouter.delete("/delete/:id",protect,authorized("admin","superAdmin"), deleteById)
BrandRouter.put("/edit/:slug",fileUploader({ createParentPath: true }),protect,authorized("admin","superAdmin"),updateDataBySlug,);





module.exports = BrandRouter;
