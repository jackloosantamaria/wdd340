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
router.get('/', utilities.checkLogin, utilities.checkAccountType, invController.buildManagement);

router.get("/add-classification", utilities.handleErrors(invController.addClassification));
router.post("/add-classification", utilities.checkLogin, utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.processAddClassification));

router.get("/add-inventory", utilities.handleErrors(invController.addInventory));
router.post("/add-inventory", utilities.checkLogin, utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.processAddInventory));

router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));
router.post("/update/", utilities.handleErrors(invController.updateInventory));

//New route for delete confirmation


router.get("/delete/:inv_id", utilities.handleErrors(invController.confirmDelete));

//New route to handle deletion

router.post("/delete/:inv_id", utilities.handleErrors(invController.processDelete));




module.exports = router;