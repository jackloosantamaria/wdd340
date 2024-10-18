const accountModel = require("../models/account-model")
const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}



  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      // body("account_email")
      // .trim()
      // .escape()
      // .notEmpty()
      // .isEmail()
      // .normalizeEmail() // refer to validator.js docs
      // .withMessage("A valid email is required."),
  

      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() 
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),




      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }



  /* ******************************
 * Login Data Validation Rules
 * ***************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty."),
  ];
};




  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

  /* ******************************
 * Check data and return errors or continue to login
 ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/logins", {
          errors,
          title: "Login",
          nav,
          account_email: req.body.account_email, // Preserve email input
      });
      return;
  }
  next();
};


//Check Data and return errors or continue
// async function checkUpdateData(req, res, next){
//   const {inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id} = req.body
//   let errors = []
//   errors = validationResult(req)
//   if (!errors.isEmpty()) {
//     let nav = await utilities.getNav()
//     const classificationList = await utilities.buildClassificationList(classification_id)
//     return res.render("inventory/updateInventory", {
//       errors,
//       title: "Registration",
//       nav,
//       account_firstname,
//       account_lastname,
//       account_email,
//     })
//     return
//   }
//   next()
// }
  
validate.updateAccountRules = () =>{
  return [
    body('account_firstname')
        .trim()
        .notEmpty()
        .withMessage('First name is required.'),

    body('account_lastname')
        .trim()
        .notEmpty()
        .withMessage('Last name is required.'), 

    body('account_email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required.')
        .normalizeEmail(),
];
}


  module.exports = validate