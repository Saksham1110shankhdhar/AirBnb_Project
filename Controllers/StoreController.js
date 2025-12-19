const path=require('path');



const Home=require('../modules/Home');
const User = require('../modules/User');
const rootDir= require('../utils/path-util');

exports.getIndex=(req,res,next)=>{

    Home.find().then(registeredHome =>{
        res.render("store/index", {homes:registeredHome, pageTitle:'Hamara Air Bnb', isLoggedIN: req.session.isLoggedIN,
            user: req.session.user,});
    });
}

exports.getHomes = async (req, res, next) => {
    try {
        let q = req.query.q || "";
        let sort = req.query.sort || "";

        // In case q comes as array
        if (Array.isArray(q)) q = q[0];

        // Fetch all homes
        let homes = await Home.find().lean();

        // ---- SEARCH ----
        if (q.trim() !== "") {
            const normalize = (str) =>
                (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

            const qNorm = normalize(q);

            homes = homes.filter(home => {
                const nameNorm = normalize(home.houseName);
                const locationNorm = normalize(home.location);
                return nameNorm.includes(qNorm) || locationNorm.includes(qNorm);
            });
        }

        // ---- SORT ----
        if (sort === "price_asc") homes.sort((a, b) => a.price - b.price);
        if (sort === "price_desc") homes.sort((a, b) => b.price - a.price);
        if (sort === "rating_desc") homes.sort((a, b) => b.rating - a.rating);
        if (sort === "name_asc") homes.sort((a, b) => a.houseName.localeCompare(b.houseName));

        // ---- RENDER ----
        res.render("store/home", {
            homes,
            page: "homes",          // VERY IMPORTANT for nav filter visibility
            sort,
            search: q,
            pageTitle: "Hamara Air Bnb",
            isLoggedIN: req.session.isLoggedIN,
            user: req.session.user
        });

    } catch (err) {
        console.log("SEARCH/SORT ERROR:", err);
        res.redirect("/homes");
    }
};




exports.getFavourites= async(req,res,next)=>{

    const userID=req.session.user._id;

    try{
        const user= await User.findById(userID).populate('favouriteHomes');

        res.render("store/favourites", {homes:user.favouriteHomes, pageTitle:'favourites', isLoggedIN: req.session.isLoggedIN,
            user: req.session.user,});
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
    }

    exports.postAddFavourites = async (req, res) => {
        console.log("🔥 POST /favourites HIT");
        console.log("BODY:", req.body);
      
        if (!req.session.user) {
          return res.redirect("/login");
        }
      
        const homeID = req.body.homeId;
        const userID = req.session.user._id;
      
        try {
          const user = await User.findById(userID);
      
          if (!user) {
            console.log("User not found");
            return res.redirect("/login");
          }
      
          // 🔥 CLEAN NULL VALUES FIRST
          user.favouriteHomes = user.favouriteHomes.filter(id => id);
      
          // 🔥 SAFE COMPARISON
          const alreadyAdded = user.favouriteHomes.some(
            favId => favId.toString() === homeID
          );
      
          if (!alreadyAdded) {
            user.favouriteHomes.push(homeID);
            await user.save();
            console.log("✅ Favourite added:", homeID);
          } else {
            console.log("ℹ Already in favourites");
          }
      
        } catch (err) {
          console.error("Favourite Error:", err);
        }
      
        res.redirect("/favourites");
      };
      
      
      
exports.postDeleteFavourites = async (req, res) => {
    const homeID = req.params.homeID;
    const userID = req.session.user?._id;

    if (!userID) {
        return res.redirect('/login');
    }

    try {
        await User.updateOne(
            { _id: userID },
            { $pull: { favouriteHomes: homeID } }
        );
    } catch (err) {
        console.log("Error while deleting from favourite", err);
    } finally {
        res.redirect("/favourites");
    }
}



exports.getHomeDetails=(req,res,next)=>{

    const homeID = req.params.homeID;

    Home.findById(homeID).then(home => {

        if (!home) {
            console.log("Home Not Found");
            return res.redirect("/");
        }
    
        res.render("store/home-detail", { home: home, pageTitle: 'Home-Detail' , isLoggedIN: req.session.isLoggedIN,
            user: req.session.user, });
    
    }).catch(err => {
        console.error("Error fetching home details:", err);
        res.status(500).send("Internal Server Error");
    });

}

exports.getRules=(req,res,next)=>{
    //const houseID=req.params.houseID;

    const rulesFileName='AirbnbRulebook.pdf';

    const filePath=path.join(rootDir,'rules',rulesFileName);

    res.download(filePath,'Rules.pdf');
}
