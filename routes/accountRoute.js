//importing modules

const regValidate = require('../utilities/account-validation')
const express = require('express');
const router = express.Router();
const {handleErrors} = require('../utilities');
const accountsController = require('../controllers/accountsController');
const utilities = require("../utilities")

//Define GET router for "My Account"
router.get('/login', accountsController.buildLogin);

//Define GET router for "Register"
router.get('/register', accountsController.buildRegister);

router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData, 
    utilities.handleErrors(accountsController.registerAccount))

//Add error handling middleware
router.use((err, res, next) => {
    handleErrors(err, req, res);
});


// Process the login attempt
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
  )
module.exports = router;