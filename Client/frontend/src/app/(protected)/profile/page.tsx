"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Edit3,
  Eye,
  EyeOff,
} from "lucide-react";

import ProtectedLayout from "../layout";
import api from "../../../lib/axios";
import Notification from "../../../components/notification/Notification";

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  role: string;
  membership: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // ================================
  // Profile Form State
  // ================================

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
  });

  // ================================
  // Password State
  // ================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ================================
  // Loading State
  // ================================

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ================================
  // Notification State
  // ================================

  const [showNotification, setShowNotification] = useState(false);

  const [notificationType, setNotificationType] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const showMessage = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => {
    setNotificationType(type);
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  // ================================
  // Password Visibility
  // ================================

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ================================
  // GET PROFILE
  // ================================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/auth/profile");

      const user = response.data.user;

      setProfile(user);

      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        district: user.district || "",
        state: user.state || "",
        pincode: user.pincode || "",
      });
    } catch (error: any) {
      console.error("Fetch profile error:", error);

      showMessage(
        "error",
        "Profile Error",
        error?.response?.data?.message || "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // LOAD PROFILE ON PAGE LOAD
  // ================================

  useEffect(() => {
    fetchProfile();
  }, []);

  // ================================
  // PROFILE INPUT CHANGE
  // ================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================================
  // UPDATE PROFILE
  // ================================

  const handleUpdateProfile = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await api.put("/api/auth/profile", formData);

      const updatedUser = response.data.user;

      setProfile(updatedUser);

      setFormData({
        name: updatedUser.name || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        city: updatedUser.city || "",
        district: updatedUser.district || "",
        state: updatedUser.state || "",
        pincode: updatedUser.pincode || "",
      });

      setIsEditing(false);

      showMessage(
        "success",
        "Profile Updated",
        response.data.message || "Profile updated successfully",
      );
    } catch (error: any) {
      console.error("Update profile error:", error);

      showMessage(
        "error",
        "Update Failed",
        error?.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // PASSWORD INPUT CHANGE
  // ================================

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================================
  // CHANGE PASSWORD
  // ================================

  const handleChangePassword = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      setChangingPassword(true);

      const response = await api.put(
        "/api/auth/change-password",
        passwordData,
      );

      showMessage(
        "success",
        "Password Changed",
        response.data.message || "Password changed successfully",
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Hide passwords after successful change
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error("Change password error:", error);

      showMessage(
        "error",
        "Password Change Failed",
        error?.response?.data?.message ||
          "Failed to change password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-sm font-medium text-gray-500">
            Loading profile...
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  // ================================
  // UI
  // ================================

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#fff8f3] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">

          {/* =========================================
              HEADER
              ========================================= */}

          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c87965]">
                Account
              </p>

              <h1 className="mt-2 text-3xl font-black text-[#4a1d3f] sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-[#806b72]">
                Manage your personal information and account settings.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-xl bg-[#4a1d3f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c87965]"
              >
                <Edit3 size={17} />
                Edit Profile
              </button>
            )}
          </div>

          {/* =========================================
              PERSONAL INFORMATION
              ========================================= */}

          <div className="mb-6 rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">

            {/* Section Header */}

            <div className="mb-6 flex items-center gap-4 border-b border-[#f0dfd7] pb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1e8] text-[#c87965]">
                <User size={27} />
              </div>

              <div>
                <h2 className="text-xl font-black text-[#4a1d3f]">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-[#806b72]">
                  Your account and contact details.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>

              {/* =========================================
                  PERSONAL DETAILS
                  ========================================= */}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Full Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-[#ead6ce] bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#4a1d3f] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-[#ead6ce] bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
                    />
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    Email address cannot be changed.
                  </p>
                </div>

                {/* Phone */}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-[#ead6ce] bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#4a1d3f] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {/* Account Type */}

                <div>
                  <label
                    htmlFor="accountType"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Account Type
                  </label>

                  <input
                    id="accountType"
                    type="text"
                    value={
                      profile?.role === "admin"
                        ? "Administrator"
                        : "Customer"
                    }
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-[#ead6ce] bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
                  />
                </div>
              </div>

              {/* =========================================
                  SAVED ADDRESS
                  ========================================= */}

              <div className="mb-5 mt-8 flex items-center gap-3 border-b border-[#f0dfd7] pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1e8] text-[#c87965]">
                  <MapPin size={20} />
                </div>

                <div>
                  <h3 className="font-black text-[#4a1d3f]">
                    Saved Address
                  </h3>

                  <p className="text-xs text-[#806b72]">
                    This address can be used during checkout.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Address */}

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((previous) => ({
                        ...previous,
                        address: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="House name, street, landmark"
                    className="w-full resize-none rounded-xl border border-[#ead6ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#4a1d3f] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* City */}

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    City / Town
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="City or town"
                    className="w-full rounded-xl border border-[#ead6ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#4a1d3f] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* District */}

                <div>
                  <label
                    htmlFor="district"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    District
                  </label>

                  <input
                    id="district"
                    name="district"
                    type="text"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="District"
                    className="w-full rounded-xl border border-[#ead6ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#4a1d3f] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* State */}

                <div>
                  <label
                    htmlFor="state"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="State"
                    className="w-full rounded-xl border border-[#ead6ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#4a1d3f] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Pincode */}

                <div>
                  <label
                    htmlFor="pincode"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Pincode
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="6-digit pincode"
                    className="w-full rounded-xl border border-[#ead6ce] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#4a1d3f] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* =========================================
                  SAVE / CANCEL
                  ========================================= */}

              {isEditing && (
                <div className="mt-7 flex justify-end gap-3 border-t border-[#f0dfd7] pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);

                      if (profile) {
                        setFormData({
                          name: profile.name || "",
                          phone: profile.phone || "",
                          address: profile.address || "",
                          city: profile.city || "",
                          district: profile.district || "",
                          state: profile.state || "",
                          pincode: profile.pincode || "",
                        });
                      }
                    }}
                    className="rounded-full border border-[#ead6ce] px-6 py-3 text-sm font-semibold text-[#4a1d3f] transition hover:bg-[#fff4ed]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-[#4a1d3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c87965] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={17} />

                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* =========================================
              CHANGE PASSWORD
              ========================================= */}

          <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">

            {/* Section Header */}

            <div className="mb-6 flex items-center gap-4 border-b border-[#f0dfd7] pb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1e8] text-[#c87965]">
                <Lock size={25} />
              </div>

              <div>
                <h2 className="text-xl font-black text-[#4a1d3f]">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-[#806b72]">
                  Update your account password.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="grid gap-5 sm:grid-cols-3">

                {/* =========================================
                    CURRENT PASSWORD
                    ========================================= */}

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      required
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Current password"
                      className="w-full rounded-xl border border-[#ead6ce] bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#4a1d3f]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (previous) => !previous,
                        )
                      }
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-[#4a1d3f]"
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* =========================================
                    NEW PASSWORD
                    ========================================= */}

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      required
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="New password"
                      className="w-full rounded-xl border border-[#ead6ce] bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#4a1d3f]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (previous) => !previous,
                        )
                      }
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-[#4a1d3f]"
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* =========================================
                    CONFIRM PASSWORD
                    ========================================= */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      name="confirmPassword"
                      required
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-[#ead6ce] bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#4a1d3f]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous,
                        )
                      }
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-[#4a1d3f]"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Change Password Button */}

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center gap-2 rounded-full bg-[#4a1d3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c87965] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lock size={17} />

                  {changingPassword
                    ? "Updating..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* =========================================
            NOTIFICATION COMPONENT
            Same pattern as Checkout
            ========================================= */}

        {showNotification && (
          <Notification
            type={notificationType}
            title={notificationTitle}
            message={notificationMessage}
            onClose={() => setShowNotification(false)}
          />
        )}
      </div>
    </ProtectedLayout>
  );
}