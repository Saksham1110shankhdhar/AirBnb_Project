const Home=require('../modules/Home');
const User = require('../modules/User');

exports.getIndex=(req,res,next)=>{

    Home.find().then(registeredHome =>{
        res.render("store/index", {homes:registeredHome, pageTitle:'Hamara Air Bnb', isLoggedIN: req.session.isLoggedIN,
            user: req.session.user,});
    });
}


exports.getHomes=(req,res,next)=>{

    Home.find().then(registeredHome=>{
        res.render("store/home", {homes:registeredHome, pageTitle:'Hamara Air Bnb', isLoggedIN: req.session.isLoggedIN,
            user: req.session.user,});
    });
}

exports.getFavourites= async(req,res,next)=>{

    const userID=req.session.user._id;

    try{
        const user= await User.findById(userID).populate('favouriteHomes');

        res.render("store/favourites", {homes:user.favouriteHomes, pageTitle:'favourites', isLoggedIN: req.session.isLoggedIN,
            user: req.session.user,});
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
    }


exports.postAddFavourites= async (req,res,next)=>{

    const homeID= req.body.id;
    const userID=req.session.user._id;

    try{
       const user= await User.findOne({_id:userID});

       if(!user.favouriteHomes.includes(homeID)){
        user.favouriteHomes.push(homeID);

        await user.save();
       }
    }catch(err){
      console.log(err);
   } finally{
     res.redirect("/favourites");
   }

  
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
    
        res.render("store/home-detail", { home: home, pageTitle: 'Home-Detail' , isLoggedIN: req.session.isLoggedIN,
            user: req.session.user, });
    
    }).catch(err => {
        console.error("Error fetching home details:", err);
        res.status(500).send("Internal Server Error");
    });

}
