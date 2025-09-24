const Order = require("../Models/OrderModel");

//Display data

const getAllOrders = async (req, res, next) =>{


    //if there are orders display them
    let Orders;
    try{
        Orders = await Order.find();

    }catch(err){
        console.log(err);
    }

    //if there are no orders

    if(!Orders){
        return res.status(404).json({message:"order not found"})
    }

    //display all order
    return res.status(200).json({Orders})

};

//data insert

const addOrders = async(req, res, next) =>{

console.log("Incoming body:", req.body);// added this to identify wheather there is a error in code
const {customer_name,customer_address,size,quantity,payment_type}
 = req.body;

     let orders;

        try{

        orders = new Order ({customer_name,customer_address,size,quantity,payment_type});
        await orders.save();

         }catch(err){

        console.log(err);

         }

//if no data is inserting

if(!orders){
return res.status(404).json({message:"unable to add orders"});
}
return res.status(200).json({orders});

};

//get by id 
const getById = async (req, res, next) =>{

    const id = req.params.id;
    let order;
    
    try{
        order = await Order.findById(id);
    }catch (err){
        console.log(err);
    }

    //if there is no order
    if(!order){
        return res.status(404).json({ message: "Order not found" });
    }
     return res.status(200).json({order});

};


//update order
const updateOrder = async (req, res, next) =>{
        const id = req.params.id;
        const{customer_name,customer_address,size,quantity,payment_type}=req.body;

        let order;
        try{
            order= await Order.findByIdAndUpdate(id,{customer_name:customer_name,customer_address:customer_address,size:size,quantity:quantity,payment_type:payment_type});
            order = await order.save();
        }catch (err){
        console.log(err);
    }
        //if there is no order available
        if(!order){
        return res.status(404).json({ message: "unable to pdate order" });
    }
     return res.status(200).json({order});
        
};



//deletion part
//delete order
const deleteOrder = async (req, res, next) => {
    const id = req.params.id;
    let order;

    try {
        order = await Order.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    //if order not found
    if (!order) {
        return res.status(404).json({ message: "Order not found, cannot delete" });
    }

    return res.status(200).json({ message: "Order deleted successfully" });
};


module.exports = {getAllOrders, addOrders, getById, updateOrder,deleteOrder};


