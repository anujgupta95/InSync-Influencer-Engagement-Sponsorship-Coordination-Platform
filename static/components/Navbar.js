import store from "../utils/store.js";
const Navbar = {
  template: `    
    <header>
      <!-- fixed-top -->
      <nav class="navbar navbar-expand-lg shadow rounded m-2 p-2">
        <div class="container-fluid">
          <a class="navbar-brand" href="/"><strong>Sponsorship</strong></a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Dropdown
                </a>
                <ul class="dropdown-menu" >
                  <li ><router-link to="/profile" class="dropdown-item"> Profile </router-link></li>
                  <li><router-link to="/logout" class="dropdown-item"> Logout - Vue </router-link></li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a :href="logoutURL" class="dropdown-item"> Logout </a>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link disabled" aria-disabled="true">Disabled</a>
              </li>
            </ul>
            <form class="d-flex" role="search" >
              <div class="form-floating" >
                <input v-model="search" type="search" class="form-control form-control-lg" placeholder="Search" name="search" required>
                <label for="search">Search</label>
              </div>
              <button class="btn btn-outline-success ms-2" type="submit">
                Search
              </button>
            </form>
            <ul class="navbar-nav mb-2 mb-lg-0">
              <li class="nav-item" v-if="!isLoggedIn">
                <router-link to="/login" class="nav-link"> Login </router-link>
              </li>
              <li class="nav-item" v-if="!isLoggedIn">
                <router-link to="/signup" class="nav-link"> Sign Up </router-link>
              </li>
              <li class="nav-item dropdown" v-if="isLoggedIn" style="margin-left: 10px">
                <a class="nav-link dropdown-center" data-bs-toggle="dropdown" role="button" ria-expanded="false">
                  <i class="bi bi-person-circle" style="font-size:2rem;"></i>
                </a>
                <ul class="dropdown-menu">
                  <li class="nav-item" >
                    <router-link to="/profile" class="dropdown-item"> Profile </router-link>
                  </li>
                  <li class="nav-item">
                    <a :href="logoutURL" class="dropdown-item"> Logout </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
    `,
  data() {
    return {
      search: "",
      logoutURL: window.location.origin + "/logout",
    };
  },
  computed: {
    isLoggedIn() {
      return store.getters.isLoggedIn;
    },
    userRole() {
      return store.getters.userRole;
    },
  },
  mounted() {
    store.dispatch("checkLogin");
  },
};

export default Navbar;
