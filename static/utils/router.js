Vue.use(VueRouter);

import store from "./store.js";
import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Signup from "../pages/Signup.js";
import Profile from "../pages/Profile.js";
import Logout from "../pages/Logout.js";
import DashboardSponsor from "../pages/DashboardSponsor.js";
import DashboardInfluencer from "../pages/DashboardInfluencer.js";
import CampaignDetails from "../pages/CampaignDetails.js";
import AddCampaign from "../pages/AddCampaign.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/profile", component: Profile },
  { path: "/logout", component: Logout },
  {
    path: "/sponsor/dashboard",
    component: DashboardSponsor,
    meta: { requiresAuth: true, requiredRole: "sponsor" },
  },
  {
    path: "/sponsor/campaign/add",
    component: AddCampaign,
    meta: { requiresAuth: true, requiredRole: "sponsor" },
  },
  {
    path: "/influencer/dashboard",
    component: DashboardInfluencer,
    meta: { requiresAuth: true, requiredRole: "influencer" },
  },
  {
    path: "/influencer/campaign/apply/:id",
    component: CampaignDetails,
    meta: { requiresAuth: true, requiredRole: "influencer" },
  },
];

const router = new VueRouter({
  // mode: "history", // Ensure history mode is enabled
  routes,
});

router.beforeEach(async (to, from, next) => {
  try {
    await store.dispatch("checkLogin");

    const isLoggedIn = store.getters.isLoggedIn;
    const userRole = store.getters.userRole;

    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!isLoggedIn) {
        next("/login");
      } else if (to.meta.requiredRole && to.meta.requiredRole !== userRole) {
        next("/");
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    console.error("Error in navigation guard:", error);
    next("/login");
  }
});

export default router;
