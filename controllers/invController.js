const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

//function to create Build Management

invCont.buildManagement = async (req, res) =>{
  const nav = await utilities.getNav();

  res.render('inventory/management', {
    title: 'Vehicle Management',
    nav,
    errors: null
  })
}

//Function to show view of add classification
invCont.addClassification = async (req, res) => {
  const nav = await utilities.getNav();
  res.render('inventory/add-classification', {
    title: 'Add New Classification',
    nav,
    messages: req.flash('info'),
    errors: null
  });

};


//function to process add classification
invCont.processAddClassification = async (req, res) => {
  const { classification_name } = req.body;

  if (!/^[^\s`~!@#$%^&*()_+\-={}|[\]\\:";'<>?,.\/]+$/.test(classification_name)){
    req.flash('info', 'Classification name cannot contain spaces or special characters.');
    return res.redirect('/inv/add-classification');
  }

  try {
    await invModel.addClassification(classification_name);
    req.flash('info', 'Classification added successfully!');
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: await utilities.getNav(),
      errors: null});
  }catch (error){
    req.flash('info', 'Failed to add classification. Please try again.');
    res.redirect('/inv/add-classification');
  }
}

//function to show the add inventory view
invCont.addInventory = async (req, res) => {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  console.log('classificationList:',classificationList);
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    classificationList,
    nav,
    messages: req.flash('info'),
    errors: null,
    
  });
  
};


//function to process the add inventory
invCont.processAddInventory = async (req,res) => {
  const nav = await utilities.getNav();
  const {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id} = req.body
  console.log("Forms Inputs: ", {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id});
  // const classification_id = getDefaultClassificationId();

  try{
    await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
    req.flash('info', 'Vehicle added succesfully!');
    res.redirect('/inv');
  } catch(error){
    console.error(error);
    req.flash('info', 'Failed to add vehicle. Please try again.');
    res.redirect('/inv/add-inventory');
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  console.log("Classification ID:", classification_id);
  const data = await invModel.getInventoryByClassificationId(classification_id)

  if (!data || data.length === 0) {
    return res.status(404).send("No inventory found for this classification.");
  }


  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null
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