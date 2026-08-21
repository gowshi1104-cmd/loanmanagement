import api from "../api/axios";

// =========================================================
// GET NOTIFICATIONS
// =========================================================

export const getNotifications = () =>
  api.get("/notifications");

// =========================================================
// GET UNREAD COUNT
// =========================================================

export const getUnreadCount = () =>
  api.get("/notifications/unread-count");

// =========================================================
// MARK ONE AS READ
// =========================================================

export const markNotificationAsRead = (id) =>
  api.put(`/notifications/${id}/read`);

// =========================================================
// MARK ALL AS READ
// =========================================================

export const markAllNotificationsAsRead = () =>
  api.put("/notifications/read-all");