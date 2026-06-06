const UserModel = require("../models/UserModel")
const PendingUserModel = require("../models/PendingUserModel")
const Cryptr = require('cryptr');
const { requireAuthSecret } = require("../utils/secrets");
const cryptr = new Cryptr(requireAuthSecret())
const { sendBadReaquest, sendConflict, sendCreated, sendNotFound, sendServerError, sendSuccess } = require("../utils/response");
const sendOtpMail = require("../utils/sendOtpMail");
const generateToke = require("../utils/jwt")
const {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
} = require("../utils/authCookie");


// create api
const register = async (req,res) => {
    try {
      const {name , email, password } = req.body;
      const normalizedEmail = email?.toLowerCase().trim();
      
      if(!name || !normalizedEmail || !password) {
        return sendBadReaquest(res,"All feilds required")
      }

      const existuser = await UserModel.findOne({email: normalizedEmail})
      
      if(existuser?.isVerified){
         return sendConflict(res,"User with this email already exists")
      }

      if(existuser && !existuser.isVerified){
        await UserModel.deleteOne({_id: existuser._id})
      }
      
    const encryptedPassword = cryptr.encrypt(password)
    const otp = Math.floor(100000 + Math.random() * 900000)
    const otpExpiry = Date.now() + 3 * 60 * 1000
    const pendingUser = await PendingUserModel.findOneAndUpdate(
      { email: normalizedEmail },
      { name, email: normalizedEmail, password: encryptedPassword, otp, otpExpiry },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    )
    await sendOtpMail(normalizedEmail,otp)

      return sendCreated(res,"OTP sent successfully", {name:pendingUser.name, email:pendingUser.email})

    } catch (error) {
        console.error("Register error:", {
          message: error.message,
          code: error.code,
          name: error.name,
        })

        if (error.code === 11000) {
          return sendConflict(res, "User with this email already exists")
        }

        return sendServerError(res, error.message || "Internal Server Error")
    }
}

// verifyOtp 
const verifyOtp = async (req,res) => {
  try {
    const {email,otp} = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const pendingUser = await PendingUserModel.findOne({email: normalizedEmail});
    if(!pendingUser) {
      const verifiedUser = await UserModel.findOne({email: normalizedEmail});
      if(verifiedUser?.isVerified){
        return sendBadReaquest(res,"Email is already verified")
      }
     return  sendNotFound(res,"Registration request not found. Please register again")
    }
    if(pendingUser.otp !== parseInt(otp) || pendingUser.otpExpiry < Date.now()){
      return sendBadReaquest(res,"otp not valid")
    }

    const existingVerifiedUser = await UserModel.findOne({email: normalizedEmail});
    if(existingVerifiedUser?.isVerified){
      await PendingUserModel.deleteOne({_id: pendingUser._id});
      return sendConflict(res,"User with this email already exists")
    }

    if(existingVerifiedUser && !existingVerifiedUser.isVerified){
      await UserModel.deleteOne({_id: existingVerifiedUser._id});
    }

    const user = await UserModel.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified: true,
    });

    await PendingUserModel.deleteOne({_id: pendingUser._id});
    return sendSuccess(res,"Email verified successfully",{id:user._id,email:user.email,name:user.name})
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
}

// Login
const login = async (req,res) => {
  try {
    const { email, password } = req.body;
    // console.log(password,"values")
    
    if(  !email || !password) {
      return sendBadReaquest(res,"All feilds required")
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({email: normalizedEmail})
    
    if(!user){
      return sendNotFound(
         res,
         "User not found"
      )
   }
   
   if(user.isVerified === false){
      return sendBadReaquest(
         res,
         "Please verify your email first"
      )
   }

  const userPassword  = user.password

  let decryptedPassword;

  try {
    decryptedPassword = cryptr.decrypt(userPassword);
  } catch (error) {
    console.log("Password decrypt failed:", error.message);
    return sendBadReaquest(res, "Invalid Password");
  }

  if(decryptedPassword !== password) {
    return sendBadReaquest(res,"Invalid Password")
  }

  const token = generateToke(user._id)
  
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  
    return sendSuccess(res,`Welcome Back ${user.name}`,{
      id:user._id,
      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role,
      token,
    })

  } catch (error) {
      console.log(error)
      return sendServerError(res, "Internal Server Error")
  }
}

// resendOtp 
const resendOtp = async(req,res) => {
  try {
    const {email} = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const pendingUser = await PendingUserModel.findOne({email: normalizedEmail});
    if(!pendingUser) {
      return sendNotFound(res,"Registration request not found. Please register again")
    }
    const otp = Math.floor(100000 + Math.random() * 900000)
    const otpExpiry = Date.now() + 3 * 60 * 1000
    pendingUser.otp = otp
    pendingUser.otpExpiry = otpExpiry
    await pendingUser.save()
    await sendOtpMail(normalizedEmail,otp);
    return sendSuccess(res,"otp resend successfully")

  } catch (error) {
    return sendServerError(res)
  }
}

// getMe
const getMe = (req,res) => {
  try {
    const user = req.user
    sendSuccess(res,"user find successfully",user)
   
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
}

//logOut
const logOut = (req,res) => {
  try {
    res.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions())
    return sendSuccess(res,"User Logout Succesfully")
   
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
}

// address
const address = async (req,res) => {
  try {

    const user_id = req.user._id

    const address  = req.body;
    const user = await UserModel.findById(user_id)
    user.addresses.push(address)
    
    await user.save();
    sendSuccess(res,"Address added successfully",{addresses:user.addresses})

  } catch (error) {
    console.log(error)
    sendServerError(res,)
  }
}

// deleteAddress 

const deleteAddress = async(req,res) => {
  try {
    console.log(req.body,"user address delete")
    const user = req.user;

    const addressId = req.params.id;

    user.addresses = user.addresses.filter((item)=>(item._id.toString() !== addressId));
    
    await  user.save()

    return sendSuccess(res,"Address deleted Successfully",user.addresses)

  } catch (error) {
    console.log(error)
    sendServerError(res)
  }
}

module.exports = {register,verifyOtp,login,resendOtp,getMe,address,deleteAddress,logOut}
