const express=require('express')
const router=express.Router()

const {addToCart,getCart,deleteFromCart,removeQuantityFromCart,selectCartItem}=require("../controllers/cartContoller")
const {protect}=require("../middleware/authMiddleware")
const{authorizeRoles}=require("../middleware/roleMiddleware")

router.post("/add",protect,authorizeRoles("user"),addToCart)
router.get("/productcart",protect ,authorizeRoles("user"),getCart)
router.delete("/delete",protect,authorizeRoles("user"),deleteFromCart)
router.post("/remove",protect,authorizeRoles("user") ,removeQuantityFromCart) 
router.post("/select",protect,authorizeRoles("user"),selectCartItem)
module.exports=router