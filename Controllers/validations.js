const { check} = require('express-validator');


exports.firstNameValidator =
  check('firstName')
    .notEmpty()
    .withMessage('First Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First Name must be at least 2 characters long')
    .matches(/^[a-zA-Z]+$/)
    .withMessage('First Name must contain only letters');

exports.lastNameValidator =
    check('lastName')
      .trim()
      .matches(/^[a-zA-Z]*$/)
      .withMessage('Last Name must contain only letters');

exports.emailValidator=
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail();

exports.passwordValidator=
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

exports.confirmPassword=
    check('confirmPassword')
    .trim()
    .custom((value,{req})=>{
      if(value!==req.body.password){
        throw new Error('Confirm Password does not match with Password ');
      }
      return true;
    });

exports.UserValidator=
    check('role')
    .trim()
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(['guest','host'])
    .withMessage('Account type is invalid');

exports.termAndConditionValidator=
    check('agree')
    .notEmpty()
    .withMessage('Terms and Condition must be accepted');