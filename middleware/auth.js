const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const { sendBadReaquest, sendNotFound } = require("../utils/response");
const protect = async (req, res, next) => {
  try {

    let token = null;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // console.log(req.headers.authorization,"user token ")

    if (!token && req.headers.authorization) {
      token = req.headers.authorization;
    }

    if (!token) {
      return sendNotFound(res,"Token is missing ")
    }

    const decoded = jwt.verify(
      token,
      process.env.SECREAT_KEY
    );

  
    req.user = await UserModel.findById(decoded.id).select("-password");
    if (!req.user) {
      return sendNotFound(res, "User not found");
    }

    next(); 

  } catch (error) {
    console.log(error)

    return sendBadReaquest(
      res,
      "Invalid Token"
    );
  }
};


function authorized(...roles) {
  return (req, res, next) => {
    if (!req.user) {
     return sendNotFound(res,"User Not found")
    }
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({
        success:false,
        masg : "Not authorized"
      })
    }

    next();
  };
}

module.exports = { protect, authorized };
