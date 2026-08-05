import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../lib/api";

export { API_BASE };

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("castingai_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
