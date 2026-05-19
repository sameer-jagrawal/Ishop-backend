const UserModel = require("../models/UserModel")
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECREAT_KEY)
const { sendBadReaquest, sendConflict, sendCreated, sendNotFound, sendServerError, sendSuccess } = require("../utils/response");
const sendOtpMail = require("../utils/sendOtpMail");
const generateToke = require("../utils/jwt")


// create api
const register = async (req,res) => {
    try {
      const {name , email, password } = req.body;
      
      if(!name || !email || !password) {
        return sendBadReaquest(res,"All feilds required")
      }

      const existuser = await UserModel.findOne({email})
      
      if(existuser){
         return sendConflict(res,"User with this email already exists")
      }

      
    const encryptedPassword = cryptr.encrypt(password)
    const otp = Math.floor(100000 + Math.random() * 900000)
    const otpExpiry = Date.now() + 3 * 60 * 1000
    const user = await UserModel.create({name,email,password :encryptedPassword, otp, otpExpiry})
    const mailRes = await sendOtpMail(email,otp)
    console.log(mailRes,"sameer")

      return sendCreated(res,"User Created succesfully", {name:user.name, email:user.email, id : user._id})

    } catch (error) {
        console.log(error)
        return sendServerError(res, "Internal Server Error")
    }
}

// verifyOtp 
const verifyOtp = async (req,res) => {
  try {
    const {email,otp} = req.body;
    const user = await UserModel.findOne({email});
    if(!user) {
     return  sendNotFound(res,"User not Found")
    }
    if(user.isVerified){
      return sendBadReaquest(res,"Email is already verified")
    }
    if(user.otp !== parseInt(otp) || user.otpExpiry <Date.now()){
      return sendBadReaquest(res,"otp not valid")
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.save()
    return sendSuccess(res)
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
}

// Login
const login = async (req,res) => {
  try {
    const { email, password } = req.body;
    console.log(password,"values")
    
    if(  !email || !password) {
      return sendBadReaquest(res,"All feilds required")
    }

    const user = await UserModel.findOne({email})
    
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

  const decryptedPassword = cryptr.decrypt(userPassword);

  if(decryptedPassword !== password) {
    return sendBadReaquest(res,"Invalid Password")
  }

  const token = generateToke(user._id)
  
  res.cookie('jwt', token, {
    maxAge: 30*24*60*60*1000, // 1 hour
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  });
  
    return sendSuccess(res,`Welcome Back ${user.name}`,{id:user._id, name:user.name, email:user.email,role:user.role})

  } catch (error) {
      console.log(error)
      return sendServerError(res, "Internal Server Error")
  }
}

// resendOtp 
const resendOtp = async(req,res) => {
  try {
    const {email} = req.body;
    const user = await UserModel.findOne(email);
    if(!user) {
      return sendNotFound(res,"user not found")
    }
    const otp = Math.floor(100000 + Math.random() * 900000)
    const otpExpiry = Date.now() + 3 * 60 * 1000
    user.save()
    const mailRes = await sendOtpMail(email,otp);
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
    res.cookie('jwt')
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
    sendSuccess(res,"Address added successfully",{address:user.address})

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

module.exports = {register,verifyOtp,login,getMe,address,deleteAddress}