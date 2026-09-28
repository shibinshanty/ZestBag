"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  mdiPlus,
  mdiMagnify,
  mdiPencil,
  mdiDelete,
  mdiPackageVariant,
  mdiRefresh,
  mdiClose,
  mdiAlertCircleOutline,
} from "@mdi/js";

import Icon from "@mdi/react";

import {
  getProducts,
  deleteProduct,
} from "@/services/product.service";

import type { Product } from "@/types/product";

import Notification from "@/components/notification/Notification";

type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

export default function AdminProductsPage() {
  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState<Product[]>([]);

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // DELETE STATE
  // =====================================================

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [productToDelete, setProductToDelete] =
    useState<Product | null>(null);

  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [notification, setNotification] = useState<{
    type: NotificationType;
    title: string;
    message: string;
  } | null>(null);

  // =====================================================
  // SHOW NOTIFICATION
  // =====================================================

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
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(data);
    } catch (err) {
      console.error(
        "Admin products error:",
        err
      );

      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredProducts = products.filter(
    (product) => {
      const name =
        product.name?.toLowerCase() ||
        product.title?.toLowerCase() ||
        "";

      const category =
        product.category?.toLowerCase() || "";

      const searchTerm =
        search.toLowerCase().trim();

      return (
        name.includes(searchTerm) ||
        category.includes(searchTerm)
      );
    }
  );

  // =====================================================
  // OPEN DELETE CONFIRMATION
  // =====================================================

  const handleDeleteClick = (
    product: Product
  ) => {
    setProductToDelete(product);
  };

  // =====================================================
  // CANCEL DELETE
  // =====================================================

  const handleCancelDelete = () => {
    if (deleteLoading) {
      return;
    }

    setProductToDelete(null);
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const handleConfirmDelete = async () => {
    if (!productToDelete?._id) {
      return;
    }

    try {
      setDeleteLoading(true);

      const productName =
        productToDelete.name?.trim() ||
        productToDelete.title?.trim() ||
        "Product";

      await deleteProduct(
        productToDelete._id
      );

      // Remove deleted product immediately
      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            product._id !==
            productToDelete._id
        )
      );

      setProductToDelete(null);

      showMessage(
        "success",
        "Product Deleted Successfully",
        `${productName} has been deleted successfully.`
      );
    } catch (error: any) {
      console.error(
        "Delete product error:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to delete the product. Please try again.";

      showMessage(
        "error",
        "Product Delete Failed",
        errorMessage
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">

      {/* =================================================
          NOTIFICATION
          ================================================= */}

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

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Products
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your store products
            </p>
          </div>

          {/* ADD PRODUCT */}

          <Link
            href="/admin/products/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Icon
              path={mdiPlus}
              size={0.8}
            />

            Add Product
          </Link>
        </div>

        {/* =================================================
            SEARCH + REFRESH
            ================================================= */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Icon
              path={mdiMagnify}
              size={0.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products or categories..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <Icon
              path={mdiRefresh}
              size={0.75}
            />

            Refresh
          </button>
        </div>

        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-slate-500">
              Loading products...
            </p>
          </div>
        )}

        {/* =================================================
            ERROR
            ================================================= */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">

            <p className="font-semibold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            PRODUCTS
            ================================================= */}

        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* =================================================
                DESKTOP TABLE
                ================================================= */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map(
                    (product) => {

                      const productName =
                        product.name?.trim() ||
                        product.title?.trim() ||
                        "Untitled Product";

                      const image =
                        product.images?.[0]?.url;

                      return (
                        <tr
                          key={product._id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >

                          {/* PRODUCT */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-4">

                              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">

                                {image ? (
                                  <Image
                                    src={image}
                                    alt={productName}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">

                                    <Icon
                                      path={
                                        mdiPackageVariant
                                      }
                                      size={0.9}
                                      className="text-slate-400"
                                    />

                                  </div>
                                )}

                              </div>

                              <div>

                                <p className="font-semibold text-slate-900">
                                  {productName}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  ID: {product._id}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {product.category ||
                                "Uncategorized"}
                            </span>

                          </td>

                          {/* PRICE */}

                          <td className="px-6 py-4 font-semibold text-slate-900">
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          {/* STOCK */}

                          <td className="px-6 py-4">

                            <span
                              className={
                                Number(
                                  product.stock || 0
                                ) > 0
                                  ? "font-semibold text-green-600"
                                  : "font-semibold text-red-600"
                              }
                            >
                              {product.stock ?? 0}
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-2">

                              {/* EDIT */}

                              <Link
                                href={`/admin/products/${product._id}/edit`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                                title="Edit"
                              >
                                <Icon
                                  path={mdiPencil}
                                  size={0.7}
                                />
                              </Link>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteClick(
                                    product
                                  )
                                }
                                disabled={
                                  deleteLoading
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete"
                              >
                                <Icon
                                  path={mdiDelete}
                                  size={0.7}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                MOBILE CARDS
                ================================================= */}

            <div className="divide-y divide-slate-100 md:hidden">

              {filteredProducts.map(
                (product) => {

                  const productName =
                    product.name?.trim() ||
                    product.title?.trim() ||
                    "Untitled Product";

                  const image =
                    product.images?.[0]?.url;

                  return (
                    <div
                      key={product._id}
                      className="p-4"
                    >

                      <div className="flex gap-4">

                        {/* IMAGE */}

                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                          {image ? (
                            <Image
                              src={image}
                              alt={productName}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">

                              <Icon
                                path={
                                  mdiPackageVariant
                                }
                                size={1}
                                className="text-slate-400"
                              />

                            </div>
                          )}

                        </div>

                        {/* DETAILS */}

                        <div className="min-w-0 flex-1">

                          <h3 className="truncate font-semibold text-slate-900">
                            {productName}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {product.category ||
                              "Uncategorized"}
                          </p>

                          <p className="mt-2 font-bold text-slate-900">
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Stock:{" "}
                            {product.stock ?? 0}
                          </p>

                        </div>

                      </div>

                      {/* MOBILE ACTIONS */}

                      <div className="mt-4 flex gap-2">

                        {/* EDIT */}

                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          <Icon
                            path={mdiPencil}
                            size={0.7}
                          />

                          Edit
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick(
                              product
                            )
                          }
                          disabled={
                            deleteLoading
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon
                            path={mdiDelete}
                            size={0.7}
                          />

                          Delete
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* =================================================
                EMPTY STATE
                ================================================= */}

            {filteredProducts.length ===
              0 && (
              <div className="px-6 py-16 text-center">

                <Icon
                  path={mdiPackageVariant}
                  size={2}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  No products found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try another search or add a
                  new product.
                </p>

              </div>
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
          ===================================================== */}

      {productToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-100 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">

                  <Icon
                    path={
                      mdiAlertCircleOutline
                    }
                    size={1}
                  />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Delete Product?
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    This action cannot be undone.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  handleCancelDelete
                }
                disabled={deleteLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close"
              >
                <Icon
                  path={mdiClose}
                  size={0.8}
                />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-6">

              <p className="text-sm leading-6 text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-900">
                  {productToDelete.name?.trim() ||
                    productToDelete.title?.trim() ||
                    "this product"}
                </span>
                ?
              </p>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                The product will be removed from
                your database and its image will
                also be removed from Cloudinary.
              </p>

            </div>

            {/* MODAL ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end">

              {/* CANCEL */}

              <button
                type="button"
                onClick={
                  handleCancelDelete
                }
                disabled={deleteLoading}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              {/* DELETE */}

              <button
                type="button"
                onClick={
                  handleConfirmDelete
                }
                disabled={deleteLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {deleteLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Icon
                      path={mdiDelete}
                      size={0.75}
                    />

                    Delete Product
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}