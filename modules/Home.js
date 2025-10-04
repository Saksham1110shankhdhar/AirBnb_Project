
const fs = require('fs');

const path= require('path');

const rootDir= require('../utils/path-util');

const Favourite = require('./favourite');



const homeFilePath = path.join(rootDir, 'Data', 'homes.json');

module.exports= class Home{

    constructor(houseName,price,location,rating,photoUrl){
        this.houseName=houseName;
        this.price=price;
        this.location=location;
        this.rating= rating;
        this.photoUrl= photoUrl;

    }

    save(callback) {

        Home.fetchAll(registeredHome=>{

            if(this.id){

                registeredHome=registeredHome.map(home=>home.id !==this.id ? home : this);
            }else{
                 this.id=Math.random().toString();
                 registeredHome.push(this);
            }
    
            

            fs.writeFile(
                homeFilePath,
                JSON.stringify(registeredHome),callback);
        })
      
    }
    

    static fetchAll(callback){

        fs.readFile(homeFilePath, (err, data)=>{
            if(err){
               callback([]);
            }else{
                callback(JSON.parse(data));
            }

            
        })

    }

    static findByID(homeID,callback){
        Home.fetchAll(homes=>{
          const home =  homes.find(home=>home.id===homeID);

          callback(home);
        })
    }

    static deleteByID(homeID, callback){
        Home.fetchAll(homes=>{
            const new_home= homes.filter(home=>home.id !== homeID);

            fs.writeFile(
                homeFilePath,
                JSON.stringify(new_home),err=>{
                    if(err){
                        callback(err);
                        return;
                    }
                    Favourite.deleteByID(homeID,callback);
                });
        });
    }
}


