const UserRouter = require("express").Router();
const {protect} = require("../middleware/auth")
const {
  register,
  verifyOtp,
  login,
  getMe,
  address,
  deleteAddress,
  logOut,
} = require("../controllers/Usercontroller");

UserRouter.post(
  "/register",
  register,
);
UserRouter.post("/verify-otp",verifyOtp);
UserRouter.post("/login",login)
UserRouter.get("/get",protect,getMe)
UserRouter.post("/address",protect,address)
UserRouter.delete("/address/delete/:id",protect,deleteAddress)
UserRouter.post("/logOut",protect,logOut)






module.exports = UserRouter;
