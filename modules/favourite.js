const mongoose= require('mongoose');


const FavouriteSchema=new mongoose.Schema({
    homeID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Home",
        required:true,
        unique:true,
    },
});

module.exports=mongoose.model("Favourite",FavouriteSchema);