const express=require("express")
const cors=require("cors")
const {createProxyMiddleware}=require("http-proxy-middleware")
const {protect}=require("./middleware/authMiddleware")

require("dotenv").config()

const app=express()

const PORT=process.env.PORT||5000


app.use(cors())



// TEST ROUTE
app.get("/", (req,res)=>{
    res.send("Gateway Running");
});


//Auth Service
app.use(
    "/api/auth",
    createProxyMiddleware({
        target: process.env.AUTH_SERVICE,
        changeOrigin: true,

        pathRewrite: (path, req) => {
            return "/api/auth" + path;
        }
    })
);

// Product Service
app.use(
    "/api/products",
    createProxyMiddleware({
        target: process.env.PRODUCT_SERVICE,
        changeOrigin: true,

        pathRewrite: (path) => {
            return "/api/products" + path;
        }
    })
);

// Cart Service
app.use(
    "/api/cart",
    createProxyMiddleware({
        target: process.env.ORDER_SERVICE,
        changeOrigin: true,

        pathRewrite: (path) => {
            return "/api/cart" + path;
        }
    })
);

// Order Service
app.use(
    "/api/order",
    createProxyMiddleware({
        target: process.env.ORDER_SERVICE,
        changeOrigin: true,

        pathRewrite: (path) => {
            return "/api/order" + path;
        }
    })
);

//notification service

// Order Service
app.use(
    "/api/notifications",
    createProxyMiddleware({
        target: process.env.NOTIFICATION_SERVICE,
        changeOrigin: true,

        pathRewrite: (path) => {
            return "/api/notifications" + path;
        }
    })
);



app.listen(PORT,()=>{
    console.log(`API Gateway is running onPort ${PORT}`);
})