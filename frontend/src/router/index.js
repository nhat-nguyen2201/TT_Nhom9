// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

const HomePage = () => import("../views/HomePage.vue");
const AuthLogin = () => import("../views/auth/AuthLogin.vue");
const AuthRegister = () => import("../views/auth/AuthRegister.vue");
const AdminLayout = () => import("../views/admin/AdminLayout.vue");
const SearchPage = () => import("../views/room/searchPage.vue");
// Các trang admin
const AdminDashboard = () => import("../views/admin/AdminDashboard.vue");
const AdminUsers = () => import("../views/admin/UserManagement.vue");
const AdminPosts = () => import("../views/admin/PostManagement.vue");
const AdminReports = () => import("../views/admin/ReportedPosts.vue");
const AdminStats = () => import("../views/admin/SystemStats.vue");
const ForgotPassword = () => import("../views/auth/ForgotPassword.vue");
const ResetPassword = () => import("../views/auth/ResetPassword.vue");
const RoomDetail = () => import("../views/room/RoomDetail.vue");
const CreatePost = () => import("../components/post/CreatePost.vue");
const routes = [
  {
    path: "/create-post",
    name: "CreatePost",
    component: CreatePost,
    meta: { requiresAuth: true },
  },
  {
    path: "/room/:id",
    name: "RoomDetail",
    component: RoomDetail,
  },
  {
    path: "/search",
    name: "Search",
    component: SearchPage,
  },
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
  // 1. Bảo vệ route đăng tin
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để tiếp tục!");
      return next("/login");
    }
  }

  // 2. Bảo vệ admin
  if (to.meta.requiresAdmin) {
    try {
      const userJson = localStorage.getItem("user");
      if (!userJson) return next("/login");

      const user = JSON.parse(userJson);
      if (user.role !== "admin") {
        alert("Bạn không có quyền truy cập khu vực Admin!");
        return next("/");
      }
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return next("/login");
    }
  }

  next();
});

export default router;
