// Core Module
const path= require('path');

// EXTERNAL Module
const express = require("express");
const mongoose= require('mongoose');
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoSession = require('connect-mongodb-session');
const multer = require('multer');


// Local Module
const {hostRouter}=require('./routers/hostRouter');
const {authRouter}=require('./routers/authRouter');
const storeRouter=require('./routers/storeRouter');
const error=require('./Controllers/errorController');

const MongoDBStore=mongoSession(session);

const Mongo_Db_Url = "mongodb+srv://saksham_Deployment:root@airbnb.mbjjjtr.mongodb.net/Airbnb?appName=Airbnb";

const sessionStore= new MongoDBStore({
  uri:Mongo_Db_Url,
  collection:'sessions'
});

const storage=multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,'uploads/');
  },

  filename: (req, file, cb) => {
    const safeDate = new Date().toISOString().replace(/:/g, '-');   // ← FIX!
    cb(null, safeDate + '-' + file.originalname);
  }
  
});

const fileFilter=(req,file,cb)=>{
  // const isValidFile=file.mimetype === 'image/png'||
  //                   file.mimetype === 'image/png';

const isValidFile =['image/png','image/jpeg','image/jpg','image/webp'].includes(file.mimetype);                 
  cb(null,isValidFile);
  
}



const app = express();

app.set('view engine','ejs');
app.set('views','views');


app.use(bodyParser.urlencoded({extended:true}));

app.use(multer({storage,fileFilter}).single('photo'));

const rootDir = require('./utils/path-util');

// Serve static assets so files are available via / and /Public paths
const publicDir = path.join(rootDir, 'Public');
app.use(express.static(publicDir));
app.use('/Public', express.static(publicDir));

app.use('/uploads',express.static(path.join(rootDir,'uploads')))

app.use(session({
  secret: 'AirBnb Secret key',
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));

// app.use((req,res,next)=>{
//   console.log(req.get('Cookie'));
//   req.isLoggedIN=req.get('Cookie').split('=')[1]==='true';
//   next();
// })

app.use("/",storeRouter);

app.use("/host",(req,res,next)=>{
  if(!req.session.isLoggedIN){
     return res.redirect('/login');
  }
  next();
})

app.use("/host",hostRouter);

app.use(authRouter);



app.use(error.useError);

console.log("Server is running on port 3000");

//const server = http.createServer(app);





const Port = 3000;




mongoose.connect(Mongo_Db_Url).then(()=>{
  app.listen(Port, () => {
    console.log(`Server is running at http://localhost:${Port}`);
  });
})

