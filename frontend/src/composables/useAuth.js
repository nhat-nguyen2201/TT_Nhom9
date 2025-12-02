// src/composables/useAuth.js
import { ref, onMounted } from "vue";

export function useAuth() {
  const user = ref(null);
  const isLoggedIn = ref(false);

  const loadUser = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      user.value = JSON.parse(userData);
      isLoggedIn.value = true;
    } else {
      user.value = null;
      isLoggedIn.value = false;
    }
  };

  // Load ngay khi khởi động
  onMounted(loadUser);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    isLoggedIn.value = false;
    user.value = null;
    // Chuyển về trang login
    window.location.href = "/login";
  };

  return { user, isLoggedIn, loadUser, logout };
}