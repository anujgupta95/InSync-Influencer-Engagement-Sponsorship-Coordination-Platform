const Campaign = {
  template: `
    <div class="card mb-3">
        <div class="card-body">
            <div v-if="isEditing">
                <div class="form-floating mb-2">
                    <input type="text" class="form-control" v-model="editcampaignData.name" placeholder="Campaign Name" required/>
                    <label>Campaign Name</label>
                </div>
                <div class="form-floating mb-2">
                    <textarea class="form-control" v-model="editcampaignData.description" placeholder="Description" required></textarea>
                    <label>Description</label>
                </div>
                <div class="form-floating mb-2">
                    <input type="date" class="form-control" v-model="editcampaignData.start_date"placeholder="Start Date" required/>
                    <label>Start Date</label>
                </div>
                <div>
                    <div class="form-floating mb-2">
                        <input type="date" class="form-control" v-model="editcampaignData.end_date" placeholder="End Date" required/>
                        <label>End Date</label>
                    </div>
                    <div v-if="date_error" style="color: red;"><b>{{date_error}}</b></div>
                </div>
                <div class="form-floating mb-2">
                    <input type="number" class="form-control" v-model="editcampaignData.budget" placeholder="Budget" required/>
                    <label>Budget</label>
                </div>
                <div class="form-floating mb-2">
                    <select v-model="editcampaignData.visibility" class="form-control" name="visibility" required>
                    <option value="public" >Public</option>
                    <option value="private">private</option>
                    </select>
                    <label for="visibility">Visibility</label>
                </div>
                <div class="form-floating mb-2">
                    <textarea class="form-control" v-model="editcampaignData.goals" placeholder="Goals" required></textarea>
                    <label>Goals</label>
                </div>
                <button class="btn btn-primary w-48" @click="saveCampaign">Save</button>
                <button class="btn btn-outline-secondary w-50" @click="cancelEdit">Cancel</button>
            </div>
            <div v-else>
                <h5 class="card-title">{{ campaign.name }}</h5>
                <p class="card-subtitle mb-2 text-muted">{{ campaign.description }}</p>
                <p class="card-text"><strong>Start Date:</strong> {{ campaign.start_date }}</p>
                <p class="card-text"><strong>End Date:</strong> {{ campaign.end_date }}</p>
                <p class="card-text"><strong>Budget:</strong> {{ campaign.budget }}</p>
                <p class="card-text"><strong>Visibility:</strong> {{ campaign.visibility }}</p>
                <p class="card-text"><strong>Goals:</strong> {{ campaign.goals }}</p>
                <button @click="editCampaign" class="btn btn-warning w-48">Edit</button>
                <button @click="deleteCampaign" class="btn btn-danger w-50">Delete</button>
            </div>
        </div>
    </div>
    `,
  data() {
    return {
      isEditing: false,
      editcampaignData: { ...this.campaign },
      date_error: "",
    };
  },
  props: {
    campaign: {
      type: Object,
      required: true,
    },
  },
  watch: {
    "editcampaignData.start_date": function (start_date) {
      console.log(start_date, this.campaign.end_date);
      this.date_error = "";
      if (start_date > this.campaign.end_date) {
        this.date_error = "End date can not be before start date";
      }
    },
    "editcampaignData.end_date": function (end_date) {
      this.date_error = "";
      if (this.campaign.start_date > end_date) {
        this.date_error = "End date can not be before start date";
      }
    },
  },
  methods: {
    async deleteCampaign() {
      const confirmation = confirm(
        "Are you sure you want to delete this campaign?"
      );
      if (!confirmation) return;

      try {
        const response = await fetch(`/api/campaign/${this.campaign.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          window.triggerToast("Failed to delete campaign", "danger");
        }

        window.triggerToast("Campaign deleted successfully", "success");
        this.$emit("delete", this.campaign.id);
      } catch (error) {
        window.triggerToast(
          "An error occurred while trying to delete the campaign",
          "warning"
        );
      }
    },
    editCampaign() {
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
      this.editcampaignData = { ...this.campaign };
    },
    async saveCampaign() {
      if (
        !this.editcampaignData.name ||
        !this.editcampaignData.description ||
        !this.editcampaignData.start_date ||
        !this.editcampaignData.end_date ||
        !this.editcampaignData.budget ||
        !this.editcampaignData.visibility ||
        !this.editcampaignData.goals ||
        this.editcampaignData.start_date > this.editcampaignData.end_date
      ) {
        window.triggerToast("Please enter Valid details", "warning");
        return false;
      }
      try {
        const response = await fetch(`/api/campaign/${this.campaign.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // "Authentication-Token": localStorage.getItem("token"),
          },
          body: JSON.stringify(this.editcampaignData),
        });

        const data = await response.json();
        if (!response.ok) {
          window.triggerToast(
            data.message || "Error updating campaign",
            "danger"
          );
          throw new Error(data.message);
        }

        window.triggerToast("Campaign updated successfully", "success");
        this.isEditing = false;
        this.$emit("update");
      } catch (error) {
        window.triggerToast(error, "warning");
      }
    },
  },
};

export default Campaign;
