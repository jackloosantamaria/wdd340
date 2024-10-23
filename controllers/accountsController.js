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
   return res.status(400).render("account/logins", {
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
   req.session.user = accountData;
   const accessToken = jwt.sign(
    {id: accountData.account_id,
     account_type: accountData.account_type
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  
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


 /**********************************
  * Process logout request
  * *******************************/

// async function logout(req, res) {
//   req.flash("notice", "You have successfully closed session.");
//   req.session.destroy(() =>{
//     return res.redirect("/");
//   })
// }










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


//show form to update account
async function showAccountUpdate(req, res){
  let nav = await utilities.getNav();
  const accountData = req.session.user;
  console.log('Account Data in showAccountUpdate:', accountData);
  res.render("account/account-update", {
    title: "Update Account",
    nav,
    accountData,
    flashMessage: req.flash('flashMessage'),
    error: req.flash('error')
  });
}

//process update of account
async function updateAccountController(req, res) {
  const {account_id, account_firstname, account_lastname, account_email} = req.body;

  try {
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
  console.log(updateResult);
  if (updateResult){
    
    req.flash('notice', 'Account updated successfully.');
    res.redirect('/account/');

  }else{
    req.flash('error', 'Failed to udpate account.');
    res.redirect('/account/');
  }
}catch (error){
  console.error("Error updating account:", error);
  return res.status(500).send("Error updating account");
}

}

async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;
  const parsedAccountId = parseInt(account_id, 10);

  console.log("account_id from form: ", account_id)

  let hashedPassword;
  try {
      hashedPassword = await bcrypt.hash(account_password,10);
      console.log("Hashed Password: ", hashedPassword);
  } catch (error) {
    console.error("Error hashing password: ", error);
    req.flash("flashMessage", "There was an error changing your password.");
    return res.status(500).render("account/account-update", {
      title: "Update Account",
      nav,
      error: null,
    });
  }

  const updateResult = await accountModel.updatePassword(parsedAccountId, hashedPassword);

  if (updateResult){
    req.flash("flashMessage", "Password has been successfully updated.");
    return res.redirect('/account/account-update');
  }else{
    req.flash("flashMessage", "Change not done.");
    return res.status(501).render("account/account-update",{
      title: "Update Account",
      nav,
      error: null,
    });
  }
}


//Handle logout
function logout (req,res){
  req.flash('notice', 'You have been successfully logged out.');
  req.session.destroy(() =>{
    res.clearCookie('jwt');
    res.redirect('/');
  });
  
}

async function updateProfileImage(req, res) {
  const {account_id, account_image} = req.body;
  console.log("Received data:", req.body);

  try{
    const updateResult = await accountModel.updateProfileImage(account_id, account_image);
    console.log(updateResult);
    if (updateResult){
      req.flash('notice', 'Profile image updated successfully.');
      const updatedAccountData = await accountModel.getAccountById(account_id);
      req.session.user = updatedAccountData;
      console.log('Account Data:', req.session.user);
      res.redirect('/account/');
    }else{
      req.flash('error', 'Failed to update profile image.');
      res.redirect('/account/account-update');
    }
  }catch(error){
    console.error("Error updating profile image: ", error);
    req.flash('error', 'Error updating profile image.');
    return res.status(500).render("account/account-upgrade", {
      title: "Update Account",
      nav: await utilities.getNav(),
      error: req.flash('error')
    })
  }
}


module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, getAccountManagementView, logout, updateAccountController, showAccountUpdate, changePassword, logout, updateProfileImage};