import api from "../lib/axios";

// =====================================================
// TYPES
// =====================================================

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  transactionId?: string;
  status?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export type PaymentMethod = "COD" | "Online";

export type PaymentStatus =
  | "Pending"
  | "Completed"
  | "Failed";

export type DeliveryType =
  | "Standard"
  | "Premium";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

// =====================================================
// ORDER
// =====================================================

export interface Order {
  _id: string;

  user: string;

  orderItems: OrderItem[];

  shippingAddress: ShippingAddress;

  paymentMethod: PaymentMethod;

  paymentStatus: PaymentStatus;

  paymentInfo?: PaymentInfo;

  isPaid: boolean;

  totalPrice: number;

  deliveryType: DeliveryType;

  estimatedDeliveryDate?: string;

  orderStatus: OrderStatus;

  deliveredAt?: string;

  cancellationReason?: string;

  // ===================================================
  // TRACKING
  // ===================================================

  trackingToken?: string;

  trackingNumber?: string;

  courierName?: string;

  trackingUrl?: string;

  shippedAt?: string;

  outForDeliveryAt?: string;

  createdAt: string;

  updatedAt: string;
}

// =====================================================
// PUBLIC ORDER TRACKING
// =====================================================

export interface OrderTracking {
  orderNumber: string;

  orderStatus: OrderStatus;

  courierName?: string | null;

  trackingNumber?: string | null;

  shippedAt?: string | null;

  outForDeliveryAt?: string | null;

  deliveredAt?: string | null;

  estimatedDeliveryDate?: string | null;

  createdAt: string;
}

// =====================================================
// GET ALL ORDERS - ADMIN
// =====================================================

export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await api.get(
      "/api/order/allorders"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all orders:",
      error
    );

    throw error;
  }
}

// =====================================================
// GET SINGLE ORDER - ADMIN
// =====================================================

export async function getOrderById(
  id: string
): Promise<Order> {
  try {
    const response = await api.get(
      `/api/order/${id}`
    );

    return response.data.order || response.data;
  } catch (error) {
    console.error(
      "Error fetching order:",
      error
    );

    throw error;
  }
}

// =====================================================
// UPDATE ORDER STATUS - ADMIN
// =====================================================

export async function updateOrderStatus(
  id: string,
  orderStatus: OrderStatus,
  cancellationReason?: string
): Promise<Order> {
  try {
    const response = await api.put(
      `/api/order/updatestatus/${id}`,
      {
        orderStatus,

        ...(cancellationReason
          ? { cancellationReason }
          : {}),
      }
    );

    return response.data.order;
  } catch (error) {
    console.error(
      "Error updating order status:",
      error
    );

    throw error;
  }
}

// =====================================================
// UPDATE ORDER TRACKING - ADMIN
// =====================================================

export async function updateOrderTracking(
  id: string,
  trackingNumber: string,
  courierName: string,
  trackingUrl: string
): Promise<Order> {
  try {
    const response = await api.put(
      `/api/order/updatetracking/${id}`,
      {
        trackingNumber,
        courierName,
        trackingUrl,
      }
    );

    return response.data.order;
  } catch (error) {
    console.error(
      "Error updating order tracking:",
      error
    );

    throw error;
  }
}

// =====================================================
// TRACK ORDER - PUBLIC
// =====================================================

export async function trackOrder(
  trackingToken: string
): Promise<OrderTracking> {
  try {
    const response = await api.get(
      `/api/order/track/${trackingToken}`
    );

    return response.data.tracking;
  } catch (error) {
    console.error(
      "Error tracking order:",
      error
    );

    throw error;
  }
}