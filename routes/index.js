var express = require('express');
var router = express.Router();
var passport = require("passport");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('secret');
});

/* GET login page. Any flash messages are automatically added. */
router.get('/login', function(req, res, next){
    res.render('login');
});

/* GET signup page */
router.get('/signup', function (req, res, next) {
    res.render('signup');
});

/*POST login to account*/
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/secret',
    failureRedirect: '/login',
    failureFlash: true
}));

/*POST to signup for account*/
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/secret',
  failureRedirect: '/signup',
  failureFlash: true
}));

/*GET the secret page for personal account info*/
router.get('/secret', isLoggedIn, function (req, res, next) {

  res.render('secret', {
      username: req.user.local.username,
      signupDate: req.user.signupDate,
      favorites: req.user.favorites
  });
});

/* GET Logout */
router.get('/logout', function(req, res, next) {
    //passport middleware adds logout function to req object
    req.logout();
    res.redirect('/'); //redirect to home page
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
      next();
    }else {
      res.redirect('/login');
    }
}

/*POST new update made to users information*/
router.post('/saveSecrets', isLoggedIn, function(req, res, next){

    // Check if the user has provided any new data
    if (!req.body.color && !req.body.luckyNumber) {
        req.flash('updateMsg', 'Please enter some new data');
        return res.redirect('/secret')
    }

    //Collect any updated data from req.body, and add to req.user

    if (req.body.color) {
        req.user.favorites.color = req.body.color;
    }
    if (req.body.luckyNumber) {
        req.user.favorites.luckyNumber = req.body.luckyNumber;
    }

    //And save the modified user, to save the new data.
    req.user.save(function(err) {
        if (err) {
            if (err.name == 'ValidationError') {
                req.flash('updateMsg', 'Error updating, check your data is valid');
            }
            else {
                return next(err);  // Some other DB error
            }
        }
        else {
            req.flash('updateMsg', 'Updated data');
        }

        //Redirect back to secret page, which will fetch and show the updated data.
        return res.redirect('/secret');
    })
});
module.exports = router;
