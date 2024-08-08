import router from "../../utils/router.js";
import AdRequest from "../../components/AdRequest.js";
import Campaign from "../../components/Campaign.js";
const SponsorCampaignDetails = {
  template: `
    <div class="container mt-2">
      <div v-if="campaign" class="container mt-4 mb-2">
        <Campaign :campaign="campaign" header="Campaign Details"/>
        <!--<div class="card shadow">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <h2>{{ campaign.name }}</h2>
              <button @click="goBack" class="btn btn-outline-secondary w-25">Back</button>
            </div>
            <p><strong>Description:</strong> {{ campaign.description }}</p>
            <p><strong>Start Date:</strong> {{ campaign.start_date }}</p>
            <p><strong>End Date:</strong> {{ campaign.end_date }}</p>
            <p><strong>Budget:</strong> {{ campaign.budget }}</p>
            <p><strong>Goals:</strong> {{ campaign.goals }}</p>
          </div>-->
        </div>

        <div class='card'>
          <p class="card-header"> Active Ad Requests</p>
          <div class="card-body">
            <div v-if="adRequests.length === 0">
                <h4>No ad requests found.</h4>
            </div>
            <div v-else class="table-responsive">
              <table class="text-center rounded col-12">
                <thead>
                  <tr>
                    <th>Influencer ID</th>
                    <th>Messages</th>
                    <th>Requirements</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AdRequest v-for="adRequest in adRequests" :key="adRequest.id" :adRequest="adRequest" :hideCampaignId="true" class="col-12"/>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div class="mt-4 mb-2">
              <div class="card shadow">
                <div class="card-body">
                  <h4>Create Ad Request</h4>
                  <div class="form-floating mt-2">
                    <select v-model="createAdRequestData.user_id" class="form-select" id="user_id">
                      <option value=0>No Influencer</option>
                      <option v-for="influencer in influencers" :key="influencer.id" :value="influencer.id">
                        {{ influencer.id }} | {{ influencer.name }}
                      </option>
                    </select>
                    <label for="user_id">Influencer ID</label>
                  </div>
                  <div class="form-floating mt-2">
                    <textarea v-model="createAdRequestData.messages" class="form-control" placeholder="Enter your messages" id="messages" rows="3"></textarea>
                    <label for="messages">Messages</label>
                  </div>
                  <div class="form-floating mt-2">
                    <textarea v-model="createAdRequestData.requirements" class="form-control" placeholder="Enter your requirements" id="requirements" rows="3"></textarea>
                    <label for="requirements">Requirements</label>
                  </div>
                  <div class="form-floating mt-2">
                    <input v-model="createAdRequestData.payment_amount" type="number" class="form-control" id="payment_amount" placeholder="Enter payment amount">
                    <label for="payment_amount">Payment Amount</label>
                  </div>
                  <button type="submit" @click="submitAdRequest" class="btn btn-success w-100 mt-3">Submit Request</button>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      campaign: {},
      adRequests: {},
      createAdRequestData: {},
      negotiationNotes: "",
      revisedPaymentAmount: null,
      influencers: null,
    };
  },
  async created() {
    await this.updateInfo();
  },
  methods: {
    async updateInfo() {
      const campaignId = this.$route.params.id;
      try {
        const response = await fetch(`/api/campaign/${campaignId}`, {
          headers: {
            "Content-type": "application/json",
          },
        });
        this.campaign = await response.json();

        const res = await fetch(`/api/ad-request/c/${campaignId}`);
        this.adRequests = await res.json();

        const resInfluencers = await fetch(`/api/user/all`);
        this.influencers = await resInfluencers.json();
      } catch (error) {
        window.triggerToast(error, "danger");
      }
    },
    async submitAdRequest() {
      if (
        // !this.createAdRequestData.user_id ||
        !this.createAdRequestData.messages ||
        !this.createAdRequestData.requirements ||
        !this.createAdRequestData.payment_amount
      ) {
        window.triggerToast("Please fill valid details", "warning");
        return;
      }
      const campaignId = this.$route.params.id;
      try {
        const res = await fetch(`/api/ad-request`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            campaign_id: campaignId,
            user_id: this.createAdRequestData.user_id,
            messages: this.createAdRequestData.messages,
            requirements: this.createAdRequestData.requirements,
            payment_amount: this.createAdRequestData.payment_amount,
          }),
        });
        const data = await res.json();
        if (data.message) {
          window.triggerToast(data.message, "success");
        } else if (data.error) {
          window.triggerToast(data.error, "warning");
        }
        this.createAdRequestData = {};
      } catch (error) {
        window.triggerToast(error, "danger");
      }
      this.updateInfo();
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
        console.error("Error updating negotiation:", error);
      }
      this.updateInfo();
      this.negotiationNotes = null;
      this.revisedPaymentAmount = null;
    },

    goBack() {
      router.go(-1);
    },
  },
  components: {
    AdRequest,
    Campaign,
  },
};

export default SponsorCampaignDetails;
