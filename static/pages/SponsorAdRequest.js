import Campaign from "../components/Campaign.js";
import router from "../utils/router.js";
const SponsorAdRequest = {
  template: `
    <div>
        <div class="container mt-4" v-if="adRequest && campaign">
          <div class="d-flex flex-wrap">
            <div class="col-12 ">
              <campaign :campaign="campaign" @delete="goBack" header="Campaign Details" class="card"></campaign>
            </div>
            <div class="col-12 mt-1">
              <div class="card">
                <h5 class="card-header">Influencer Details</h5>
                <div class="card-body">
                  <div v-if="influencer.influencer_data">
                    <p class="card-text"><strong>Name:</strong> {{ influencer.name }}</p>
                    <p class="card-text"><strong>Category:</strong> {{ influencer.influencer_data.category }}</p>
                    <p class="card-text"><strong>Niche:</strong> {{ influencer.influencer_data.niche }}</p>
                    <p class="card-text"><strong>Followers:</strong> {{ influencer.influencer_data.followers }}</p>
                  </div>
                  <p v-else class="card-text"><strong>No influencer choosen</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div class="card rounded shadow mt-4">
            <h5 class="card-header">Ad Request Details</h5>
            <div class="card-body">
                <div>
                  <div v-if="editRequest" class="mt-4 mb-2">
                        <div class="form-floating mt-2">
                          <select v-model="adRequest.user_id" class="form-select" id="user_id">
                            <option value=0>No Influencer</option>
                            <option v-for="influencer in influencers" :key="influencer.id" :value="influencer.id">
                              {{ influencer.id }} | {{ influencer.name }}
                            </option>
                          </select>
                          <label for="user_id">Influencer ID</label>
                        </div>
                        <div class="form-floating mt-2">
                        </div>
                        <div class="form-floating mt-2">
                          <textarea v-model="adRequest.messages" class="form-control" placeholder="Enter your messages" id="messages" rows="3"></textarea>
                          <label for="messages">Messages</label>
                        </div>
                        <div class="form-floating mt-2">
                          <textarea v-model="adRequest.requirements" class="form-control" placeholder="Enter your requirements" id="requirements" rows="3"></textarea>
                          <label for="requirements">Requirements</label>
                        </div>
                        <div class="form-floating mt-2">
                          <input v-model="adRequest.payment_amount" type="number" class="form-control" id="payment_amount" placeholder="Enter payment amount">
                          <label for="payment_amount">Payment Amount</label>
                        </div>
                        <div class="form-floating mt-2">
                          <select v-model="adRequest.status" class="form-select" id="status" disabled>
                            <option value="pending" selected>Pending</option>
                          </select>
                          <label for="status">Status</label>
                        </div>
                        <button type="submit" @click="editAdRequest" class="btn btn-success w-50 mt-3">Edit Ad Request</button>
                        <button @click="editRequest = false;updateInfo()" class="btn btn-secondary w-48 mt-3">Cancel</button>
                  </div>
                  <div v-if="!editRequest" class="mb-3">
                      <p><strong>Messages:</strong> {{ adRequest.messages }}</p>
                      <p><strong>Requirements:</strong> {{ adRequest.requirements }}</p>
                      <p><strong>Payment Amount:</strong> {{ adRequest.payment_amount }}</p>
                      <p><strong>Status:</strong> {{ adRequest.status }}</p>
                      <h4>Notes</h4>
                      <div class="mb-3">
                        <textarea v-model="adRequest.negotiation_notes" class="form-control" rows="10" placeholder="Add negotiation notes" disabled></textarea>
                      </div>
                      <p><strong>Revised Payment Amount:</strong> {{ adRequest.revised_payment_amount }}</p>
                  </div>

                  <div v-if="adRequest.status === 'negotiating'" class="mt-4">
                      <h4>Message</h4>
                      <div class="mb-3">
                      <textarea v-model="negotiationNotes" class="form-control" rows="3" placeholder="Add message"></textarea>
                      </div>
                      <div class="mb-3">
                      <input v-model="revisedPaymentAmount" type="number" class="form-control" placeholder="Revised Payment Amount" />
                      </div>
                  </div>
                  <button v-if="adRequest.status === 'negotiating'" @click="updateStatus" class="btn btn-success me-2 w-25">Update Negotiation</button> 
                  <button v-if="!editRequest" @click="editAdRequestInitial" class="btn btn-warning me-2 w-25">Edit Ad Request</button>
                  <button @click="deleteAdRequest" class="btn btn-danger me-2 w-25">Delete Ad Request</button>
                </div>
            </div>
          </div>
        </div>
    </div>
  `,
  data() {
    return {
      adRequest: {},
      campaign: {},
      influencer: {
        influencer_data: {},
      },
      influencers: null,
      editRequest: false,
      negotiationNotes: null,
      revisedPaymentAmount: null,
    };
  },
  async created() {
    this.updateInfo();
  },
  methods: {
    async updateInfo() {
      const adRequestId = this.$route.params.id;
      try {
        const adRequestRes = await fetch(`/api/ad-request/${adRequestId}`);
        this.adRequest = await adRequestRes.json();

        const campaignRes = await fetch(
          `/api/campaign/${this.adRequest.campaign_id}`
        );
        this.campaign = await campaignRes.json();

        const influencerRes = await fetch(
          `/api/user/${this.adRequest.user_id}`
        );
        this.influencer = await influencerRes.json();
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    },
    goBack() {
      router.go(-1);
    },
    async updateStatus() {
      try {
        await fetch(`/api/ad-request/${this.adRequest.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            negotiation_notes: this.negotiationNotes,
            revised_payment_amount: this.revisedPaymentAmount
              ? this.revisedPaymentAmount
              : this.adRequest.payment_amount,
          }),
        });
      } catch (error) {
        console.error(error, error);
        window.triggerToast("Error updating negotiation", "danger");
      }
      this.updateInfo();
      this.negotiationNotes = null;
      this.revisedPaymentAmount = null;
    },
    async editAdRequest() {
      try {
        await fetch(`/api/ad-request/${this.adRequest.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.adRequest),
        });
        this.editRequest = false;
      } catch (error) {
        console.error(error);
        window.triggerToast("Error updating negotiation", "danger");
      }

      this.updateInfo();
      this.negotiationNotes = null;
      this.revisedPaymentAmount = null;
    },

    async deleteAdRequest() {
      if (!confirm("Are you sure you want to delete this ad request?")) {
        return;
      }
      try {
        await fetch(`/api/ad-request/${this.adRequest.id}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(error, error);
        window.triggerToast("Unable to delete Ad Request", "danger");
      }
      // this.updateInfo();
      this.goBack();
    },
    async editAdRequestInitial() {
      this.adRequest.status = "pending";
      if (this.editRequest == true) {
        return;
      }
      try {
        const res = await fetch(`/api/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        this.influencers = data;
      } catch (error) {
        console.error(error, error);
        window.triggerToast("Error fetching influencer details", "warning");
      }
      this.editRequest = true;
    },
  },
  components: {
    Campaign,
  },
};

export default SponsorAdRequest;
