// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// KHÔNG DÙNG @ NỮA, MÀ DÙNG ..
// router nằm trong src/router, nên phải lùi ra 1 cấp (..) để về src, rồi vào views

const HomePage = () => import("../views/HomePage.vue");
const AuthLogin = () => import("../views/auth/AuthLogin.vue");
const AuthRegister = () => import("../views/auth/AuthRegister.vue");
const AdminLayout = () => import("../views/admin/AdminLayout.vue");

// Các trang admin 
const AdminDashboard = () => import("../views/admin/AdminDashboard.vue");
const AdminUsers = () => import("../views/admin/UserManagement.vue");
const AdminPosts = () => import("../views/admin/PostManagement.vue");
const AdminReports = () => import("../views/admin/ReportedPosts.vue");
const AdminStats = () => import("../views/admin/SystemStats.vue");
const ForgotPassword = () => import("../views/auth/ForgotPassword.vue");
const ResetPassword = () => import("../views/auth/ResetPassword.vue");
const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/login",
    name: "Login",
    component: AuthLogin,
  },
  {
    path: "/register",
    name: "Register",
    component: AuthRegister,
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
  },
  
  // ADMIN ROUTES – HOÀN CHỈNH 100%
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: "", redirect: "dashboard" },
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: AdminDashboard,
      },
      {
        path: "users",
        name: "AdminUsers",
        component: AdminUsers,
      },
      {
        path: "posts",
        name: "AdminPosts",
        component: AdminPosts,
      },
      {
        path: "reports",
        name: "AdminReports",
        component: AdminReports,
      },
      {
        path: "stats",
        name: "AdminStats",
        component: AdminStats,
      },
    ],
  },

  // 404 fallback
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// BẢO VỆ ADMIN – SIÊU ỔN ĐỊNH, KHÔNG BAO GIỜ LỖI

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    try {
      const userJson = localStorage.getItem("user");
      if (!userJson) {
        alert("Vui lòng đăng nhập với tài khoản Admin!");
        return next("/login");
      }

      const user = JSON.parse(userJson);
      if (user.role !== "admin") {
        alert("Bạn không có quyền truy cập khu vực Admin!");
        return next("/login");
      }

      return next(); 
    } catch (err) {
      console.error("Lỗi parse user:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return next("/login");
    }
  }

  next();
});

export default router;
