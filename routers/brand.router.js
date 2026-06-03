const BrandRouter = require("express").Router();
const {protect,authorized} = require("../middleware/auth")
const {
  create,
  read,
  deleteById,
  updateDataBySlug,
  readBySlug,
  updateById
} = require("../controllers/Brandcontroller");
BrandRouter.post(
  "/create",
  protect,authorized("admin","superAdmin"),
  create,
);
BrandRouter.get("/", read);
BrandRouter.get("/:slug", readBySlug);
BrandRouter.delete("/delete/:id",protect,authorized("admin","superAdmin"), deleteById)
BrandRouter.put("/update/:id",protect,authorized("admin","superAdmin"), updateById)
BrandRouter.put("/edit/:slug",protect,authorized("admin","superAdmin"),updateDataBySlug,);





module.exports = BrandRouter;
