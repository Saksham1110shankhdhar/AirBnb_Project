
const Home=require('../modules/Home');

exports.getAddHome=(req, res, next) => {
    res.render("host/edit-home", {editing:false, pageTitle: "Add Your Home" });
  }

  exports.getEditHome=(req, res, next) => {

    const homeID= req.params.homeID;

    const editing= req.query.editing==='true';

  if(!editing){
      console.log('Editing flag not set properly');
       return res.redirect('/host/host-homes');
    }
  

    Home.findByID(homeID).then(home=>{
      if(!home){
        console.log('Home not found for editing');

        return res.redirect('/host/host-homes');
      }
      res.render("host/edit-home", {home:home, editing:editing, pageTitle: "Edit Your Home" });
    })
  }

    
  

  


exports.postAddHome=(req,res,next)=>{

  const {houseName,price,location,rating,photoUrl,description} = req.body;
  // const price = req.body.price;
  // const location = req.body.location;
  // const rating = req.body.rating;
  // const photoUrl = req.body.photoUrl;

  const newHome= new Home(houseName,price,location,rating,photoUrl,description);

  newHome.save().then((rows)=>{
    res.redirect('/host/host-homes');
  });
    
  }

  exports.postEditHome=(req,res,next)=>{
    const {id,houseName,price,location,rating,photoUrl,description} = req.body;

    const newHome= new Home(houseName,price,location,rating,photoUrl,description,id);

    newHome.save().then(err=>{
      if(err){
        console.log("Error  while updating Home",err);
      }
      res.redirect("/host/host-homes");
    });
  }

  exports.postDeleteHome=(req,res,next)=>{
    const homeID= req.params.homeID;

    Home.deleteByID(homeID).then(()=>{
      res.redirect("/host/host-homes");
    });
  }


  exports.getHostHomes=(req,res,next)=>{
    Home.fetchAll().then(registeredHome=>{
      res.render("host/host-home", {homes:registeredHome, pageTitle:'Host Homes'});
  });
  }
