const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel");
const UserModel = require("../models/UserModel");
const CategoryModel = require("../models/CategoryModel");
const BrandModel = require("../models/BrandModel");
const { sendServerError, sendSuccess } = require("../utils/response");

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

const getDashboardData = async (req, res) => {
  try {
    const sevenDaysAgo = startOfDay(new Date());
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      orders,
      totalOrders,
      totalProducts,
      activeProducts,
      totalCustomers,
      totalCategories,
      totalBrands,
      paidOrdersCount,
      pendingPaymentCount,
      deliveredOrdersCount,
      revenueByDay,
      statusBreakdown,
      paymentBreakdown,
    ] = await Promise.all([
      OrderModel.find()
        .populate("user", "name email")
        .populate("items.product_id", "_id name thumbnail final_price")
        .sort({ createdAt: -1 })
        .limit(8),
      OrderModel.countDocuments(),
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ status: true, stock: true }),
      UserModel.countDocuments({ role: "user" }),
      CategoryModel.countDocuments(),
      BrandModel.countDocuments(),
      OrderModel.countDocuments({ paymentStatus: "paid" }),
      OrderModel.countDocuments({ paymentStatus: "pending" }),
      OrderModel.countDocuments({ orderStatus: "delivered" }),
      OrderModel.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      OrderModel.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      OrderModel.aggregate([
        { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const revenueStats = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    const revenue = revenueStats[0] || {};

    return sendSuccess(res, "Dashboard data fetched successfully", {
      stats: {
        totalRevenue: revenue.totalRevenue || 0,
        averageOrderValue: revenue.averageOrderValue || 0,
        totalOrders,
        totalProducts,
        activeProducts,
        totalCustomers,
        totalCategories,
        totalBrands,
        paidOrdersCount,
        pendingPaymentCount,
        deliveredOrdersCount,
      },
      recentOrders: orders,
      charts: {
        revenueByDay,
        statusBreakdown,
        paymentBreakdown,
      },
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return sendServerError(res, error.message || "Internal Server Error");
  }
};

module.exports = { getDashboardData };
