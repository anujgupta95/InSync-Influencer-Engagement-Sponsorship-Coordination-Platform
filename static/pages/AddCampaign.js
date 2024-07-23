const AddCampaign = {
  template: `
      <div class="container mt-5" style="max-width: 500px;">
        <div class="row">
          <div class="col-md-12">
            <div class="card shadow shadow-lg">
              <div class="card-header text-center fw-bold">
                Add New Campaign
              </div>
              <div class="card-body">
                <form @submit.prevent="createCampaign">
                  <div class="form-group">
                    <div class="form-floating mt-2">
                      <input
                        v-model="campaignData.name"
                        type="text"
                        class="form-control"
                        id="name"
                        placeholder="Campaign Name"
                        required
                      />
                      <label for="name">Campaign Name</label>
                    </div>
                    <div class="form-floating mt-4">
                      <textarea
                        v-model="campaignData.description"
                        class="form-control"
                        id="description"
                        placeholder="Description"
                        required
                      ></textarea>
                      <label for="description">Description</label>
                    </div>
                    <div class="form-floating mt-4">
                      <input
                        v-model="campaignData.start_date"
                        type="date"
                        class="form-control"
                        id="start_date"
                        placeholder="Start Date"
                        required
                      />
                      <label for="start_date">Start Date</label>
                    </div>
                    <div class="form-floating mt-4">
                      <input
                        v-model="campaignData.end_date"
                        type="date"
                        class="form-control"
                        id="end_date"
                        placeholder="End Date"
                        required
                      />
                      <label for="end_date">End Date</label>
                    </div>
                    <div v-if="date_error" class="text-danger mt-2">
                      <b>{{ date_error }}</b>
                    </div>
                    <div class="form-floating mt-4">
                      <input
                        v-model="campaignData.budget"
                        type="number"
                        class="form-control"
                        id="budget"
                        placeholder="Budget"
                        required
                      />
                      <label for="budget">Budget</label>
                    </div>
                    <div class="form-floating mt-4">
                      <select
                        v-model="campaignData.visibility"
                        class="form-select"
                        id="visibility"
                        required
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                      <label for="visibility">Visibility</label>
                    </div>
                    <div class="form-floating mt-4">
                      <textarea
                        v-model="campaignData.goals"
                        class="form-control"
                        id="goals"
                        placeholder="Goals"
                        required
                      ></textarea>
                      <label for="goals">Goals</label>
                    </div>
                    <button type="submit" class="btn btn-success w-100 mt-3">
                      Create Campaign
                    </button>
                    <button
                      type="button"
                      @click="resetForm"
                      class="btn btn-secondary w-100 mt-2"
                    >
                      Reset
                    </button>
                  </div>
                </form>
                <div class="mt-2 text-center">
                  <router-link to="/sponsor/dashboard">Back to Dashboard</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  data() {
    return {
      campaignData: {
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        budget: null,
        visibility: "public",
        goals: "",
      },
      date_error: "",
    };
  },
  methods: {
    async createCampaign() {
      if (this.campaignData.start_date > this.campaignData.end_date) {
        this.date_error = "End date cannot be before start date";
        return;
      }
      this.date_error = "";

      try {
        const response = await fetch("/api/campaign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.campaignData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          window.triggerToast(
            errorData.message || "Failed to create campaign",
            "danger"
          );
          return;
        }

        window.triggerToast("Campaign created successfully", "success");
        this.resetForm();
      } catch (error) {
        console.error("Failed to create campaign:", error);
        window.triggerToast(
          "An error occurred while creating the campaign",
          "danger"
        );
      }
    },
    resetForm() {
      this.campaignData = {
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        budget: null,
        visibility: "public",
        goals: "",
      };
      this.date_error = "";
    },
  },
};

export default AddCampaign;
