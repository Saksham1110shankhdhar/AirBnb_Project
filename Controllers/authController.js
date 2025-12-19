const { validationResult } = require("express-validator");
const User = require('../modules/User');
const bcrypt= require('bcryptjs');
const sendGrid= require('@sendgrid/mail');
const { passwordValidator, confirmPassword, firstNameValidator, lastNameValidator, emailValidator, UserValidator, termAndConditionValidator } = require('./validations');

sendGrid.setApiKey(process.env.SEND_GRID_KEY);


const otp_Time_Out=60*1000;



exports.getLogin = (req, res, next) => {
  // provide empty errorMessages so templates that check it won't crash
  res.render("auth/login", { pageTitle: 'Login', isLoggedIN: false, errorMessages: [],  loginRequired: req.query.loginRequired === '1'});
}

exports.getforgotPassword=(req,res,next)=>{
  res.render("auth/forgot", { pageTitle: 'Forgot Password', isLoggedIN: false, errorMessages: [] });
}

exports.getResetPassword=(req,res,next)=>{
  const {email}=req.query;
  res.render("auth/resetPassword", { 
    pageTitle: 'Reset Password', 
    isLoggedIN: false, 
    email:email,
    errorMessages: [],

  });
}

exports.postResetPassword=[
  passwordValidator,
  confirmPassword,
  async (req,res,next)=>{
  const {email,otp,password,confirmPassword}=req.body;

  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    return res.status(422).render("auth/resetPassword", {
      pageTitle: 'Reset Password',
      isLoggedIN: false,
      email:email,
      errorMessages: errors.array().map(err => err.msg),
    });
  }

  try{
    const user=await User.findOne({email});

    if(!user){
      throw new Error('User not found');
    }else if(user.otpExpiry<Date.now()){
      throw new Error('OTP Expired');
    }else if(user.otp!==otp){
      throw new Error('OTP does not match');
    }

    const hasedPassword=bcrypt.hash(password,12);
    user.password=(await hasedPassword).toString();
    user.otp=undefined;
    user.otpExpiry=undefined;

    await user.save();

    res.redirect('/login');



  }catch(err){
    console.log(err)
    res.render("auth/resetPassword", { 
      pageTitle: 'Reset Password', 
      isLoggedIN: false, 
      email:email,
      errorMessages: [err.message],
    });
  }

}]

exports.postforgotPassword=async (req,res,next)=>{

  const {email}=req.body;
 

  try{
    const user=await User.findOne({email});
    
    const otp=Math.floor(100000+Math.random()*900000).toString();
    user.otp=otp;
    user.otpExpiry=Date.now()+25*otp_Time_Out;
    await user.save();

    const ForgotEmail={
      to:email,
      from: process.env.FROM_EMAIL,
      subject:'Here is your otp to reset your password !!!',
      html:`<h1> OTP is ${otp}</h1>
           <p> Enter your OTP on <a href="http://localhost:3000/reset-password?email=${email}">Reset Password</a> page.</p> `
    }

      await sendGrid.send(ForgotEmail);

    res.redirect(`/reset-password?email=${email}`);
  }catch(err){
    res.render("auth/forgot", { pageTitle: 'Forgot Password', isLoggedIN: false, errorMessages: [err.message] });

  }
}



exports.getSignUp = (req, res, next) => {
  // always send errorMessages (empty on initial GET)
  res.render("auth/signup", { pageTitle: 'Sign Up', isLoggedIN: false, errorMessages: [] });
}

exports.postLogin = async (req, res, next) => {
 

 const  {email,password}=req.body;

try{
  const user= await  User.findOne({email});
  if(!user){
    throw new Error('User not found');
  }

  const isMatch= await bcrypt.compare(password,user.password);

  if(!isMatch){
    throw new Error('Password does not match')
  }

  req.session.isLoggedIN = true;
  req.session.user=user;
  await req.session.save();
  res.redirect('/');

}catch(err){
  res.render("auth/login", { pageTitle: 'Login', isLoggedIN: false, errorMessages: [err.message] });
}

}

    


exports.postSignUp = [
  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
  confirmPassword,
  UserValidator,
  termAndConditionValidator,

async (req, res, next) => {
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

    try{

      const hashpassword=await bcrypt.hash(password,12);
      const user = new User({firstName,lastName,email,password :hashpassword,role});

       await user.save();

       const welcomeEmail={
         to:email,
         from: process.env.FROM_EMAIL,
         subject:'Welcome to Hamara AirBnb !!!',
         html:`<h1> Welcome ${firstName} ${lastName} Please Book Your First Vacatiob Home With us.</h1>`
       }

       await sendGrid.send(welcomeEmail);

       res.redirect("/login");

    }catch(err){
      return res.status(422).render("auth/signup", {
        pageTitle: 'Sign Up',
        isLoggedIN: false,
        errorMessages:[err],
        oldInput: req.body,
      });
    }

    
  }
];

exports.postLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/login");
}
