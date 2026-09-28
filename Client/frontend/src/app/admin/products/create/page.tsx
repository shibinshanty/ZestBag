"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@mdi/react";
import {
  mdiArrowLeft,
  mdiCheckCircleOutline,
  mdiCloudUploadOutline,
  mdiImageOutline,
  mdiPackageVariant,
  mdiPlus,
} from "@mdi/js";

import { createProduct } from "@/services/product.service";
import Notification from "@/components/notification/Notification";

type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

export default function CreateProductPage() {
  const router = useRouter();

  // ==================================================
  // Form State
  // ==================================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // ==================================================
  // UI State
  // ==================================================

  const [imagePreview, setImagePreview] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  // ==================================================
  // Notification State
  // ==================================================

  const [notification, setNotification] = useState<{
    type: NotificationType;
    title: string;
    message: string;
  } | null>(null);

  // ==================================================
  // Show Notification
  // ==================================================

  const showMessage = (
    type: NotificationType,
    title: string,
    message: string
  ) => {
    setNotification({
      type,
      title,
      message,
    });
  };

  // ==================================================
  // Image Change
  // ==================================================

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {
      showMessage(
        "warning",
        "Invalid Image",
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    // Validate image size - 5MB
    if (file.size > 5 * 1024 * 1024) {
      showMessage(
        "warning",
        "Image Too Large",
        "Please select an image smaller than 5MB."
      );

      event.target.value = "";
      return;
    }

    setImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ==================================================
  // Submit
  // ==================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // ==================================================
    // Validation
    // ==================================================

    if (!title.trim()) {
      showMessage(
        "warning",
        "Product Name Required",
        "Please enter the product name."
      );
      return;
    }

    if (!description.trim()) {
      showMessage(
        "warning",
        "Description Required",
        "Please enter the product description."
      );
      return;
    }

    if (!price.trim()) {
      showMessage(
        "warning",
        "Price Required",
        "Please enter the product price."
      );
      return;
    }

    const numericPrice = Number(price);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      showMessage(
        "warning",
        "Invalid Price",
        "Please enter a valid product price."
      );
      return;
    }

    if (!category.trim()) {
      showMessage(
        "warning",
        "Category Required",
        "Please select a product category."
      );
      return;
    }

    if (!stock.trim()) {
      showMessage(
        "warning",
        "Stock Required",
        "Please enter the product stock."
      );
      return;
    }

    const numericStock = Number(stock);

    if (
      Number.isNaN(numericStock) ||
      numericStock < 0 ||
      !Number.isInteger(numericStock)
    ) {
      showMessage(
        "warning",
        "Invalid Stock",
        "Stock must be a valid whole number."
      );
      return;
    }

    // ==================================================
    // FormData
    // ==================================================

    const formData = new FormData();

    formData.append(
      "title",
      title.trim()
    );

    formData.append(
      "description",
      description.trim()
    );

    formData.append(
      "price",
      String(numericPrice)
    );

    formData.append(
      "category",
      category.trim()
    );

    formData.append(
      "stock",
      String(numericStock)
    );

    if (image) {
      formData.append(
        "image",
        image
      );
    }

    // ==================================================
    // API Request
    // ==================================================

    try {
      setLoading(true);

      const product = await createProduct(
        formData
      );

      // ==================================================
      // Product successfully created
      // ==================================================

      const productName =
        product?.title?.trim() ||
        title.trim() ||
        "Product";

      showMessage(
        "success",
        "Product Added Successfully",
        `${productName} has been added to your products.`
      );

      // ==================================================
      // Clear Form
      // ==================================================

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
      setImage(null);
      setImagePreview(null);

      // ==================================================
      // Redirect
      // ==================================================

      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (error: any) {
      console.error(
        "Create product error:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to add the product. Please try again.";

      showMessage(
        "error",
        "Product Creation Failed",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // Cancel
  // ==================================================

  const handleCancel = () => {
    router.push("/admin/products");
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">

      {/* ==================================================
          Notification Card
          ================================================== */}

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() =>
            setNotification(null)
          }
        />
      )}

      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            Header
            ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <button
              type="button"
              onClick={handleCancel}
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <Icon
                path={mdiArrowLeft}
                size={0.75}
              />

              Back to Products
            </button>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#57213f] text-white">
                <Icon
                  path={mdiPlus}
                  size={1.1}
                />
              </div>

              <div>

                <h1 className="text-2xl font-black text-[#57213f] sm:text-3xl">
                  Add Product
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new product to your ZestBag store.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            Form
            ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >

          <div className="p-5 sm:p-8">

            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

              {/* ==================================================
                  Left Side - Product Details
                  ================================================== */}

              <div className="space-y-6">

                {/* Product Name */}

                <div>

                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Product Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="Enter product name"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                </div>

                {/* Description */}

                <div>

                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Description
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Enter product description"
                    rows={6}
                    disabled={loading}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                </div>

                {/* Price / Stock */}

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Price */}

                  <div>

                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Price
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                        ₹
                      </span>

                      <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(event) =>
                          setPrice(event.target.value)
                        }
                        placeholder="0.00"
                        disabled={loading}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />

                    </div>

                  </div>

                  {/* Stock */}

                  <div>

                    <label
                      htmlFor="stock"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Stock
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={stock}
                      onChange={(event) =>
                        setStock(event.target.value)
                      }
                      placeholder="0"
                      disabled={loading}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                  </div>

                </div>

                {/* ==================================================
                    Category
                    ================================================== */}

                <div>

                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Category
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    disabled={loading}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >

                    <option value="">
                      Select a category
                    </option>

                    <option value="Electronics">
                      Electronics
                    </option>

                    <option value="Mobile & Tablets">
                      Mobile & Tablets
                    </option>

                    <option value="Computers & Laptops">
                      Computers & Laptops
                    </option>

                    <option value="Fashion">
                      Fashion
                    </option>

                    <option value="Home & Kitchen">
                      Home & Kitchen
                    </option>

                    <option value="Beauty & Personal Care">
                      Beauty & Personal Care
                    </option>

                    <option value="Sports & Fitness">
                      Sports & Fitness
                    </option>

                    <option value="Books">
                      Books
                    </option>

                    <option value="Toys & Games">
                      Toys & Games
                    </option>

                    <option value="Grocery">
                      Grocery
                    </option>

                    <option value="Accessories">
                      Accessories
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>

              {/* ==================================================
                  Right Side - Image
                  ================================================== */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Product Image
                </label>

                <div className="overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50">

                  {imagePreview ? (

                    <div className="relative aspect-square">

                      <Image
                        src={imagePreview}
                        alt="Product preview"
                        fill
                        sizes="320px"
                        className="object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        disabled={loading}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50 disabled:cursor-not-allowed"
                        aria-label="Remove image"
                      >
                        ×
                      </button>

                    </div>

                  ) : (

                    <label
                      htmlFor="product-image"
                      className="flex aspect-square cursor-pointer flex-col items-center justify-center p-6 text-center transition hover:bg-white"
                    >

                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8e9e2] text-[#57213f]">

                        <Icon
                          path={mdiCloudUploadOutline}
                          size={1.5}
                        />

                      </div>

                      <p className="text-sm font-bold text-slate-800">
                        Upload Product Image
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        PNG, JPG or WEBP
                        <br />
                        Maximum 5MB
                      </p>

                      <div className="mt-5 rounded-xl bg-[#57213f] px-4 py-2.5 text-xs font-bold text-white">
                        Choose Image
                      </div>

                    </label>

                  )}

                  <input
                    id="product-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="hidden"
                  />

                </div>

                {!imagePreview && (
                  <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">

                    <Icon
                      path={mdiImageOutline}
                      size={0.7}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      Product image is optional. You can add
                      one to make the product easier to identify.
                    </span>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* ==================================================
              Footer Actions
              ================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-5 sm:flex-row sm:justify-end sm:px-8">

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#57213f] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#713052] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Icon
                    path={mdiCheckCircleOutline}
                    size={0.8}
                  />

                  Add Product
                </>
              )}

            </button>

          </div>

        </form>

        {/* ==================================================
            Bottom Information
            ================================================== */}

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0ded5] bg-white p-4">

          <Icon
            path={mdiPackageVariant}
            size={0.9}
            className="mt-0.5 shrink-0 text-[#c87965]"
          />

          <div>

            <p className="text-sm font-bold text-[#57213f]">
              Product Creation
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Once the product is successfully created, you
              will be redirected to the products list.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}