const dashboardRouter = require("express").Router();
const { getDashboardData } = require("../controllers/Dashboardcontroller");

dashboardRouter.get("/", getDashboardData);

module.exports = dashboardRouter;
