const express =  require ("express");
const router = express.Router();

//Insert Model 
const Promotion = require ("../Models/PromotionModel");
//Insert Promotion Controller
const PromotionController = require("../Controllers/PromotionController");

//creaet route path
router.get("/",PromotionController.getAllPromotions);
router.post("/",PromotionController.addPromotions);
router.get("/:id",PromotionController.getById);
router.put("/:id",PromotionController.updatePromotion);
router.delete("/:id",PromotionController.deletePromotion);



//export
module.exports= router;
