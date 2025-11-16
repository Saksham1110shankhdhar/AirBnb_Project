module.exports= class Favourite{

    constructor(homeID){
        this.homeID=homeID;
    }

    save() {
        const db=getDb();
       
        return db.collection('favourites').findOne({homeID:this.homeID})
        .then(existingFav=>{
            if(!existingFav){
                return db.collection('favourites').insertOne(this);
            }

            return Promise.resolve();
        })
        // Insert
        
    }

    static fetchAll(){
        const db=getDb();
        return db.collection('favourites').find().toArray();
    }    


    static deleteByID(homeID){
        const db=getDb();
        return db.collection('favourites').deleteOne({homeID:homeID});
    }

    

}


