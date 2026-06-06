 require('dotenv').config();
 const express = require("express");
 const cors = require("cors");
 const dns = require('dns');
 const http = require("http");
const { Server } = require("socket.io");
 dns.setDefaultResultOrder('ipv4first');
 const mongoose = require("mongoose");
 let cookieParser = require('cookie-parser')
 const fileUpload = require("express-fileupload");
 const app = express()
 const envOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
    process.env.VERCEL_FRONTEND_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);

 const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ishop-frontend-nine.vercel.app",
    ...envOrigins,
  ];

 const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };
  
  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
 
 app.set("trust proxy", 1);
 app.use(express.json());
 app.use(cookieParser());
 app.use(express.static("./public"))
 app.get("/", (req, res) => {
    res.send("Backend is running successfully");
  });
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "tmp",
      createParentPath: true,
    })
  );
 app.use("/api/category", require("./routers/categoryrouter"))
 app.use("/api/brand", require("./routers/brand.router"))
 app.use("/api/color", require("./routers/color.router"))
 app.use("/api/product", require("./routers/product.router"))
 app.use("/api/user", require("./routers/user.router"))
 app.use("/api/cart", require("./routers/cart.router"))
 app.use("/api/order", require("./routers/order.router"))

 app.use((error, req, res, next) => {
    if (error.message?.startsWith("Not allowed by CORS")) {
      return res.status(403).json({
        success: false,
        masg: error.message,
      });
    }

    next(error);
 });


 const server = http.createServer(app);
 const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  global.io = io;

  io.engine.on("connection_error", (err) => {
    console.log("Socket connection error:", err);
  });
  
  io.on("connection", (socket) => {
  
    console.log("Socket connected:", socket.id);
  
    socket.on("join-admin", () => {
  
      console.log("join-admin event received");
  
      socket.join("admin-room");
  
      console.log("Admin joined");
  
    });
  
    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
  
  });

//  console.log(process.env.MONGODB_URL,"dotenv")


 mongoose.connect(process.env.MONGODB_URL).then(
    ()=>{
       
        const PORT = process.env.PORT || 5000;

        server.listen(
            PORT,
            ()=>{
                console.log("Database connected")
                console.log(`server is running on port ${PORT}`)
            }
        )
        
    }
 ).catch(
    (error)=>{
        console.log("Database not connected")
        console.log(error)
    }
 )
