// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//New route to get vehicle details by ID
router.get("/detail/:id", invController.getVehicleDetail);

//New route to trigger a 500 error
router.get("/error500", (req, res, next) =>{
    const error = new Error("This is a test error!");
    error.status = "Server Error";
    next(error);
})

module.exports = router;