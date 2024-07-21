import store from "../utils/store.js";
import router from "../utils/router.js";
const Logout = {
  template: `
      <div> 
          <h1 v-if="logoutSuccess">Successful Logged out </h1>
          <h1 v-else> Logout Unsuccessful</h1>
      </div>
      `,
  data() {
    return {
      logoutSuccess: false,
    };
  },
  async mounted() {
    try {
      const res = await fetch(window.location.origin + "/logout");
      if (res.ok) {
        this.logoutSuccess = true;
        store.commit("logout");
        window.triggerToast("Logged out successfully!");
        router.push("/");
      } else {
        this.logoutSuccess = false;
      }
    } catch (error) {
      this.logoutSuccess = false;
      window.triggerToast("Logout failed. Please try again.", "danger");
    }
  },
};

export default Logout;
