const Product = require("../Model/ProductModel");

const getAllProducts = async (req, res, next) =>{

    let Products;

    //get all products
    try{
        products = await Product.find();
    }catch (err) {
        console.log(err);
    }
    //not found
    if(!products){
        return res.status(404).json({message:"Product not found"});

    }
    //Display all products
    return res.status(200).json({products});

};

//Data insert
const addProducts = async(req,res,next) => {

    const {pname,pcode,pamount} = req.body;

    let products;

    try{
        products = new Product({pname,pcode,pamount});
        await products.save();
    }catch(err){
        console.log(err);
    }
    //If data not inserting 
    if(!products){
        return res.status(404).json({message:"unable to add products"});
    }
    return res.status(200).json({products});

};

//Get by ID
const getById = async(req,res,next) => {

    const id = req.params.id;

    let product;

    try{
        product = await Product.findById(id);
    }catch(err){
        console.log(err);
    }
    //if no product available to that id
      if(!product){
        return res.status(404).json({message:"unable to get product"});
    }
    return res.status(200).json({product});

};

//Update User Details
const updateProduct = async(req, res, next) =>{

    const id = req.params.id;
    const {pname,pcode,pamount} = req.body;

    let products;

    try{
        products = await Product.findByIdAndUpdate(id,
            {pname: pname,pcode: pcode,pamount: pamount});
            products = await products.save();
    }catch(err)
    {
        console.log(err);
    }
        if(!products){
        return res.status(404).json({message:"unable to Update"});
    }
    return res.status(200).json({products});

     
};

//Delete Product Details
const deleteProduct = async(req,res,next)=>{
        const id = req.params.id;

        let product;

        try{
            product = await Product.findByIdAndDelete(id);
        }
        catch(err){
            console.log(err)
        }
            if(!product){
        return res.status(404).json({message:"unable to Delete"});
    }
    return res.status(200).json({product});

}

exports.getAllProducts = getAllProducts;
exports.addProducts = addProducts;
exports.getById = getById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
