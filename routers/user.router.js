const UserRouter = require("express").Router();
const {protect, authorized} = require("../middleware/auth")
const {
  register,
  verifyOtp,
  login,
  resendOtp,
  forgotPassword,
  resetPassword,
  getMe,
  getAllUsers,
  address,
  setDefaultAddress,
  deleteAddress,
  logOut,
} = require("../controllers/Usercontroller");

UserRouter.post(
  "/register",
  register,
);
UserRouter.post("/verify-otp",verifyOtp);
UserRouter.post("/resend-otp",resendOtp);
UserRouter.post("/forgot-password",forgotPassword);
UserRouter.post("/reset-password",resetPassword);
UserRouter.post("/login",login)
UserRouter.get("/all",protect,authorized("admin","superAdmin"),getAllUsers)
UserRouter.get("/get",protect,getMe)
UserRouter.post("/address",protect,address)
UserRouter.put("/address/default/:id",protect,setDefaultAddress)
UserRouter.delete("/address/delete/:id",protect,deleteAddress)
UserRouter.post("/logOut",logOut)






module.exports = UserRouter;
