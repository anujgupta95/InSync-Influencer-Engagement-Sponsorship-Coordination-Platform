Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    loggedIn: false,
    role: "",
  },

  mutations: {
    setLogIn(state) {
      state.loggedIn = true;
    },
    logout(state) {
      state.loggedIn = false;
    },
    setRole(state, role) {
      state.role = role;
    },
  },
});

export default store;
