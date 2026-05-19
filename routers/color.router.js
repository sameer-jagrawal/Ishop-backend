const ColorRouter = require("express").Router();

const {create,read,deleteById,updateStatus} = require("../controllers/Colorcontroller")
const {protect,authorized} = require("../middleware/auth")

ColorRouter.post("/create",protect,authorized(["admin","superAdmin"]),create)
ColorRouter.get("/",read)
ColorRouter.delete("/delete/:id",protect,authorized(["admin","superAdmin"]),deleteById)
ColorRouter.put("/update/:id",protect,authorized(["admin","superAdmin"]),updateStatus)


module.exports = ColorRouter