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
