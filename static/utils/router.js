Vue.use(VueRouter);

import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Signup from "../pages/Signup.js";
import Profile from "../pages/Profile.js";
import Logout from "../pages/Logout.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/profile", component: Profile },
  { path: "/logout", component: Logout },
];

const router = new VueRouter({
  // mode: "history", // Ensure history mode is enabled
  routes,
});

export default router;
