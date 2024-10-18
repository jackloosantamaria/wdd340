const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

//function to create Build Management

invCont.buildManagement = async (req, res) =>{
  console.log("User Session:", req.session.user);
  const user = req.session.user
  if (!user || (user.account_type !== 'Admin' && user.account_type !== 'Employee')){
    req.flash('error', 'You do not have permission to access this page.');
    return res.redirect('/account/login')
  }

  const nav = await utilities.getNav();

  const classificationSelect = await utilities.buildClassificationList()
  console.log("Classification Select HTML:", classificationSelect);
  res.render('inventory/management', {
    title: 'Vehicle Management',
    nav,
    classificationSelect,
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

    //res.status(404).send("No inventory found for this classification.");
    let nav = await utilities.getNav(); // Get navigation
        return res.render("./inventory/no-inventory", { // Render a 'no inventory' view
            title: "No Inventory Found",
            nav,
            errors: null,
            message: "No inventory found for this classification." // Custom message
        });
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


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id); 
  console.log("Requested Inventory ID:", inv_id)
  let nav = await utilities.getNav();

  try {
      const itemData = await invModel.getVehicleById(inv_id);
      if (!itemData) {
          return res.status(404).send("Vehicle not found"); 
      }

      const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
      const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
      const classificationList = await utilities.buildClassificationList(itemData.classification_id);

      res.render("./inventory/updateInventory", { 
          title: "Edit " + itemName,
          nav,
          classificationSelect,
          classificationList,
          errors: null,
          messages: req.flash('info') || [],
          inv_id: itemData.inv_id,
          inv_make: itemData.inv_make,
          inv_model: itemData.inv_model,
          inv_year: itemData.inv_year,
          inv_description: itemData.inv_description,
          inv_image: itemData.inv_image,
          inv_thumbnail: itemData.inv_thumbnail,
          inv_price: itemData.inv_price,
          inv_miles: itemData.inv_miles,
          inv_color: itemData.inv_color,
          classification_id: itemData.classification_id
      });
  } catch (error) {
      console.error("Error fetching inventory item:", error);
      next(error);
  }
};


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

//Build and deliver the delete confirmation view
invCont.confirmDelete = async (req, res) => {
  const inv_id = parseInt(req.params.inv_id);
  const nav = await utilities.getNav();

  try{
    const inventoryItem = await invModel.getVehicleById(inv_id);
    if (!inventoryItem) {
      return res.status(404).send("Vehicle not found");
    }

    const name = `${inventoryItem.inv_make} ${inventoryItem.inv_model}`;

    res.render("inventory/delete-confirm", {
      title: `Confirm Deletetion of ${name}`,
      nav,
      messages: req.flash('info'),
      inv_make: inventoryItem.inv_make,
      inv_model: inventoryItem.inv_model,
      inv_year: inventoryItem.inv_year,
      inv_price: inventoryItem.inv_price,
      inv_id: inventoryItem.inv_id
    });
  }catch (error){
    console.log(error);
    next(error);
  }
}


//process the deletion of the inventory item
invCont.processDelete = async (req, res) => {
  const inv_id = parseInt(req.body.inv_id);

  try{
    const result = await invModel.deleteInventoryItem(inv_id)

    if (result){
      req.flash("info", "The item has been deleted successfully.");
      res.redirect("/inv");
    }else{
      req.flash("error", "Failed to delete the item. Please try again.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  }catch (error){
    console.error(error);
    req.flash("error", "An error occurred while trying to delete the item.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
}

module.exports = invCont