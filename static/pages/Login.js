import router from "../utils/router.js";
import store from "../utils/store.js";

const Login = {
  template: `
  <div class="container mt-5" style="max-width:500px;">
        <div class="row">
            <div class="col-md-12">             
                <div class="card login-form shadow-lg">
                    <div class="card-header text-center fw-bold">
                      <!-- <div v-if="message" class="alert alert-success">
                        <i class="bi bi-check-circle"></i> {{ message }}
                      </div>
                      <div v-if="error" class="alert alert-danger">
                        <i class="bi bi-exclamation-circle"></i> {{ error }}
                      </div> -->
                      Login
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="submitInfo">
                            <div class="form-group">
                                <div class="form-floating mt-4">
                                  <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter email" name="email" required>
                                  <label for="email">Email address</label>
                                </div>

                                <div class="input-group mt-4">
                                  <div class="form-floating form-floating-group flex-grow-1">
                                    <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" id="password" placeholder="Enter Password" name="password" required>
                                    <label for="password">Password</label>
                                  </div>
                                  <span class="input-group-text" @click="togglePasswordVisibility">
                                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye-fill'"></i>
                                  </span>
                                </div>
                                <button type="submit" class="btn btn-success w-100 mt-3" @click="submitInfo">Login</button>
                            </div>
                        </form>
                        <div class="mt-2 text-center">
                            Don't have an account? <a href="/#/signup">Sign up</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
  `,
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
    };
  },
  methods: {
    async submitInfo() {
      if (!this.email || !this.password) {
        return false;
      }
      try {
        const res = await fetch(window.location.origin + "/login", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        const data = await res.json();
        if (res.ok) {
          store.commit("setLogIn", data.role);
          if (router.currentRoute.path !== "/") {
            router.push("/");
          }
          window.triggerToast("Login Successful!", "success");
        } else {
          window.triggerToast(data.response.errors[0], "warning");
        }
      } catch (error) {
        window.triggerToast("An error occurred. Please try again.", "error");
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
};

export default Login;
