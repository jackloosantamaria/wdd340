const pool = require("../database/")

/************************
 * 
 * Register new account
 * 
************************/
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }


  /* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}
  
/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


//Update Account
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try{
    const sql = `
    UPDATE public.account
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4 RETURNING*`;

    const values = [account_firstname, account_lastname, account_email, account_id];
    const result = await pool.query(sql, values);
    return result.rowCount;
  }catch (error){
    console.error("Error updating account: ", error);
    throw error;
  }
}


async function updatePassword(account_id, hashedPassword) {
  const sql = "UPDATE public.account SET account_password = $1 WHERE account_id = $2"; 
  await pool.query(sql, [hashedPassword, account_id]);
}


/******************************
 * Update Profile Image URL
*******************************/
async function updateProfileImage(account_id, account_image) {
  try{
    const sql = "UPDATE public.account SET account_image = $1 WHERE account_id = $2 RETURNING *";
    const values = [account_image, account_id];
    const result = await pool.query(sql, values);
    return result.rowCount;
  }catch(error){
    console.error("Error updating profile image: ", error);
    throw error;
  }
}


async function getAccountById(account_id) {
  
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_image, account_type FROM account WHERE account_id = $1',
      [account_id]
    );
    return result.rows[0]; 
  } catch (error) {
    console.error("Error retrieving account by ID: ", error);
    throw error; 
  }
}




  module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, updateAccount, updatePassword, updateProfileImage, getAccountById}