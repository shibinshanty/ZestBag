import api from "../lib/axios";



export interface CustomerDashboard {
  totalCustomers: number;
}


export interface ProductDashboard {
  totalProducts: number;
  lowStockProducts: number;
}



export interface OrderStatus {
  [key: string]: number;
}

export interface RecentOrder {
  _id: string;
  userId: string;
  totalPrice: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  trackingToken?: string;
}

export interface OrderDashboard {
  totalSales: number;
  totalOrders: number;
  orderStatus: OrderStatus;
  recentOrders: RecentOrder[];
}



export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  membership: "normal" | "premium";
  isEmailVerified: boolean;
  createdAt: string;
}



export async function getCustomerDashboard(): Promise<CustomerDashboard> {
  const response = await api.get("/api/auth/admin/dashboard");

  return response.data.dashboard;
}



export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get("/api/auth/admin/users");

  return response.data.users;
}



export async function getProductDashboard(): Promise<ProductDashboard> {
  const response = await api.get("/api/products/admin/dashboard");

  return response.data.dashboard;
}



export async function getOrderDashboard(): Promise<OrderDashboard> {
  const response = await api.get("/api/order/admin/dashboard");

  return response.data.dashboard;
}