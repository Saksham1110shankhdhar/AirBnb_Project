const Home=require('../modules/Home');

exports.getHome=(req,res,next)=>{

    Home.fetchAll(registeredHome=>{
        res.render("store/home", {homes:registeredHome, pageTitle:'Hamara Air Bnb'});
    });

   
}