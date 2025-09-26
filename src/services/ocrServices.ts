import axios, { AxiosError, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Update IP if your server changes
const API_URL = "http://192.168.100.19:8000/api";

// --- Create Axios instance ---
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// --- Centralized error handler ---
const handleApiError = (error: any) => {
  console.error(
    "API ERROR:",
    error.response ? JSON.stringify(error.response.data, null, 2) : error.message
  );
  throw error;
};

// --- Logout helper ---
export const logoutUser = async () => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
  console.log(">>> DEBUG user logged out");
};

// --- Request interceptor to add token ---
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor for token refresh ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh: refreshToken });
          await AsyncStorage.setItem("accessToken", data.access);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access}`;
          }
          return api.request(originalRequest);
        } catch {
          await logoutUser();
        }
      } else {
        await logoutUser();
      }
    }

    handleApiError(error);
    return Promise.reject(error);
  }
);

// ----------------- AUTH APIs -----------------
export const registerUser = async (username: string, email: string, password: string) => {
  try {
    await api.post("/auth/register/", { username, email, password });
    return loginUser(username, password); // auto-login
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

export const loginUser = async (username: string, password: string) => {
  try {
    const { data } = await api.post("/auth/login/", { username, password });
    await AsyncStorage.setItem("accessToken", data.access);
    await AsyncStorage.setItem("refreshToken", data.refresh);
    console.log(">>> DEBUG saved accessToken:", data.access);
    return data;
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

// ----------------- OCR APIs -----------------
export interface OCRResult {
  id: number;
  text: string;
  created_at: string;
}

export const uploadImageForOCR = async (uri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", { uri, name: `scan_${Date.now()}.jpg`, type: "image/jpeg" } as any);

    const { data } = await api.post<{ text: string }>("/ocr/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.text ?? "";
  } catch (err) {
    handleApiError(err);
    return ""; // fallback
  }
};

export const fetchOCRResults = async (): Promise<OCRResult[]> => {
  try {
    const { data } = await api.get<OCRResult[]>("/ocr/results/");
    return data;
  } catch (err) {
    handleApiError(err);
    return [];
  }
};

export const fetchOCRResultDetail = async (id: number): Promise<OCRResult | null> => {
  try {
    const { data } = await api.get<OCRResult>(`/ocr/results/${id}/`);
    return data;
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

export const deleteOCRResult = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/ocr/results/${id}/`);
    return true;
  } catch (err) {
    handleApiError(err);
    return false;
  }
};

// ----------------- NOTES APIs -----------------
export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const createNote = async (title: string, content: string): Promise<Note | null> => {
  try {
    const { data } = await api.post<Note>("/notes/", { title, content });
    return data;
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

export const fetchNotes = async (): Promise<Note[]> => {
  try {
    const { data } = await api.get<Note[]>("/notes/");
    return data;
  } catch (err) {
    handleApiError(err);
    return [];
  }
};

export const fetchNoteDetail = async (id: number): Promise<Note | null> => {
  try {
    const { data } = await api.get<Note>(`/notes/${id}/`);
    return data;
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

export const updateNote = async (id: number, title: string, content: string): Promise<Note | null> => {
  try {
    const { data } = await api.put<Note>(`/notes/${id}/`, { title, content });
    return data;
  } catch (err) {
    handleApiError(err);
    return null;
  }
};

export const deleteNote = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/notes/${id}/`);
    return true;
  } catch (err) {
    handleApiError(err);
    return false;
  }
};

// --- Export Axios instance ---
export default api;
