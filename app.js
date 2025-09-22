// Core Module

const path= require('path');


// EXTERNAL Module
const express = require("express");
const bodyParser = require("body-parser");

// Local Module
const {hostRouter}=require('./routers/hostRouter');
const storeRouter=require('./routers/storeRouter');

const error=require('./Controllers/errorController');


const app = express();

app.set('view engine','ejs');
app.set('views','views');


app.use(bodyParser.urlencoded({extended:true}));
const rootDir = require('./utils/path-util');

// Serve static assets (e.g., Tailwind output.css)
app.use('/Public', express.static(path.join(rootDir, 'Public')));

app.use("/",storeRouter);

app.use("/host",hostRouter);



app.use(error.useError);

console.log("Server is running on port 3000");

//const server = http.createServer(app);

const Port = 3000;
app.listen(Port, () => {
  console.log(`Server is running at http://localhost:${Port}`);
});
