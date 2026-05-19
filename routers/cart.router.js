const { cartSync, updateQty,deleteById,addToCart} = require("../controllers/Cartcontroller");
const {protect} = require("../middleware/auth")
const CartRouter = require("express").Router();

CartRouter.post("/sync",protect, cartSync);
CartRouter.put("/update-qty",protect, updateQty);
CartRouter.delete("/delete/",protect, deleteById);
CartRouter.post("/add",protect, addToCart);



module.exports = CartRouter