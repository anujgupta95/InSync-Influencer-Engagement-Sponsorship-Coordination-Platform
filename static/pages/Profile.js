const Profile = {
  template: `
  <div>
    <div class="container mt-5" style="max-width:500px;">
    <div class="row">
        <div class="col-md-12">             
            <div class="card login-form shadow shadow-lg">
                <div class="card-header text-center fw-bold">
                    Profile
                </div>
                <div class="card-body">
                    <form @submit.prevent="updateInfo">
                        <div class="form-group ">
                            <div class="form-floating mt-2">
                              <input v-model="name" type="text" class="form-control" id="name" placeholder="Enter name" name="name" required>
                              <label for="name">Your Full Name</label>
                            </div>

                            <div class="form-floating mt-4">
                              <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter email" name="email" disabled>
                              <label for="email">Email address</label>
                            </div>

                            <div class="form-floating mt-4">
                            <input v-model="role" type="text" class="form-control" placeholder="Your Role" name="role" disabled>
                              <!--<select v-model="role" class="form-select" id="role" name="role" disabled>
                                <option value="influencer">Influencer</option>
                                <option value="sponsor">Sponsor</option>
                              </select> -->
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
                            <button type="submit" class="btn btn-success w-100 mt-3" @click="updateInfo">Update Details</button>
                            <button v-if="role === 'influencer'" type="submit" class="btn btn-success w-100 mt-3" @click="updateRole">Become a Sponsor</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
  </div>`,
  data() {
    return {
      name: "",
      email: "",
      role: null,
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
  async mounted() {
    const url = window.location.origin;
    try {
      const res = await fetch(url + "/api/user");
      const data = await res.json();
      if (data.error) {
        window.triggerToast(data.error, "warning");
      } else if (data.message) {
        window.triggerToast(data.message, "success");
      } else {
        // console.log(data);
        this.name = data.name;
        this.email = data.email;
        this.role = data.role;
        this.sponsorData = data.sponsor_data || {};
        this.influencerData = data.influencer_data || {};
      }
    } catch (error) {
      // window.triggerToast("Updation failed. Please try again.", "danger");
      window.triggerToast(error, "danger");
    }
  },
  methods: {
    async updateInfo(update_requested) {
      const url = window.location.origin;
      try {
        const res = await fetch(url + "/api/user", {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            name: this.name,
            request_role_update: update_requested ? "sponsor" : null,
            sponsor_data: this.sponsorData,
            influencer_data: this.influencerData,
          }),
          credentials: "same-origin",
        });

        const data = await res.json();
        if (data.error) {
          window.triggerToast(data.error, "warning");
        } else if (data.message) {
          if (update_requested) {
            router.push("/logout");
            window.triggerToast(
              "Role upgradation request successful.\nNow Please wait until admin approves it",
              "success"
            );
          }
          window.triggerToast(data.message, "success");
        }
      } catch (error) {
        window.triggerToast("Updation failed. Please try again.", "danger");
      }
    },
    updateRole() {
      if (confirm("Are you sure you want to upgrade you role?")) {
        this.updateInfo(true);
      }
    },
  },
};

export default Profile;
