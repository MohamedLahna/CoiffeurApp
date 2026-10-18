import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (config.url?.includes('/admin/')) {
    const token = localStorage.getItem('atelier_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  overview: () => api.get("/admin/overview"),
  barbers: () => api.get("/admin/barbers"),
  createBarber: (payload) => api.post("/admin/barbers", payload),
  updateBarber: (id, payload) => api.patch(`/admin/barbers/${id}`, payload),
  barberSchedules: (id) => api.get(`/admin/barbers/${id}/schedules`),
  services: () => api.get("/admin/services"),
  createService: (payload) => api.post("/admin/services", payload),
  updateService: (id, payload) => api.patch(`/admin/services/${id}`, payload),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  createAddon: (payload) => api.post("/admin/addons", payload),
  updateAddon: (id, payload) => api.patch(`/admin/addons/${id}`, payload),
  deleteAddon: (id) => api.delete(`/admin/addons/${id}`),
  appointments: (params) => api.get("/admin/appointments", { params }),
  updateAppointment: (id, payload) =>
    api.patch(`/admin/appointments/${id}`, payload),
  schedules: () => api.get("/admin/schedules"),
  updateSchedule: (id, payload) => api.patch(`/admin/schedules/${id}`, payload),
};
