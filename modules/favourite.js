
const fs = require('fs');

const path= require('path');

const rootDir= require('../utils/path-util');



const favouriteFilePath = path.join(rootDir, 'Data', 'favourite.json');

module.exports= class Favourite{


    

    static fetchAll(callback){

        fs.readFile(favouriteFilePath, (err, data)=>{
            if(err){
               callback([]);
            }else{
                callback(JSON.parse(data));
            }

            
        })

 }    


    static addToFavourite(homeID,callback){
            Favourite.fetchAll(FavouriteID=>{
                FavouriteID.push(homeID);
    
                fs.writeFile(
                    favouriteFilePath,
                    JSON.stringify(FavouriteID),callback);
            })
        }

    

}


