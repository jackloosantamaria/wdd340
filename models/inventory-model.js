const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

// module.exports = {getClassifications}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error ", error);
    return [];
  }
}

/*********************************
 * 
 * 
 * Get vehicle details by ID
 * 
 * *******************************/


async function getVehicleById(vehicleId){
  try{
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      on i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [vehicleId]
    );
    
    if (data.rows.length === 0){
      return null; //return null if vehicle is not found
    }

    return data.rows[0];
  }catch(error){
    console.error("getVehicleById error:", error);
    throw error;
  }
}

/****************************
 * Add a new classification
****************************/

async function addClassification(classification_name) {
  try{
    const query = 'INSERT INTO public.classification (classification_name) VALUES ($1)';
    await pool.query(query, [classification_name]);
  }catch (error){
    console.error("addClassification error: ", error);
    throw error;
  }
}

/************************
 * Add a new vehicle to inventory
************************/

async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id){
  try{
    const query = `INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

    const values = [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id];
    return await pool.query(query, values);
  }catch(error){
    console.error("addInventory error: ", error);
    throw error;
  }
}





module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory};