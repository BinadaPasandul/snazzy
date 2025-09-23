const Promotion = require( "../Models/PromotionModel");


//display part
const getAllPromotions = async(req, res, next) => {
    let Promotions;
    try{
        
        Promotions = await Promotion.find();
    }catch(err){
        console.log(err);
    }

    //not found
    if(!Promotions){
        return res.status(404).json({message:"promotion not found"})
    }

    //display all promotions
    return res.status(200).json({Promotions });
};


// data insert part
const addPromotions = async(req, res, next) => {
    const {title, description, discount, /*startDate, endDate,*/ bannerImage} = req.body;

    try{
        const createdPromotion = new Promotion ({title, description, discount,/*startDate, endDate,*/ bannerImage});
        await createdPromotion.save();
        return res.status(201).json({ promotion: createdPromotion });
    }catch(err){
        console.log(err);
        return res.status(400).json({ message: err.message || "unable to add promotions" });
    }
};

//get by Id
const getById = async (req,res,next) =>
{
    const id = req.params.id;
    let Promotions;
    try{
        Promotions = await Promotion.findById(id);
    }catch(err){
        console.log(err);
    }
    //not available promotions
    if(!Promotions){
        return res.status(404).json ({message : "promotions not found"});
    }
    return res.status(200).json ({Promotions});

}


//Update promotion details
const updatePromotion = async (req, res, next ) => {
    const id = req.params.id;
    const {title, description, discount, /*startDate, endDate,*/ bannerImage} = req.body;

    let Promotions;
    try{
        Promotions = await Promotion.findByIdAndUpdate(id,
            {title:title, description:description,discount:discount,/*startDate:startDate, endDate:endDate, */ bannerImage:bannerImage});
            Promotions = await Promotions.save();
    }catch(err){
        console.log(err);
    }
    if(!Promotions){
        return res.status(404).json ({message : "Unable to update promotion details"});
    }
    return res.status(200).json ({Promotions});
};

// Delete User Details
const deletePromotion = async (req, res, next) => {
    const id = req.params.id;
    let Promotions;
    try{
        Promotions = await Promotion.findByIdAndDelete(id)
    } catch (err){
        console.log(err);
    }
     if(!Promotions){
        return res.status(404).json ({message : "Unable to Delete"});
    }
    return res.status(200).json ({Promotions});
}

exports.getAllPromotions = getAllPromotions;
exports.addPromotions = addPromotions;
exports.getById = getById;
exports.updatePromotion = updatePromotion;
exports.deletePromotion = deletePromotion;









