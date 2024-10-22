//importing modules

const regValidate = require('../utilities/account-validation');
const express = require('express');
const router = express.Router();
const {handleErrors} = require('../utilities');
const accountsController = require('../controllers/accountsController');
const utilities = require("../utilities")


//Define GET router for my account
router.get('/', utilities.checkLogin, utilities.handleErrors(accountsController.getAccountManagementView));

//Define GET router for "My Account"
router.get('/login', accountsController.buildLogin);

//Define GET router for "Register"
router.get('/register', accountsController.buildRegister);

router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData, 
    utilities.handleErrors(accountsController.registerAccount))

//Add error handling middleware
// router.use((err, req, res, next) => {
//     handleErrors(err, req, res);
// });


// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountsController.accountLogin)
    // (req, res) => {
    //   res.status(200).send('login process')
    // }
  )


 //Process the logout attempt
 router.get('/logout', utilities.handleErrors(accountsController.logout)); 


//Process to show form of account update
router.get('/account-update', utilities.checkLogin, accountsController.showAccountUpdate);

//Route to process updating the profile image
router.post('/update-profile-image', utilities.checkLogin, utilities.handleErrors(accountsController.updateProfileImage));

//Route to process udpate
router.post('/account/account-update',
    regValidate.updateAccountRules(),
    handleErrors(accountsController.updateAccountController)
);

router.post('/change-password', utilities.checkLogin, utilities.handleErrors(accountsController.changePassword));

module.exports = router;