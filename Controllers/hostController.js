
const Home=require('../modules/Home');

exports.getAddHome=(req, res, next) => {
    res.render("host/Add_Home", { pageTitle: "Add Your Home" });
  }

exports.postAddHome=(req,res,next)=>{

  const {houseName,price,location,rating,photoUrl} = req.body;
  // const price = req.body.price;
  // const location = req.body.location;
  // const rating = req.body.rating;
  // const photoUrl = req.body.photoUrl;

  const newHome= new Home(houseName,price,location,rating,photoUrl);

  newHome.save(err=>{
    if(err){
      res.redirect('/');
    }else{
      res.render("host/Home-added", { pageTitle: "Home Added Successfully" });
    }
  });
    
  }
