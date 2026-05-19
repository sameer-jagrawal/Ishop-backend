const OrderRouter = require("express").Router();

const { protect } = require("../middleware/auth");

const {orderCreate,paymentVerify,getAllOrders,getSingleOrder} = require("../controllers/Ordercontroller")


OrderRouter.post("/create",protect,orderCreate)
OrderRouter.post("/verifyPayment",protect,paymentVerify)
OrderRouter.get("/",getAllOrders)
OrderRouter.get("/:id",getSingleOrder)






module.exports = OrderRouter;