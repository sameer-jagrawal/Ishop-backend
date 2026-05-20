const CartModel = require("../models/CartModel")
const OrderModel = require("../models/OrderModel")
const { sendSuccess, sendServerError, sendNotFound } = require("../utils/response")
const Razorpay = require('razorpay');
const crypto = require("crypto");

const instance = new Razorpay({
  key_id: process.env.Test_Key_ID,
  key_secret: process.env.Test_Key_Secret
})

// order create
const orderCreate = async (req, res) => {
    try {
      // console.log(req,"order request")
      const userId = req.user._id;
      const { paymentMethod, address } = req.body;
  
      const userCart = await CartModel.findOne({ userId }).populate({
        path: "items.productId",
        select: "_id final_price",
      });
  
      if (!userCart || userCart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty",
        });
      }
  
      const productDetails = userCart.items.map((item) => {
        const { _id, final_price } = item.productId;
  
        return {
          product_id: _id,
          qty: item.qty,
          price: final_price,
          total: final_price * item.qty,
        };
      });
  
      const total_Amount = productDetails.reduce(
        (sum, item) => sum + item.total,
        0
      );
  
      const order = await OrderModel.create({
        user: userId,
        items: productDetails,
        shippingAddress: address,
        paymentMethod,
        totalAmount: total_Amount,
        paymentStatus: "pending",
      });
  
      // COD
      if (paymentMethod === "cod") {
        return sendSuccess(
          res,
          "Order created successfully",
          {
            orderId: order._id,
          }
        );
      }
  
      // ONLINE PAYMENT
      if (paymentMethod === "online") {
        const options = {
          amount: Math.round(total_Amount * 100),
          currency: "INR",
          receipt: order._id.toString(),
        };

        if (!total_Amount || total_Amount <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid order amount",
          });
        }
  
        let orderRazorpay;

        try {
        
          orderRazorpay = await instance.orders.create(options);
        
        } catch (razorError) {
        
          console.log("RAZORPAY ERROR:", razorError);
        
          return res.status(500).json({
            success: false,
            message:
              razorError?.error?.description ||
              razorError?.message ||
              "Razorpay order creation failed",
          });
        }
        order.razorpay_order_id = orderRazorpay.id;
  
        await order.save();
  
        return sendSuccess(
          res,
          "Payment created successfully",
          {
            orderId: order._id,
            payment_order_Id: orderRazorpay.id,
          }
        );
      }

      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
  
    } catch (error) {
      console.log(error);
  
      return res.status(500).json({
        success: false,
        message: error?.error?.description || error?.message || "Server error",
      });
    }
  };

// payment verify
const paymentVerify = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        const order = await OrderModel.findOne({ razorpay_order_id: razorpay_order_id })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // STEP 1: Create expected signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.Test_Key_Secret)
            .update(body.toString())
            .digest("hex");

        // STEP 2: Compare signatures
        if (expectedSignature === razorpay_signature) {

            // Payment Verified
            // Yaha DB me order update karo (paid = true)
            order.razorpay_payment_id = razorpay_payment_id;
            order.paymentStatus = "paid";
            order.paidAt = new Date();
            await order.save();


            return res.status(200).json({
                success: true,
                message: "Payment Verified Successfully",
                orderId:  order._id

            });


        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Signature",
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// getAllOrders
const getAllOrders = async(req,res) => {
    try {
        const orders = await OrderModel.find()
        .populate("user", "name email") // user details
        .populate("items.product_id", "_id name price thumbnail")
        .sort({ createdAt: -1 });
        
        return sendSuccess(res,"Orders fetched successfully",{orders,imageBaseUrl: "https://ishop-backend-2mld.onrender.com/product/"})
    } catch (error) {
        console.log(error)
        sendServerError(res,)
    }
}

// get singleOrder
const getSingleOrder = async(req,res) => {
    try {
        const {id} = req.params
        const order = await OrderModel.findById(id)
        .populate("user", "name email") // user details
        .populate("items.product_id", "_id name price thumbnail")
        
        if(!order){
            return sendNotFound(res,"order not found")
        }
        
        
        return sendSuccess(res,"Orders fetched successfully",{order,imageBaseUrl:"https://ishop-backend-2mld.onrender.com/product"})
    } catch (error) {
        console.log(error)
        sendServerError(res,)
    }
}


module.exports = {orderCreate,paymentVerify,getAllOrders,getSingleOrder}
