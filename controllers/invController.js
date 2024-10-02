const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};


/*****************************
 * 
 * Get Vehicle details by ID
 * 
 * ****************************/

invCont.getVehicleDetail = async function(req, res, next){
  try{
    const vehicleId = req.params.id; //get the vehicle ID from the URL
    const vehicle = await invModel.getVehicleById(vehicleId); //call the model to get the vehicle

    if (!vehicle){
      return res.status(404).send("Vehicle not found"); //display vehicle not found to user
    }

    //utilities function to create html
    const vehicleDetailHTML = utilities.buildVehicleDetailHTML(vehicle);
    const nav = await utilities.getNav();

    //render the view with vehicle details
    res.render("./inventory/detail", {
      title: `${vehicle.make} ${vehicle.model}`, vehicleDetailHTML,
      nav,
    });
  }catch(error){
    console.error(error);
    // res.status(500).send("Server Error");
    next(error);
  }
}


module.exports = invCont