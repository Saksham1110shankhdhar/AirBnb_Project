const mongoose= require('mongoose');
const favourite = require('./favourite');


const homeSchema=new mongoose.Schema({
    houseName:{type:String,required:true},
    price:{type:Number,required:true},
    location:{type:String,required:true},
    rating:{type:Number,required:true},
    photoUrl:String,
    description:String
});

homeSchema.pre('findByIdAndDelete',function(next){
    const homeID=this.getQuery()["_id"];
    favourite.deleteOne({homeID}).then(()=>{
        next();
    })
    
})

module.exports=mongoose.model("Home",homeSchema);




// module.exports= class Home{

//     constructor(houseName,price,location,rating,photoUrl,description,_id){
//         this.houseName=houseName;
//         this.price=price;
//         this.location=location;
//         this.rating= rating;
//         this.photoUrl= photoUrl;
//         this.description= description;
//         if(_id){
//             this._id= new ObjectId(String(_id));
//         }

//     }

    // save() {
    //     const db=getDb();

    //     if(this._id){  //Update
    //         return db.collection('homes').updateOne({_id:this._id},{$set:this})
    //     }else{    // Insert
    //         return db.collection('homes').insertOne(this);
    //     }
    // }
    

    // static find(){
    //     const db=getDb();
    //     return db.collection('homes').find().toArray();
        

    // }

    // static findByID(homeID){
    //     const db=getDb();
    //     return db.collection('homes').find({_id:new ObjectId(String(homeID))}).next();
    //     // .then(home=>{
    //     //     console.log(home);
    //     //     return home;
    //     // }).catch(err=>{
    //     //     console.log("Error while Fetching Home",err);
    //     // })
       
    // }

    // static deleteByID(homeID){
    //     const db=getDb();
    //     return db.collection('homes').deleteOne({_id:new ObjectId(String(homeID))});
    // }



