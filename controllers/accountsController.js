//require utilities module
const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()


//Deliver login view
async function buildLogin(req, res, next){
        let nav = await utilities.getNav(); //get navigation itemms
        res.render("account/logins", {
            title: "Login",
            nav,
            messages: {
              notice: req.flash('notice'),
            error: req.flash('error')},
            errors: null,
        });
    }

//Deliver registration view
async function buildRegister(req, res, next){
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        // messages: req.flash('error')
    });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  

   // Hash the password before storing
   let hashedPassword
   try {
     // regular password and cost (salt is generated automatically)
     hashedPassword = await bcrypt.hash(account_password, 10)
     console.log("Hashed Password: ", hashedPassword)
   } catch (error) {
    console.error("Error hasing password: ", error);
     req.flash("notice", 'Sorry, there was an error processing the registration.')
     res.status(500).render("account/register", {
       title: "Registration",
       nav,
       errors: null,
     })
   }


    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

 
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/logins", {
        title: "Login",
        nav,
        errors: null
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null
      })
    }
  }

  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  //Get account data by email
  const accountData = await accountModel.getAccountByEmail(account_email)
  
  
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/logins", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })

  }
  try {
    //Compare passwords
   const isMatch = await bcrypt.compare(account_password, accountData.account_password);

   if (isMatch){
   delete accountData.account_password //remove password for security
   const accessToken = jwt.sign({id: accountData.account_id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  
  res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     
   return res.redirect("/account/")
   }else{
    req.flash("notice", "Invalid credentials. Please try again.");
      return res.status(400).render("account/logins", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
   }

  } catch (error) {
    console.error("Login error: ", error);
    req.flash("notice", "An error occurred. Please try again.");
    return res.status(500).render("account/logins", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
  
  
  // let nav = await utilities.getNav()
  // const { account_email, account_password } = req.body
  // const accountData = await accountModel.getAccountByEmail(account_email)
  // if (!accountData) {
  //  req.flash("notice", "Please check your credentials and try again.")
  //  res.status(400).render("account/login", {
  //   title: "Login",
  //   nav,
  //   errors: null,
  //   account_email,
  //  })
  // return
  // }
  // try {
  //  if (await bcrypt.compare(account_password, accountData.account_password)) {
  //  delete accountData.account_password
  //  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
  //  if(process.env.NODE_ENV === 'development') {
  //    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
  //    } else {
  //      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
  //    }
  //  return res.redirect("/account/")
  //  }
  // } catch (error) {
  //  return new Error('Access Forbidden')
  // }
 }

 /* ****************************************
 *  Get Account Management View
 * ************************************ */
async function getAccountManagementView(req, res) {
  let nav = await utilities.getNav();
  res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      flashMessage: req.flash('notice'),
      error: req.flash('error'),
  });
}

module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, getAccountManagementView};