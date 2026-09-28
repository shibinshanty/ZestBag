const express=require('express')
const router=express.Router()

const upload=require("../middleware/uploadMiddleware")
const{protect}=require("../middleware/authMiddleware")
const{authorizeRoles}=require("../middleware/roleMiddleware")

const{createProduct,getProducts,getSingleProduct,updateProduct,deleteProduct,getAdminDashboard}=require("../controllers/productController")



router.get("/admin/dashboard",protect,authorizeRoles("admin"),getAdminDashboard);
router.post("/create", protect, authorizeRoles("admin"), upload.single("image"), createProduct); // to add multiple photos for a product (upload.array("images",5))
router.get("/getall",getProducts)
router.get('/:id',getSingleProduct)
router.put('/:id', protect, authorizeRoles("admin"), upload.single("image"), updateProduct)
router.delete('/:id',protect,authorizeRoles("admin"),deleteProduct)


module.exports=router