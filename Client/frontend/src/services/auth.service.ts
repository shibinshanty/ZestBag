import api from "../lib/axios";
import type { User } from "../types/user";

type LoginData = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  message: string;
  email?: string;
};

type VerifyOtpData = {
  email: string;
  otp: string;
};

type VerifyOtpResponse = {
  message: string;
  token?: string;
  user?: User;
};

type ResendOtpData = {
  email: string;
};

type ResendOtpResponse = {
  message: string;
};


type ForgotPasswordData = {
  email: string;
};

type ForgotPasswordResponse = {
  success: boolean;
  message: string;
};

type ResetPasswordData = {
  password: string;
  confirmPassword: string;
};

type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

type ValidateResetPasswordTokenResponse = {
  success: boolean;
  message: string;
};

export async function loginUser(
  data: LoginData
): Promise<LoginResponse> {
  const response = await api.post(
    "/api/auth/login",
    data
  );

  return response.data;
}

export async function getProfile(): Promise<User> {
  const response = await api.get("/api/auth/profile");

  return response.data;
}

export async function registerUser(
  data: RegisterData
): Promise<RegisterResponse> {
  const response = await api.post(
    "/api/auth/register",
    data
  );

  return response.data;
}

export async function verifyOtp(
  data: VerifyOtpData
): Promise<VerifyOtpResponse> {
  const response = await api.post(
    "/api/auth/verify-otp",
    data
  );

  return response.data;
}

export async function resendOtp(
  data: ResendOtpData
): Promise<ResendOtpResponse> {
  const response = await api.post(
    "/api/auth/resend-otp",
    data
  );

  return response.data;
}

export async function forgotPassword(
  data: ForgotPasswordData
): Promise<ForgotPasswordResponse> {
  const response = await api.post(
    "/api/auth/forgot-password",
    data
  );

  return response.data;
}


export async function resetPassword(
  token: string,
  data: ResetPasswordData
): Promise<ResetPasswordResponse> {
  const response = await api.post(
    `/api/auth/reset-password/${token}`,
    data
  );

  return response.data;
}

export async function validateResetPasswordToken(
  token: string
): Promise<ValidateResetPasswordTokenResponse> {
  const response = await api.get(
    `/api/auth/reset-password/${token}`
  );

  return response.data;
}