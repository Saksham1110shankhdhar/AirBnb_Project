const { validationResult } = require("express-validator");
const User = require('../modules/User');
const bcrypt= require('bcryptjs');
const { passwordValidator, confirmPassword, firstNameValidator, lastNameValidator, emailValidator, UserValidator, termAndConditionValidator } = require('./validations');
const { sendEmail } = require('../utils/email-service');

const isProduction = process.env.NODE_ENV === 'production';

const otp_Time_Out=60*1000;

const buildForgotPasswordViewModel = (overrides = {}) => ({
  pageTitle: 'Forgot Password',
  isLoggedIN: false,
  errorMessages: [],
  oldInput: {},
  ...overrides,
});

const buildResetPasswordViewModel = (req, email, overrides = {}) => {
  const debugReset = req.session.resetPasswordDebug;
  const devOtp = !isProduction && debugReset?.email === email ? debugReset.otp : '';
  const infoMessages = devOtp
    ? ['Email delivery is unavailable in local development, so you can use this OTP to finish the reset flow.']
    : [];

  return {
    pageTitle: 'Reset Password',
    isLoggedIN: false,
    email,
    errorMessages: [],
    infoMessages,
    devOtp,
    ...overrides,
  };
};

const getEmailProviderError = (err) => err?.message || 'Unable to send email right now.';



exports.getLogin = (req, res, next) => {
  // provide empty errorMessages so templates that check it won't crash
  res.render("auth/login", { pageTitle: 'Login', isLoggedIN: false, errorMessages: [],  loginRequired: req.query.loginRequired === '1'});
}

exports.getforgotPassword=(req,res,next)=>{
  res.render("auth/forgot", buildForgotPasswordViewModel());
}

exports.getResetPassword=(req,res,next)=>{
  const {email}=req.query;
  res.render("auth/resetPassword", buildResetPasswordViewModel(req, email));
}

exports.postResetPassword=[
  passwordValidator,
  confirmPassword,
  async (req,res,next)=>{
  const {email,otp,password,confirmPassword}=req.body;

  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    return res.status(422).render(
      "auth/resetPassword",
      buildResetPasswordViewModel(req, email, {
        errorMessages: errors.array().map(err => err.msg),
      })
    );
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
    delete req.session.resetPasswordDebug;
    await req.session.save();

    res.redirect('/login');



  }catch(err){
    console.log(err)
    res.render(
      "auth/resetPassword",
      buildResetPasswordViewModel(req, email, {
        errorMessages: [err.message],
      })
    );
  }

}]

exports.postforgotPassword=async (req,res,next)=>{

  const {email}=req.body;
 

  try{
    const user=await User.findOne({email});

    if(!user){
      return res.status(404).render(
        "auth/forgot",
        buildForgotPasswordViewModel({
          errorMessages: ['No account was found with that email address.'],
          oldInput: { email },
        })
      );
    }
    
    const otp=Math.floor(100000+Math.random()*900000).toString();
    user.otp=otp;
    user.otpExpiry=new Date(Date.now()+25*otp_Time_Out);
    await user.save();

    const forgotEmail = {
      to: [{ email }],
      subject:'Here is your otp to reset your password !!!',
      html:`<h1> OTP is ${otp}</h1>
           <p> Enter your OTP on <a href="http://localhost:3000/reset-password?email=${email}">Reset Password</a> page.</p> `
    };

    try{
      await sendEmail({
        to: forgotEmail.to,
        subject: forgotEmail.subject,
        htmlContent: forgotEmail.html,
      });
      delete req.session.resetPasswordDebug;
      await req.session.save();
    }catch(err){
      const providerError = getEmailProviderError(err);
      console.error(`[forgot-password] Failed to send reset email for ${email}: ${providerError}`);

      // Keep the reset flow testable locally even when SendGrid is not configured.
      if(!isProduction){
        req.session.resetPasswordDebug = { email, otp };
        await req.session.save();
        console.warn(`[forgot-password] Development OTP for ${email}: ${otp}`);
      }else{
        user.otp=undefined;
        user.otpExpiry=undefined;
        await user.save();

        return res.status(502).render(
          "auth/forgot",
          buildForgotPasswordViewModel({
            errorMessages: ['We could not send the reset email right now. Please try again in a moment.'],
            oldInput: { email },
          })
        );
      }
    }

    res.redirect(`/reset-password?email=${encodeURIComponent(email)}`);
  }catch(err){
    res.status(500).render(
      "auth/forgot",
      buildForgotPasswordViewModel({
        errorMessages: ['Something went wrong while starting the reset flow. Please try again.'],
        oldInput: { email },
      })
    );

  }
}



exports.getSignUp = (req, res, next) => {
  // always send errorMessages (empty on initial GET)
  res.render("auth/signUp", { pageTitle: 'Sign Up', isLoggedIN: false, errorMessages: [] });
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
      return res.status(422).render("auth/signUp", {
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

       const welcomeEmail = {
         to: [{ email }],
         subject:'Welcome to Hamara AirBnb !!!',
         html:`<h1> Welcome ${firstName} ${lastName} Please Book Your First Vacation Home With us.</h1>`
       };

       try {
         await sendEmail({
           to: welcomeEmail.to,
           subject: welcomeEmail.subject,
           htmlContent: welcomeEmail.html,
         });
       } catch (emailErr) {
         console.error(`[signup] Failed to send welcome email for ${email}: ${getEmailProviderError(emailErr)}`);
       }

       res.redirect("/login");

    }catch(err){
      return res.status(422).render("auth/signUp", {
        pageTitle: 'Sign Up',
        isLoggedIN: false,
        errorMessages:[err.message],
        oldInput: req.body,
      });
    }

    
  }
];

exports.postLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/login");
}
