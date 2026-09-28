"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  login,
  setAuthInitialized,
} from "../../store/slices/authSlice";

import { setCart } from "../../store/slices/cartSlice";
import { getProfile } from "../../services/auth.service";
import { getCart } from "../../services/cart.service";

export default function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        // No token means the user is logged out
        if (!token) {
          return;
        }

        const profileResponse = await getProfile();

    

        const profileData =
          profileResponse?.data?.data?.user ??
          profileResponse?.data?.user ??
          profileResponse?.data?.data ??
          profileResponse?.data ??
          profileResponse?.user ??
          profileResponse;

       

        if (
          !profileData ||
          !profileData._id ||
          !profileData.name ||
          !profileData.email
        ) {
          console.error(
            "Invalid profile data received:",
            profileResponse,
          );

          localStorage.removeItem("token");
          return;
        }

        dispatch(
          login({
            user: profileData,
            token,
          }),
        );

        try {
          const cartData = await getCart();
          dispatch(setCart(cartData));
        } catch (cartError) {
          console.error("Failed to restore cart:", cartError);
        }
      } catch (error) {
        console.error("Failed to restore authentication:", error);

        localStorage.removeItem("token");
      } finally {
        // Always mark authentication initialization as completed
        dispatch(setAuthInitialized(true));
      }
    };

    restoreAuth();
  }, [dispatch]);

  return null;
}