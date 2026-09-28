"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@mdi/react";

import {
  mdiArrowLeft,
  mdiCheckCircleOutline,
  mdiCloudUploadOutline,
  mdiImageOutline,
  mdiPackageVariant,
  mdiPencilOutline,
} from "@mdi/js";

import {
  getProductById,
  updateProduct,
} from "@/services/product.service";

import Notification from "@/components/notification/Notification";

type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notification, setNotification] = useState<{
    type: NotificationType;
    title: string;
    message: string;
  } | null>(null);

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

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        setLoading(true);

        const product = await getProductById(productId);

        setTitle(product.title || "");
        setDescription(product.description || "");
        setPrice(String(product.price ?? ""));
        setCategory(product.category || "");
        setStock(String(product.stock ?? ""));

        if (
          product.images &&
          product.images.length > 0 &&
          product.images[0]?.url
        ) {
          setImagePreview(product.images[0].url);
        }
      } catch (error) {
        console.error(
          "Error loading product:",
          error
        );

        showMessage(
          "error",
          "Unable to Load Product",
          "The product could not be loaded. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage(
        "warning",
        "Invalid Image",
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

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

  // =====================================================
  // REMOVE NEW IMAGE
  // =====================================================

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

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

    // ===================================================
    // FORM DATA
    // ===================================================

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

    // Only send image if a new image was selected
    if (image) {
      formData.append(
        "image",
        image
      );
    }

    // ===================================================
    // UPDATE PRODUCT
    // ===================================================

    try {
      setSaving(true);

      const updatedProduct =
        await updateProduct(
          productId,
          formData
        );

      const productName =
        updatedProduct?.title?.trim() ||
        title.trim() ||
        "Product";

      showMessage(
        "success",
        "Product Updated Successfully",
        `${productName} has been updated successfully.`
      );

      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (error: any) {
      console.error(
        "Update product error:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update the product. Please try again.";

      showMessage(
        "error",
        "Product Update Failed",
        errorMessage
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    router.push("/admin/products");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#57213f]" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
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

        {/* HEADER */}

        <div className="mb-6">

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
                path={mdiPencilOutline}
                size={1.1}
              />
            </div>

            <div>

              <h1 className="text-2xl font-black text-[#57213f] sm:text-3xl">
                Edit Product
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update your product information.
              </p>

            </div>

          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >

          <div className="p-5 sm:p-8">

            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

              {/* LEFT SIDE */}

              <div className="space-y-6">

                {/* PRODUCT NAME */}

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
                      setTitle(
                        event.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:bg-slate-50"
                  />

                </div>

                {/* DESCRIPTION */}

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
                      setDescription(
                        event.target.value
                      )
                    }
                    rows={6}
                    disabled={saving}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:bg-slate-50"
                  />

                </div>

                {/* PRICE + STOCK */}

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* PRICE */}

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

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                        ₹
                      </span>

                      <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(event) =>
                          setPrice(
                            event.target.value
                          )
                        }
                        disabled={saving}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-9 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:bg-slate-50"
                      />

                    </div>

                  </div>

                  {/* STOCK */}

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
                        setStock(
                          event.target.value
                        )
                      }
                      disabled={saving}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:bg-slate-50"
                    />

                  </div>

                </div>

                {/* CATEGORY */}

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
                      setCategory(
                        event.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-[#c87965] focus:ring-4 focus:ring-[#c87965]/10 disabled:bg-slate-50"
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

              {/* RIGHT SIDE - IMAGE */}

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
                        onClick={handleRemoveImage}
                        disabled={saving}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50"
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
                        Upload New Image
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
                    disabled={saving}
                    className="hidden"
                  />

                </div>

                <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">

                  <Icon
                    path={mdiImageOutline}
                    size={0.7}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    Leave the existing image unchanged
                    or upload a new product image.
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-5 sm:flex-row sm:justify-end sm:px-8">

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#57213f] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#713052] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (

                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Updating Product...
                </>

              ) : (

                <>
                  <Icon
                    path={mdiCheckCircleOutline}
                    size={0.8}
                  />

                  Save Changes
                </>

              )}

            </button>

          </div>

        </form>

        {/* INFO */}

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0ded5] bg-white p-4">

          <Icon
            path={mdiPackageVariant}
            size={0.9}
            className="mt-0.5 shrink-0 text-[#c87965]"
          />

          <div>

            <p className="text-sm font-bold text-[#57213f]">
              Product Update
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Changes will be saved to the product after
              successful validation.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}