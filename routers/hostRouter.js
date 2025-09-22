

const express= require('express');

const hostRouter=express.Router();

const hostController= require('../Controllers/hostController');


hostRouter.get("/add-home",hostController.getAddHome );

hostRouter.get("/homes",hostController.getAddHome );


hostRouter.post("/add-home",hostController.postAddHome);

  exports.hostRouter =  hostRouter;