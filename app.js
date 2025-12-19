const ENV=process.env.NODE_ENV || 'production'

// Load environment variables
const envResult = require('dotenv').config({
  path : `.env.${ENV}`
});

// Verify Razorpay credentials are loaded
if (envResult.error) {
  console.warn(`⚠️  Warning: Could not load .env.${ENV} file:`, envResult.error.message);
  console.warn('   Trying to load default .env file...');
  require('dotenv').config(); // Try default .env
}

// Log Razorpay credential status (without exposing secrets)
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('\n🔐 Razorpay Configuration Check:');
console.log('   Environment:', ENV);
console.log('   Expected .env file: `.env.${ENV}`');
console.log('   RAZORPAY_KEY_ID:', razorpayKeyId ? `✓ Loaded (${razorpayKeyId.substring(0, 8)}...)` : '✗ MISSING');
console.log('   RAZORPAY_KEY_SECRET:', razorpayKeySecret ? `✓ Loaded (${razorpayKeySecret.substring(0, 8)}...)` : '✗ MISSING');

if (!razorpayKeyId || !razorpayKeySecret) {
  console.error('\n❌ ERROR: Razorpay credentials are missing!');
  console.error('   Please create a `.env.${ENV}` file with:');
  console.error('   RAZORPAY_KEY_ID=your_key_id_here');
  console.error('   RAZORPAY_KEY_SECRET=your_key_secret_here');
  console.error('   Get your keys from: https://dashboard.razorpay.com/\n');
} else {
  console.log('   ✓ Razorpay credentials loaded successfully\n');
}

// Core Module
const path= require('path');

const fs= require('fs');
const rootDir = require('./utils/path-util');


// EXTERNAL Module
const express = require("express");
const mongoose= require('mongoose');
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoSession = require('connect-mongodb-session');
const multer = require('multer');
const helmet= require('helmet');
const compression= require('compression');
const morgan = require('morgan');


// Local Module
const {hostRouter}=require('./routers/hostRouter');
const {authRouter}=require('./routers/authRouter');
const storeRouter=require('./routers/storeRouter');
const paymentRouter=require('./routers/paymentRouter');
const bookingRouter=require('./routers/bookingRouter');
const error=require('./Controllers/errorController');

const MongoDBStore=mongoSession(session);

const Mongo_Db_Url = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@airbnb.mbjjjtr.mongodb.net/${process.env.MONGO_DB_DATABASE}`;

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

const isValidFile =['image/png','image/jpeg','image/jpg','image/webp','image/avif'].includes(file.mimetype);                 
  cb(null,isValidFile);
  
}
// Log to a stable location (project root)
const loggingPath = path.resolve(__dirname, 'access.log');
const loggingStream = fs.createWriteStream(loggingPath, { flags: 'a' });
loggingStream.on('error', (err) => {
  console.error('Failed to write access log:', err);
});
console.log('HTTP access log path:', loggingPath);



const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://checkout.razorpay.com",
        "https://cdn.tailwindcss.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.tailwindcss.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com"]
    }
  }
}));
app.use(compression());
app.use(morgan('combined', { stream: loggingStream }));

app.set('view engine','ejs');
app.set('views','views');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(multer({storage,fileFilter}).single('image'));



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

app.use(paymentRouter);
app.use(bookingRouter);
app.use(authRouter);



app.use(error.useError);

console.log("Server is running on port 3000");

//const server = http.createServer(app);





const Port = process.env.PORT|| 3000;




mongoose.connect(Mongo_Db_Url).then(()=>{
  app.listen(Port, () => {
    console.log(`Server is running at http://localhost:${Port}`);
  });
})

