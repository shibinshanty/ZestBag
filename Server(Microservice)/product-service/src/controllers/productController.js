const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");
const { redisClient } = require("../config/redis");

// =====================================================
// CREATE PRODUCT
// =====================================================
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      stock,
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Validate image
    if (!req.file) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "products",
      }
    );

    // Save product to MongoDB
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      images: [
        {
          url: result.secure_url,
          public_id: result.public_id,
        },
      ],
      createdBy: req.user.id,
    });

    // Invalidate product list cache
    await redisClient.del("products:all");

    console.log("Product list cache invalidated");

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL PRODUCTS
// =====================================================


exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    const CACHE_TTL = 300;

    let filter = {};
    let cacheKey = "products:all";

    if (category && category.toLowerCase() !== "all") {
      filter.category = category;

      cacheKey = `products:category:${category.toLowerCase()}`;
    }

    // Check Redis cache
    const cachedProducts = await redisClient.get(cacheKey);

    if (cachedProducts) {
      console.log(`Products cache HIT: ${cacheKey}`);

      const products = JSON.parse(cachedProducts);

      return res.status(200).json({
        count: products.length,
        products,
      });
    }

    console.log(`Products cache MISS: ${cacheKey}`);

    // Fetch from MongoDB
    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    // Store in Redis
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(products));

    console.log(`Products stored in Redis: ${cacheKey}`);

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE PRODUCT
// =====================================================
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Get single product error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    // Product not found
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // -------------------------------------------------
    // Update text fields
    // -------------------------------------------------

    if (req.body.title !== undefined && req.body.title !== "") {
      product.title = req.body.title;
    }

    if (req.body.description !== undefined && req.body.description !== "") {
      product.description = req.body.description;
    }

    if (req.body.price !== undefined && req.body.price !== "") {
      product.price = Number(req.body.price);
    }

    if (req.body.category !== undefined && req.body.category !== "") {
      product.category = req.body.category;
    }

    if (req.body.stock !== undefined && req.body.stock !== "") {
      product.stock = Number(req.body.stock);
    }

    // -------------------------------------------------
    // Update product image
    // -------------------------------------------------

    if (req.file) {
      console.log("New product image received:", req.file);

      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });

      // Delete old Cloudinary images
      if (Array.isArray(product.images) && product.images.length > 0) {
        for (const image of product.images) {
          if (image.public_id) {
            try {
              await cloudinary.uploader.destroy(image.public_id);
            } catch (cloudinaryError) {
              console.error("Old image deletion failed:", cloudinaryError);
            }
          }
        }
      }

      // Save new image
      product.images = [
        {
          url: result.secure_url,
          public_id: result.public_id,
        },
      ];
    }

    // Save updated product
    const updatedProduct = await product.save();

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// DELETE PRODUCT
// =====================================================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    // Product not found
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    if (Array.isArray(product.images)) {
      for (const image of product.images) {
        if (image.public_id) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (cloudinaryError) {
            console.error("Cloudinary image deletion failed:", cloudinaryError);
          }
        }
      }
    }

    // Delete product from MongoDB
    await product.deleteOne();

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 },
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        totalProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("Product admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load product dashboard",
    });
  }
};
