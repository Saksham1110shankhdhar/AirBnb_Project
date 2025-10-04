
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

        static deleteByID(removehomeID, callback){
            console.log("Favourite.deleteByID called with ID:", removehomeID);
            Favourite.fetchAll(favouriteIds=>{
                console.log("Current favourite IDs:", favouriteIds);
                const new_favouriteIds= favouriteIds.filter(id=>removehomeID !== id);
                console.log("New favourite IDs after deletion:", new_favouriteIds);
    
                fs.writeFile(
                    favouriteFilePath,
                    JSON.stringify(new_favouriteIds),callback);
            })
        }

    

}


