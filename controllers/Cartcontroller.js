const CartModel = require("../models/CartModel")
const { sendSuccess,sendServerError, sendNotFound } = require("../utils/response")

//syncing cart
const cartSync = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendServerError(res, "Unauthorized user");
    }

    // Parse local cart safely
    let localCart = [];

    try {
      localCart = JSON.parse(req.body.localCart || "[]");
    } catch (err) {
      return sendServerError(res, "Invalid cart data");
    }

    // Ensure array
    if (!Array.isArray(localCart)) {
      return sendServerError(res, "Cart must be an array");
    }

    // Find user cart WITHOUT populate first
    let userCart = await CartModel.findOne({ userId });

    // Create empty cart if not exists
    if (!userCart) {
      userCart = new CartModel({
        userId,
        items: [],
      });
    }

    // =========================
    // FETCH SERVER CART ONLY
    // =========================
    if (localCart.length === 0) {

      await userCart.populate({
        path: "items.productId",
        select:
          "name _id original_price final_price discount_percentage price thumbnail stock",
      });

      // Remove broken items
      const validItems = userCart.items.filter(
        (item) => item.productId
      );

      return sendSuccess(
        res,
        "Fetched cart from server",
        {
          cart: validItems,
        }
      );
    }

    // =========================
    // MERGE LOCAL CART
    // =========================

    for (const cartItem of localCart) {

      // Validate cart item
      if (!cartItem || typeof cartItem !== "object") {
        continue;
      }

      const {
        _id,
        qty
      } = cartItem;

      // Validate product id
      if (!_id) {
        console.log("Invalid cart item productId:", cartItem);
        continue;
      }

      // Validate qty
      const parsedQty = Number(qty);

      if (isNaN(parsedQty) || parsedQty <= 0) {
        console.log("Invalid qty:", cartItem);
        continue;
      }

      // Find existing cart item
      const existCart = userCart.items.find((item) => {

        if (!item.productId) return false;
      
        return (
          item.productId.toString() ===
          _id.toString()
        );
      });
      
      if (existCart) {
      
        // Prevent qty doubling
        existCart.qty = Math.max(
          existCart.qty,
          parsedQty
        );
      
      } else {
      
        userCart.items.push({
          productId: _id,
          qty: parsedQty,
        });
      }

      // Increase qty if exists
      // if (existCart) {

      //   existCart.qty = Math.max(
      //     existCart.qty,
      //     parsedQty
      //   );
      // } else {

      //   // Push new item
      //   userCart.items.push({
      //     productId: _id,
      //     qty: parsedQty,
      //   });
      // }
    }

    // Remove corrupted items before save
    userCart.items = userCart.items.filter(
      (item) => item.productId
    );

    // Save updated cart
    await userCart.save();

    // Populate AFTER save
    await userCart.populate({
      path: "items.productId",
      select:
        "name _id original_price final_price discount_percentage price thumbnail stock",
    });

    // Remove deleted products
    const validItems = userCart.items.filter(
      (item) => item.productId
    );

    return sendSuccess(
      res,
      "Cart synced successfully",
      {
        cart: validItems,
        imageBaseUrl: "http://localhost:5000/product/"
      }
    );

  } catch (error) {

    console.log("Cart Sync Error:", error);

    return sendServerError(
      res,
      "Something went wrong while syncing cart"
    );
  }
};


const updateQty = async (req, res) => {
  console.log(req.body)
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendServerError(res, "Unauthorized user");
    }

    const { _id, flag } = req.body;

    if (!_id) {
      return sendServerError(res, "Product id is required");
    }

    if (!["inc", "dec"].includes(flag)) {
      return sendServerError(res, "Invalid flag");
    }

    let userCart = await CartModel.findOne({ userId });

    if (!userCart) {
      return sendServerError(res, "Cart not found");
    }

    const existingItem = userCart.items.find(
      (item) =>
        item.productId?.toString() === _id.toString()
    );

    if (!existingItem) {
      return sendServerError(res, "Item not found in cart");
    }

    // INCREASE
    if (flag === "inc") {
      existingItem.qty += 1;
    }

    // DECREASE
    if (flag === "dec") {
      existingItem.qty -= 1;

      // REMOVE ITEM IF QTY <= 0
      if (existingItem.qty <= 0) {
        userCart.items = userCart.items.filter(
          (item) =>
            item.productId?.toString() !== _id.toString()
        );
      }
    }

    await userCart.save();

    await userCart.populate({
      path: "items.productId",
      select:
        "name _id original_price final_price discount_percentage price thumbnail stock",
    });

    const validItems = userCart.items.filter(
      (item) => item.productId
    );

    return sendSuccess(
      res,
      "Quantity updated successfully",
      {
        cart: validItems,
      }
    );
  } catch (error) {
    console.log("Update Qty Error:", error);

    return sendServerError(
      res,
      "Something went wrong while updating quantity"
    );
  }
};


const deleteById = async (req, res) => {
  try {

    const userId = req.user._id
    if (!userId) {
      return sendServerError(res, "Unauthorized user");
    }
    let userCart = await CartModel.findOneAndDelete({userId})

    if (!userCart) {
      return sendNotFound(res, "Cart not found");
    }

    return sendSuccess(res, "deleted succesfully");


  } catch (error) {
    // console.error("DELETE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};


const addToCart = async (req, res) => {
  try {

    const userId = req.user._id

    const { productId, qty } = req.body

    // Find existing cart
    let cart = await CartModel.findOne({ userId })

    // Create cart if not exists
    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [],
      })
    }

    // Check if product already exists
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    )

    if (existingItem) {

      // Increase quantity
      existingItem.qty += qty

    } else {

      // Add new item
      cart.items.push({
        productId,
        qty,
      })
    }

    await cart.save()

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: cart,
    })

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {cartSync,updateQty,deleteById,addToCart}