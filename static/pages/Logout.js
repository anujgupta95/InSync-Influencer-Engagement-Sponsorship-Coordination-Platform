import store from "../utils/store.js";
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
    console.log("Logout created lifecycle hit!! ");

    const res = await fetch(window.location.origin + "/logout");
    if (res.ok) {
      this.logoutSuccess = true;
      store.commit("logout");
      console.log("committed to store");
    }
  },
};

export default Logout;
