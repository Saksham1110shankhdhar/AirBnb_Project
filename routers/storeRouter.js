

const express= require('express');

const storeController=require('../Controllers/StoreController');


const storeRouter=express.Router();


storeRouter.get("/",storeController.getHome);

storeRouter.get("/homes",storeController.getHome);

module.exports=storeRouter;