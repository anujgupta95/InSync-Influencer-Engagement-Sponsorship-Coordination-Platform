import Navbar from "./components/Navbar.js";
import Toast from "./components/Toast.js";
import router from "./utils/router.js";
import store from "./utils/store.js";

new Vue({
  el: "#app",
  template: `
    <div>
        <Navbar/>
        <Toast/>
        <router-view/>
    </div>
  `,
  router,
  store,
  components: {
    Navbar,
    Toast,
  },
});
