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
const fileUploader = require("express-fileupload");
categoryrouter.post(
  "/create",
  fileUploader({ createParentPath: true }),
  protect,authorized(["admin","superAdmin"]),
  create,
);

categoryrouter.get("/", read);
categoryrouter.get("/:slug", readBySlug);
categoryrouter.delete("/delete/:id",protect,authorized(["admin","superAdmin"]), deleteById)
categoryrouter.put("/update/:id",protect,authorized("admin","superAdmin"), updateById)
categoryrouter.put("/edit/:slug",protect,authorized(["admin","superAdmin"]),fileUploader({ createParentPath: true }),updateDataBySlug,);





module.exports = categoryrouter;
