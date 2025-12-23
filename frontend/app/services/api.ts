import axios from "axios";
import * as SecureStore from "expo-secure-store";

// REPLACE '192.168.x.x' WITH YOUR ACTUAL COMPUTER IP FROM STEP 2
// Keep the :8000 port.
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Automatically add the Token to every request if we have one
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("user_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  signup: (data: any) => api.post("/auth/signup", data),
  // Login sends form-data, not JSON, so we format it strictly
  login: (data: any) => {
    const formData = new FormData();
    formData.append("username", data.email);
    formData.append("password", data.password);
    return api.post("/auth/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const lists = {
  getAll: () => api.get("/lists/"),
  create: (title: string) => api.post("/lists/", { title }),
  share: (listId: string, email: string) =>
    api.post(`/lists/${listId}/share`, { email }),
  delete: (listId: string) => api.delete(`/lists/${listId}`),
};

export const items = {
  getByList: (listId: string) => api.get(`/api/${listId}/items`),
  create: (listId: string, title: string) =>
    api.post(`/api/${listId}/items`, { title }),
  update: (itemId: string, updates: { is_complete?: boolean }) =>
    api.patch(`/api/items/${itemId}`, updates),
  delete: (itemId: string) => api.delete(`/api/items/${itemId}`), // <--- ADD THIS
};

export default api;
