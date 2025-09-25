

const express= require('express');

const storeController=require('../Controllers/StoreController');


const storeRouter=express.Router();


storeRouter.get("/",storeController.getIndex);

storeRouter.get("/homes",storeController.getHomes);

// storeRouter.get("/homes/:homeID",storeController.getHomeDetails);

storeRouter.get("/home/:homeID",storeController.getHomeDetails);

module.exports=storeRouter;