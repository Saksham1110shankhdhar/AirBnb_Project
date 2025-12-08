const express= require('express');
const authRouter=express.Router();
const authController= require('../Controllers/authController');

authRouter.get('/login',authController.getLogin);
authRouter.post('/login',authController.postLogin);
authRouter.post('/logout',authController.postLogout);
authRouter.get('/signup',authController.getSignUp);
authRouter.post('/signup',authController.postSignUp);
authRouter.get('/forgot-password',authController.getforgotPassword);
authRouter.post('/forgot-password',authController.postforgotPassword);
authRouter.get('/reset-password',authController.getResetPassword);
authRouter.post('/reset-password',authController.postResetPassword);





exports.authRouter= authRouter;