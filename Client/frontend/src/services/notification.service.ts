import api from "../lib/axios";

export interface Notification {
  _id: string;
  recipientType: "user" | "admin";
  userId: string;
  type: string;
  title: string;
  message: string;
  orderId?: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetNotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

export async function getAdminNotifications(): Promise<Notification[]> {
  const response = await api.get<GetNotificationsResponse>(
    "/api/notifications?recipientType=admin"
  );

  return response.data.notifications;
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  const response = await api.put<{ 
    success: boolean;
    notification: Notification;
  }>(
    `/api/notifications/${notificationId}/read`
  );

  return response.data.notification;
}