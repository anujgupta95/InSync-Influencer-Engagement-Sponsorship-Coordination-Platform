import router from "../utils/router.js";
const Signup = {
  template: `
  <div class="container mt-5" style="max-width:500px;">
        <div class="row">
            <div class="col-md-12">             
                <div class="card login-form shadow shadow-lg">
                    <div class="card-header text-center fw-bold">
                        Registration
                    </div>
                    <div class="card-body">
                        <form onsubmit="return false">
                            <div class="form-group ">
                                <div class="form-floating mt-2">
                                  <input v-model="name" type="text" class="form-control" id="name" placeholder="Enter name" name="name" required>
                                  <label for="name">Your Full Name</label>
                                </div>

                                <div class="form-floating mt-4">
                                  <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter email" name="email" required>
                                  <label for="email">Email address</label>
                                </div>

                                <div>
                                  <div class="input-group mt-4">
                                    <div class="form-floating form-floating-group flex-grow-1">
                                      <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" id="password" placeholder="Enter Password" name="password" required>
                                      <label for="password">Password</label>
                                    </div>
                                    <span class="input-group-text" @click="togglePasswordVisibility">
                                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye-fill'"></i>
                                    </span>
                                  </div>
                                  <div v-if="pass_error" style="color: red;"><b>{{pass_error}}</b></div>
                                </div>
                                
                                <div class="form-floating mt-4">
                                  <input v-model="cnf_password" type="password" class="form-control" id="cnf_password" placeholder="Enter password again" name="cnf_password" required>
                                  <label for="cnf_password">Confirm Password</label>
                                  <span v-if="cnf_pass_error" style="color: red;"><b>{{cnf_pass_error}}</b></span>
                                </div>

                                <div class="form-floating mt-4">
                                  <select v-model="role" class="form-select" id="role" name="role" required>
                                    <option disabled selected>Choose role</option>
                                    <option value="influencer" >Influencer</option>
                                    <option value="sponsor">Sponsor</option>
                                  </select>
                                  <label for="role">Role</label>
                                </div>
                                
                                <div v-if="role === 'influencer'" id="influencerData">
                                  <div class="form-floating mt-4">
                                    <input v-model="influencerData.category" type="text" class="form-control" placeholder="Enter Category" name="category" required>
                                    <label for="category">Category</label>
                                  </div>
                                  <div class="form-floating mt-4">
                                    <input v-model="influencerData.niche" type="text" class="form-control" placeholder="Enter Niche" name="niche" required>
                                    <label for="niche">Niche</label>
                                  </div>
                                  <div class="form-floating mt-4">
                                    <input v-model="influencerData.followers" type="number" class="form-control" placeholder="Enter Followers" name="followers" required>
                                    <label for="followers">Followers</label>
                                  </div>
                                </div>
                                <div v-if="role === 'sponsor'" id="sponsorData">
                                  <div class="form-floating mt-4">
                                    <input v-model="sponsorData.company_name" type="text" class="form-control" placeholder="Enter Company Name" name="company_name" required>
                                    <label for="company_name">Company Name</label>
                                  </div>
                                  <div class="form-floating mt-4">
                                    <input v-model="sponsorData.industry" type="text" class="form-control" placeholder="Enter Industry" name="industry" required>
                                    <label for="industry">Industry</label>
                                  </div>
                                  <div class="form-floating mt-4">
                                    <input v-model="sponsorData.budget" type="number" class="form-control" placeholder="Enter Budget" name="budget" required>
                                    <label for="budget">Budget</label>
                                  </div>
                                </div>
                                <button type="submit" class="btn btn-success w-100 mt-3" @click="submitInfo">Sign Up</button>
                            </div>
                        </form>
                        <div class="mt-2 text-center">
                            Already have an account? <a href="/#/login">Login</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `,
  data() {
    return {
      name: "",
      email: "",
      password: "",
      cnf_password: "",
      role: "Choose role",
      pass_error: "",
      cnf_pass_error: "",
      showPassword: false,
      sponsorData: {
        company_name: "",
        industry: "",
        budget: 0,
      },
      influencerData: {
        category: "",
        niche: "",
        followers: 0,
      },
    };
  },
  watch: {
    password: function (password) {
      if (password.length < 4) {
        this.pass_error = "Password should be attleast 4 characters";
      } else {
        this.pass_error = "";
      }
      if (password != this.cnf_password) {
        this.cnf_pass_error = "Password must be same";
      } else {
        this.cnf_pass_error = "";
      }
    },
    cnf_password: function (cnf_password) {
      if (this.password != cnf_password) {
        this.cnf_pass_error = "Password must be same";
      } else {
        this.cnf_pass_error = "";
      }
    },
  },
  methods: {
    async submitInfo() {
      if (
        !this.email ||
        !this.name ||
        !this.password ||
        !this.cnf_password ||
        this.password.length < 4 ||
        this.password !== this.cnf_password ||
        this.role == "Choose role"
      ) {
        window.triggerToast("Enter Valid details", "warning");
        return false;
      }
      if (
        this.role == "influencer" &&
        (!this.influencerData.category ||
          !this.influencerData.niche ||
          !this.influencerData.followers)
      ) {
        window.triggerToast("Enter Valid Inluencer details", "warning");
        return false;
      } else if (
        this.role == "sponsor" &&
        (!this.sponsorData.company_name ||
          !this.sponsorData.industry ||
          !this.sponsorData.budget)
      ) {
        window.triggerToast("Enter Valid Inluencer details", "warning");
        return false;
      }

      const url = window.location.origin;
      try {
        const res = await fetch(url + "/signup", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            name: this.name,
            role: this.role,
            category: this.influencerData.category,
            niche: this.influencerData.niche,
            followers: this.influencerData.followers,
            company_name: this.sponsorData.company_name,
            industry: this.sponsorData.industry,
            budget: this.sponsorData.budget,
          }),
          credentials: "same-origin",
        });

        const data = await res.json();
        if (data.error) {
          window.triggerToast(data.error, "warning");
        } else if (data.message) {
          router.push("/login");
          window.triggerToast("Account created successfully", "success");
        }
      } catch (error) {
        window.triggerToast("Signup failed. Please try again.", "danger");
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
};

export default Signup;
