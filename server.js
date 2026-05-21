 require('dotenv').config();
 const express = require("express");
 const cors = require("cors");
 const dns = require('dns');
 dns.setDefaultResultOrder('ipv4first');
 const mongoose = require("mongoose");
 let cookieParser = require('cookie-parser')
 const app = express()
 const allowedOrigins = [
    "http://localhost:3000",
    "https://ishop-frontend-nine.vercel.app",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ].filter(Boolean);
  
  app.use(cors({
    origin: function (origin, callback) {
  
      // allow requests with no origin
      // like mobile apps or postman
      if (!origin) return callback(null, true);
  
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }));
 app.set("trust proxy", 1);
 app.use(express.json());
 app.use(cookieParser());
 app.use(express.static("./public"))
 app.get("/", (req, res) => {
    res.send("Backend is running successfully");
  });
 app.use("/api/category", require("./routers/categoryrouter"))
 app.use("/api/brand", require("./routers/brand.router"))
 app.use("/api/color", require("./routers/color.router"))
 app.use("/api/product", require("./routers/product.router"))
 app.use("/api/user", require("./routers/user.router"))
 app.use("/api/cart", require("./routers/cart.router"))
 app.use("/api/order", require("./routers/order.router"))


//  console.log(process.env.MONGODB_URL,"dotenv")


 mongoose.connect(process.env.MONGODB_URL).then(
    ()=>{
       
        app.listen(
            process.env.PORT,
            ()=>{
                console.log("Database connected")
                console.log("server is running")
            }
        )
        
    }
 ).catch(
    (error)=>{
        console.log("Database not connected")
        console.log(error)
    }
 )