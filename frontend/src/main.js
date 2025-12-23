import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import router from "./router";
import "./style.css";

// Import các trọng lượng bạn cần (thường dùng 400, 500, 600, 700)
import "@fontsource/inter/400.css"; // Regular
import "@fontsource/inter/500.css"; // Medium
import "@fontsource/inter/600.css"; // SemiBold
import "@fontsource/inter/700.css"; // Bold
// main.js – thêm vào cuối file, trước createApp
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000/api";
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
const app = createApp(App);
app.use(router);
app.mount("#app");
