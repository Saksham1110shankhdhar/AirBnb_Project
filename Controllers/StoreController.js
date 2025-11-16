const Favourite = require('../modules/favourite');
const Home=require('../modules/Home');



exports.getIndex=(req,res,next)=>{

    Home.find().then(registeredHome =>{
        res.render("store/index", {homes:registeredHome, pageTitle:'Hamara Air Bnb'});
    });
}


exports.getHomes=(req,res,next)=>{

    Home.find().then(registeredHome=>{
        res.render("store/home", {homes:registeredHome, pageTitle:'Hamara Air Bnb'});
    });
}

exports.getFavourites=(req,res,next)=>{

    Favourite.fetchAll().then(favouriteIds=>{
        Home.find().then(registeredHome=>{
            favouriteIds= favouriteIds.map(favId=>favId.homeID);

            console.log("All homes:", registeredHome.map(h => ({id: h.id, name: h.houseName})));

            const favouriteHomes=registeredHome.filter(home=>favouriteIds.includes(home._id.toString()));

            console.log("Filtered favourite homes:", favouriteHomes.map(h => ({id: h.id, name: h.houseName})));

            res.render("store/favourites", {homes:favouriteHomes, pageTitle:'favourites'});
        })
    })
}

exports.postAddFavourites=(req,res,next)=>{

    const homeID= req.body.id;
   
    const fav = new Favourite(homeID);

    fav.save().then(()=>{
        res.redirect("/favourites");
    }).catch(err=>{
        console.log("Error while adding to favourite",err);
        res.redirect("/favourites");
    })

  
}

exports.postDeleteFavourites=(req,res,next)=>{
    const homeID= req.params.homeID;
    console.log("Deleting home from favourites, ID:", homeID);

    Favourite.deleteByID(homeID).then(()=>{
        res.redirect("/favourites");
    }).catch(err=>{
        console.log("Error while adding to favourite",err);
        res.redirect("/favourites");
    })
       
}


exports.getHomeDetails=(req,res,next)=>{

    const homeID = req.params.homeID;

    Home.findById(homeID).then(home=>{

            if(!home){
                console.log("Home Not Found");
                return res.redirect("/homes");
            }
    
            res.render("store/home-detail", { home:home,pageTitle:'Home-Detail'});
        
    })

}
