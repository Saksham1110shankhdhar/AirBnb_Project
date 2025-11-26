const Home=require('../modules/Home');

exports.getAddHome=(req, res, next) => {
    res.render("host/edit-home", {editing:false, pageTitle: "Add Your Home",isLoggedIN: req.session.isLoggedIN});
  }

  exports.getEditHome=(req, res, next) => {

    const homeID= req.params.homeID;

    const editing= req.query.editing==='true';

  if(!editing){
      console.log('Editing flag not set properly');
       return res.redirect('/host/host-homes');
    }
  

    Home.findById(homeID).then(home=>{
      if(!home){
        console.log('Home not found for editing');

        return res.redirect('/host/host-homes');
      }
      res.render("host/edit-home", {home:home, editing:editing, pageTitle: "Edit Your Home", isLoggedIN: req.session.isLoggedIN });
    })
  }
  


exports.postAddHome=(req,res,next)=>{

  const {houseName,price,location,rating,photoUrl,description} = req.body;
  // const price = req.body.price;
  // const location = req.body.location;
  // const rating = req.body.rating;
  // const photoUrl = req.body.photoUrl;

  const newHome= new Home({houseName,price,location,rating,photoUrl,description});

  newHome.save().then(()=>{
    res.redirect('/host/host-homes');
  });
    
  }

  exports.postEditHome=(req,res,next)=>{
    const {id,houseName,price,location,rating,photoUrl,description} = req.body;

    Home.findById(id).then(existingHome=>{
      if(!existingHome){
        console.log("Home not found for Editing");
        return  res.redirect("/host/host-homes");
      }

      existingHome.houseName=houseName;
      existingHome.price=price;
      existingHome.location=location;
      existingHome.rating=rating;
      existingHome.photoUrl=photoUrl;
      existingHome.description=description;

      return existingHome.save();
    }).finally(()=>{
      return  res.redirect("/host/host-homes");
    });
  }

  exports.postDeleteHome=(req,res,next)=>{
    const homeID= req.params.homeID;

    Home.findByIdAndDelete(homeID).then(()=>{
      res.redirect("/host/host-homes");
    });
  }


  exports.getHostHomes=(req,res,next)=>{
    Home.find().then((registeredHome)=>{
      res.render("host/host-home", {homes:registeredHome, pageTitle:'Host Homes', isLoggedIN: req.session.isLoggedIN});
  });
  }
