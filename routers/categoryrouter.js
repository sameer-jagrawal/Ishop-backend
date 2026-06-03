const categoryrouter = require("express").Router();
const {protect,authorized} = require("../middleware/auth")
const {
  create,
  read,
  deleteById,
  updateDataBySlug,
  readBySlug,
  updateById
} = require("../controllers/categorycotroller");
categoryrouter.post(
  "/create",
  protect,
  authorized("admin", "superAdmin"),
  create
);

categoryrouter.get("/", read);
categoryrouter.get("/:slug", readBySlug);
categoryrouter.delete("/delete/:id",protect,authorized("admin","superAdmin"), deleteById)
categoryrouter.put("/update/:id",protect,authorized("admin","superAdmin"), updateById)
categoryrouter.put("/edit/:slug",protect,authorized("admin","superAdmin"),updateDataBySlug,);





module.exports = categoryrouter;
