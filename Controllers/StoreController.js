const Favourite = require('../modules/favourite');
const Home=require('../modules/Home');



exports.getIndex=(req,res,next)=>{

    Home.fetchAll(registeredHome=>{
        res.render("store/index", {homes:registeredHome, pageTitle:'Hamara Air Bnb'});
    });
}

exports.getHomes=(req,res,next)=>{

    Home.fetchAll(registeredHome=>{
        res.render("store/home", {homes:registeredHome, pageTitle:'Hamara Air Bnb'});
    });
}

exports.getFavourites=(req,res,next)=>{

    Favourite.fetchAll(favouriteIds=>{
        console.log("Favourite IDs:", favouriteIds);

        Home.fetchAll(registeredHome=>{
            console.log("All homes:", registeredHome.map(h => ({id: h.id, name: h.houseName})));

            const favouriteHomes=registeredHome.filter(home=>favouriteIds.includes(home.id));
            console.log("Filtered favourite homes:", favouriteHomes.map(h => ({id: h.id, name: h.houseName})));

            res.render("store/favourites", {homes:favouriteHomes, pageTitle:'favourites'});
        })
    })
}

exports.postAddFavourites=(req,res,next)=>{

    const homeID= req.body.id;
    console.log("Adding home to favourites, ID:", homeID);

   Favourite.addToFavourite(homeID, error=>{
    if(error){
        console.log("Error while adding to favourite",error);
    } else {
        console.log("Successfully added home to favourites");
    }

    res.redirect("/favourites");
   })
  
}

exports.postDeleteFavourites=(req,res,next)=>{
    const homeID= req.params.homeID;
    console.log("Deleting home from favourites, ID:", homeID);

    Favourite.deleteByID(homeID,err=>{
        if(err){
            console.log("Error while deleting from favourite",err);
        } else {
            console.log("Successfully deleted home from favourites");
        }
        res.redirect("/favourites");
    })
}


exports.getHomeDetails=(req,res,next)=>{

    const homeID = req.params.homeID;

    Home.findByID(homeID,home=>{

        if(!home){
            console.log("Home Not Found");
            return res.redirect("/homes");
        }

        res.render("store/home-detail", { home:home,pageTitle:'Home-Detail'});
    })

}
