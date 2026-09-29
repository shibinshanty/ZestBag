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
        console.log("AUTH INITIALIZER: Starting...");

        const token = localStorage.getItem("token");

        console.log("AUTH INITIALIZER: Token exists:", !!token);

        // No token means the user is logged out
        if (!token) {
          console.log("AUTH INITIALIZER: No token found");
          return;
        }

        console.log("AUTH INITIALIZER: Calling getProfile...");

        const profileData = await getProfile();

        console.log(
          "AUTH INITIALIZER: Profile response:",
          profileData
        );

        if (
          !profileData ||
          !profileData._id ||
          !profileData.name ||
          !profileData.email
        ) {
          console.error(
            "AUTH INITIALIZER: Invalid profile data:",
            profileData
          );

          console.error(
            "AUTH INITIALIZER: Token will NOT be removed during debugging."
          );

          return;
        }

        console.log(
          "AUTH INITIALIZER: Profile validation successful"
        );

        dispatch(
          login({
            user: profileData,
            token,
          })
        );

        console.log(
          "AUTH INITIALIZER: User restored successfully"
        );

        try {
          const cartData = await getCart();

          dispatch(setCart(cartData));

          console.log(
            "AUTH INITIALIZER: Cart restored successfully"
          );
        } catch (cartError) {
          console.error(
            "AUTH INITIALIZER: Failed to restore cart:",
            cartError
          );
        }
      } catch (error) {
        console.error(
          "AUTH INITIALIZER: Failed to restore authentication:",
          error
        );

        console.error(
          "AUTH INITIALIZER: Token will NOT be removed during debugging."
        );
      } finally {
        dispatch(setAuthInitialized(true));

        console.log(
          "AUTH INITIALIZER: Authentication initialization completed"
        );
      }
    };

    restoreAuth();
  }, [dispatch]);

  return null;
}