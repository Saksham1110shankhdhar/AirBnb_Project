const mongodb= require('mongodb');

const MongoClient= mongodb.MongoClient;

const url = "mongodb+srv://saksham_Deployment:root@airbnb.mbjjjtr.mongodb.net/?appName=Airbnb";


let _db;


const mongoConnect=(callback)=>{
   MongoClient.connect(url)
    .then((client) => {
        console.log(client);
        _db= client.db("Airbnb");
        callback();
    })
    .catch((err) => {
        console.log("Error came while connecting MongoDB", err);
    });

}

const getDb=()=>{
    if(!_db){
        throw new Error('Database not connected');
    }
    return _db;
}

exports.mongoConnect= mongoConnect;
exports.getDb= getDb;

// const mysql= require('mysql2');

// const pool= mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"Saksham@2004",
//     database:"airbnb"


// });

// module.exports= pool.promise();

