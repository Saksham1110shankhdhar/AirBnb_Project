

const express= require('express');

const storeController=require('../Controllers/StoreController');


const storeRouter=express.Router();


storeRouter.get("/",storeController.getIndex);

storeRouter.get("/homes",storeController.getHomes);

// storeRouter.get("/homes/:homeID",storeController.getHomeDetails);

storeRouter.get("/home/:homeID",storeController.getHomeDetails);

storeRouter.get("/favourites",storeController.getFavourites);

storeRouter.post("/favourites",storeController.postAddFavourites);

storeRouter.post("/favourites/delete/:homeID",storeController.postDeleteFavourites);

storeRouter.get('/rules/:houseID', storeController.getRules);





module.exports=storeRouter;