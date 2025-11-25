const express= require('express');
const authRouter=express.Router();
const authController= require('../Controllers/authController');

authRouter.get('/login',authController.getLogin);
authRouter.post('/login',authController.postLogin);



exports.authRouter= authRouter;