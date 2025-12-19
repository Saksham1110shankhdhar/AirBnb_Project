const express = require('express');
const storeRouter = express.Router();

const isAuth = require('../middleware/isAuth');
const storeController = require('../Controllers/storeController');

storeRouter.get('/', storeController.getIndex);

storeRouter.get('/homes', storeController.getHomes);

storeRouter.get('/home/:homeID', isAuth, storeController.getHomeDetails);

storeRouter.get('/favourites', storeController.getFavourites);

storeRouter.post('/favourites', storeController.postAddFavourites);

storeRouter.post('/favourites/delete/:homeID', storeController.postDeleteFavourites);

storeRouter.get('/rules/:houseID', storeController.getRules);

module.exports = storeRouter;
