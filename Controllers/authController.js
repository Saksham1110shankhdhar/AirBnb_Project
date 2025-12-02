const { check, validationResult } = require('express-validator');
const User = require('../modules/User')

exports.getLogin = (req, res, next) => {
  // provide empty errorMessages so templates that check it won't crash
  res.render("auth/login", { pageTitle: 'Login', isLoggedIN: false, errorMessages: [] });
}

exports.getSignUp = (req, res, next) => {
  // always send errorMessages (empty on initial GET)
  res.render("auth/signup", { pageTitle: 'Sign Up', isLoggedIN: false, errorMessages: [] });
}

exports.postLogin = (req, res, next) => {
  req.session.isLoggedIN = true;
  res.redirect("/");
}

const firstNameValidator =
  check('firstName')
    .notEmpty()
    .withMessage('First Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First Name must be at least 2 characters long')
    .matches(/^[a-zA-Z]+$/)
    .withMessage('First Name must contain only letters');

const lastNameValidator =
    check('lastName')
      .trim()
      .matches(/^[a-zA-Z]*$/)
      .withMessage('Last Name must contain only letters');

const emailValidator=
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail();

const passwordValidator=
     check('password')
     .trim()
     .isLength({ min: 6 })
     .withMessage('Password must be at least 6 characters long')
     .matches(/[a-z]/)
     .withMessage('Password should have atleast one small alphabate')
     .matches(/[A-Z]/)
     .withMessage('Password should have atleast one capital alphabate')
     .matches(/[@#$%&]/)
     .withMessage('Password should have atleast one special character');

const confirmPassword=
    check('confirmPassword')
    .trim()
    .custom((value,{req})=>{
      if(value!==req.body.password){
        throw new Error('Confirm Password does not match with Password ');
      }
      return true;
    })   

const UserValidator=
    check('role')
    .trim()
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(['guest','host'])
    .withMessage('Account type is invalid')

const termAndConditionValidator=
    check('agree')
    .notEmpty()
    .withMessage('Terms and Condition must be accepted')
    


exports.postSignUp = [
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
  confirmPassword,
  UserValidator,
  termAndConditionValidator,

  (req, res, next) => {
    console.log("user came to sign up :", req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: 'Sign Up',
        isLoggedIN: false,
        errorMessages: errors.array().map(err => err.msg),
        oldInput: req.body,
      });
    }
    const {firstName,lastName,email,password,role}=req.body;

    const user = new User({firstName,lastName,email,password,role});

    user.save().then(result=>{
      console.log(result);
      res.redirect("/login");
    }).catch(err=>{
      return res.status(422).render("auth/signup", {
        pageTitle: 'Sign Up',
        isLoggedIN: false,
        errorMessages:[err],
        oldInput: req.body,
      });
    })

   
  }
];

exports.postLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/login");
}
