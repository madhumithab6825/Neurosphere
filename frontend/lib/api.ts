import axios from "axios";

const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = async (name: string, email: string, password: string) => {
  const res = await API.post("/auth/register", { name, email, password });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

export const sendMessage = async (message: string) => {
  const res = await API.post("/chat", { message });
  return res.data;
};

export const uploadDoc = async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const res = await API.post("/upload", form);
  return res.data;
};

export const uploadImage = async (file: File, query: string) => {
  const form = new FormData();
  form.append("file", file);
  form.append("query", query);
  const res = await API.post("/ocr", form);
  return res.data;
};

export const uploadData = async (file: File, query: string) => {
  const form = new FormData();
  form.append("file", file);
  form.append("query", query);
  const res = await API.post("/analyze", form);
  return res.data;
};

export const getFiles = async () => {
  const res = await API.get("/files");
  return res.data.files;
};
