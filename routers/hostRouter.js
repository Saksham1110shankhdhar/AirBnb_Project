const express= require('express');

const hostRouter=express.Router();

const hostController= require('../Controllers/hostController');


hostRouter.get("/add-home",hostController.getAddHome );

//hostRouter.get("/homes",hostController.getAddHome );

hostRouter.get("/host-homes",hostController.getHostHomes );
hostRouter.post("/add-home",hostController.postAddHome);

hostRouter.get('/edit-home/:homeID',hostController.getEditHome);

hostRouter.post('/edit-home',hostController.postEditHome)

hostRouter.post('/delete-home/:homeID',hostController.postDeleteHome);


exports.hostRouter =  hostRouter;