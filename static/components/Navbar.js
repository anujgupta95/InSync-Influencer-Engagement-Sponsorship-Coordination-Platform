import store from "../utils/store.js";
const Navbar = {
  template: `    
    <header>
      <!-- fixed-top -->
      <nav class="navbar navbar-expand-lg shadow rounded m-2 p-2">
        <div class="container-fluid">
          <a class="navbar-brand" href="/"><strong>Sponsorship</strong></a>
          <button class="navbar-toggler"
            type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            </ul>
            <ul class="navbar-nav mb-2 mb-lg-0">
              <li class="nav-item" v-if="!isLoggedIn">
                <router-link to="/login" class="nav-link">Login</router-link>
              </li>
              <li class="nav-item" v-if="!isLoggedIn">
                <router-link to="/signup" class="nav-link">Sign Up</router-link>
              </li>
              <li v-if="userRole === 'sponsor'" class="nav-item">
                  <router-link to="/influencers" class="nav-link">Influencers</router-link>
              </li>
              <li v-if="userRole === 'sponsor'" class="nav-item">
                  <router-link to="/sponsor/dashboard" class="nav-link">Dashboard</router-link>
              </li>
              <li v-if="userRole === 'influencer'" class="nav-item">
                  <router-link to="/influencer/dashboard" class="nav-link">Dashboard</router-link>
              </li>
              <li v-if="userRole === 'admin'" class="nav-item">
                  <router-link to="/admin/dashboard" class="nav-link">Dashboard</router-link>
              </li>
              <li class="nav-item dropdown ms-2" v-if="isLoggedIn" >
                <a class="nav-link dropdown-header fs-2 bi bi-person-circle icon-link" data-bs-toggle="dropdown" role="button" aria-expanded="false">
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li v-if="userRole !== 'admin'"><router-link to="/profile" class="dropdown-item">Profile</router-link></li>
                  <li v-if="userRole === 'sponsor'">
                    <router-link to="/sponsor/dashboard" class="dropdown-item">Dashboard</router-link>
                  </li>
                  <li v-if="userRole === 'influencer'">
                    <router-link to="/influencer/dashboard" class="dropdown-item">Dashboard</router-link>
                  </li>
                  <li v-if="userRole === 'admin'">
                    <router-link to="/admin/dashboard" class="dropdown-item">Dashboard</router-link>
                  </li>
                  <li><router-link to="/logout" class="dropdown-item">Logout</router-link></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
    `,
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
