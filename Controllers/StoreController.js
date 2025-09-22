const Home=require('../modules/Home');

exports.getHome=(req,res,next)=>{

    Home.fetchAll(registeredHome=>{
        res.render("index", {homes:registeredHome, pageTitle:'Hamara Air Bnb'});
    });

   
}