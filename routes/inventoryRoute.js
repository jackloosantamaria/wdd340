// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

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

//New routes for adding classifications
router.get('/', invController.buildManagement);

router.get("/add-classification", invController.addClassification);
router.post("/add-classification", invController.processAddClassification);

router.get("/add-inventory", invController.addInventory);
router.post("/add-inventory", invController.processAddInventory);

router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));
router.post("/update/", utilities.handleErrors(invController.updateInventory));


module.exports = router;