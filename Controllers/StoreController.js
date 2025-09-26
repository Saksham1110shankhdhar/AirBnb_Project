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

        Home.fetchAll(registeredHome=>{

            const favouriteHomes=registeredHome.filter(home=>favouriteIds.includes(home.id));

            res.render("store/favourites", {homes:favouriteHomes, pageTitle:'favourites'});
        })
    })

    ;
}

exports.postAddFavourites=(req,res,next)=>{

    const homeID= req.body.id;

   Favourite.addToFavourite(homeID, error=>{
    if(error){
        console.log("Error while adding to favourite",error);
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
