
const fs = require('fs');

const path= require('path');

const rootDir= require('../utils/path-util');



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
            registeredHome.push(this);

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
}


