Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    loggedIn: false,
    role: "",
  },

  mutations: {
    setLogIn(state, role) {
      state.loggedIn = true;
      state.role = role;
    },
    logout(state) {
      state.loggedIn = false;
      state.role = "";
    },
  },
  actions: {
    async checkLogin({ commit }) {
      try {
        const res = await fetch(window.location.origin + "/check_login");
        const data = await res.json();
        if (data.loggedIn) {
          commit("setLogIn", data.role);
        } else {
          commit("logout");
        }
      } catch {
        commit("logout");
      }
    },
  },

  getters: {
    isLoggedIn: (state) => state.loggedIn,
    userRole: (state) => state.role,
  },
});

export default store;
