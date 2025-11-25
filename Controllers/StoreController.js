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

    Favourite.find().populate("homeID").then(favIDHomes=>{
        const favouriteHomes= favIDHomes.map(favIdhome=>favIdhome.homeID);
       
            res.render("store/favourites", {homes:favouriteHomes, pageTitle:'favourites'});
        
    })
}

exports.postAddFavourites=(req,res,next)=>{

    const homeID= req.body.id;
   
    const fav = new Favourite({homeID});

    fav.save().then(()=>{
        res.redirect("/favourites");
    }).catch(err=>{
        console.log("Error while adding to favourite",err);
        res.redirect("/favourites");
    })

  
}
exports.postDeleteFavourites=(req,res)=>{
    const homeID= req.params.homeID;
    Favourite.findOneAndDelete({homeID})
    .then(()=>{
        res.redirect("/favourites");
    }).catch(err=>{
        console.log("Error while deleting from favourite",err);
        res.redirect("/favourites");
    })
       
}


exports.getHomeDetails=(req,res,next)=>{

    const homeID = req.params.homeID;

    Home.findById(homeID).then(home => {

        if (!home) {
            console.log("Home Not Found");
            return res.redirect("/homes");
        }
    
        res.render("store/home-detail", { home: home, pageTitle: 'Home-Detail' });
    
    }).catch(err => {
        console.error("Error fetching home details:", err);
        res.status(500).send("Internal Server Error");
    });

}
