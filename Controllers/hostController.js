const Home=require('../modules/Home');
const { deleteFile } = require('../utils/file');

exports.getAddHome=(req, res, next) => {
    res.render("host/edit-home", {editing:false, pageTitle: "Add Your Home",isLoggedIN: req.session.isLoggedIN,
      user: req.session.user,});
  }

  exports.getEditHome = (req, res, next) => {
    const homeID = req.params.homeID;
  
    Home.findById(homeID)
      .then(home => {
        if (!home) {
          console.log('Home not found for editing');
          return res.redirect('/host/host-homes');
        }
  
        res.render('host/edit-home', {
          home: home,
          editing: true, // ✅ force edit mode
          pageTitle: 'Edit Your Home',
          isLoggedIN: req.session.isLoggedIN,
          user: req.session.user
        });
      })
      .catch(err => {
        console.log(err);
        res.redirect('/host/host-homes');
      });
  };
  


exports.postAddHome=(req,res,next)=>{

  console.log("BODY:", req.body);   // debug
  console.log("FILE:", req.file);   // debug



  const {houseName,price,location,rating,description} = req.body;
  console.log(req.body);
  console.log("home-photo",req.file);

  if(!req.file){
    return res.status(400).send('No proper format of image provided');
  }

  const photoUrl= "/"+req.file.path;
  // const price = req.body.price;
  // const location = req.body.location;
  // const rating = req.body.rating;
  // const photoUrl = req.body.photoUrl;

  const newHome= new Home({houseName,price,location,rating,photoUrl,description,host:req.session.user._id,});

  newHome.save().then(()=>{
    res.redirect('/host/host-homes');
  });
    
  }

  exports.postEditHome = (req, res, next) => {
    const { homeID, houseName, price, location, rating, description } = req.body;
  
    console.log('EDIT BODY:', req.body);
    console.log('EDIT FILE:', req.file);
  
    Home.findById(homeID)
      .then(existingHome => {
        if (!existingHome) {
          console.log('Home not found for Editing');
          return res.redirect('/host/host-homes');
        }
  
        existingHome.houseName = houseName;
        existingHome.price = price;
        existingHome.location = location;
        existingHome.rating = rating;
        existingHome.description = description;
  
        // update image only if new one uploaded
        if (req.file) {
          if (existingHome.photoUrl) {
            deleteFile(existingHome.photoUrl.substring(1));
          }
          existingHome.photoUrl = '/uploads/' + req.file.filename;
        }
  
        return existingHome.save();
      })
      .then(() => {
        res.redirect('/host/host-homes');
      })
      .catch(err => {
        console.log(err);
        res.redirect('/host/host-homes');
      });
  };
  

  exports.postDeleteHome=(req,res,next)=>{
    const homeID= req.params.homeID;

    Home.findByIdAndDelete(homeID).then(()=>{
      res.redirect("/host/host-homes");
    });
  }


  exports.getHostHomes=(req,res,next)=>{
    Home.find({host:req.session.user._id}).then((registeredHome)=>{
      res.render("host/host-home", {homes:registeredHome, pageTitle:'Host Homes', isLoggedIN: req.session.isLoggedIN,
        user: req.session.user,});
  });
  }
