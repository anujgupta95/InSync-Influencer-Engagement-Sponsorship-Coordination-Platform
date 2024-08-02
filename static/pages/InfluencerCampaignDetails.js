import router from "../utils/router.js";

const InfluencerCampaignDetails = {
  template: `
    <div>
      <div v-if="campaign" class="container mt-4 mb-2">
        <div class="card shadow">
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
          </div>
        </div>
        
        
        <div>
          <div>
            <!-- Display ad-request form if the user hasn't applied yet -->
            <div v-if="!hasApplied" class="mt-4 mb-2">
              <div class="card shadow">
                <div class="card-body">
                  <h4>Apply for this Campaign</h4>
                  <div class="form-floating mt-2">
                    <textarea v-model="submitAdRequestData.messages" class="form-control" placeholder="Enter your messages" id="messages" rows="3"></textarea>
                    <label for="messages">Messages</label>
                  </div>
                  <div class="form-floating mt-2">
                    <textarea v-model="submitAdRequestData.requirements" class="form-control" placeholder="Enter your requirements" id="requirements" rows="3"></textarea>
                    <label for="requirements">Requirements</label>
                  </div>
                  <div class="form-floating mt-2">
                    <input v-model="submitAdRequestData.payment_amount" type="number" class="form-control" id="payment_amount" placeholder="Enter payment amount">
                    <label for="payment_amount">Payment Amount</label>
                  </div>
                  <button type="submit" @click="submitAdRequest" class="btn btn-success w-100 mt-3">Submit Request</button>
                </div>
              </div>
            </div>

            <div v-if="adRequest && hasApplied" class="card rounded shadow mb-2 mt-2">
              <p class="card-header">Ad Request Details</p>
              <div class="card-body">
                <div>
                  <div class="mb-3">
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
                  <button v-if="adRequest.status === 'negotiating'" @click="updateStatus" class="btn btn-warning w-20 me-2">Update Negotiation</button>
                  
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
      hasApplied: false, //remove
      adRequest: {},
      submitAdRequestData: {},
      negotiationNotes: "",
      revisedPaymentAmount: null,
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
        const data = await res.json();
        if (data.id !== 0) {
          this.adRequest = data;
          this.hasApplied = true;
        } else {
          this.hasApplied = false;
        }
      } catch (error) {
        window.triggerToast(error, "danger");
      }
    },
    async submitAdRequest() {
      const campaignId = this.$route.params.id;
      try {
        const res = await fetch(`/api/ad-request`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            campaign_id: campaignId,
            messages: this.submitAdRequestData.messages,
            requirements: this.submitAdRequestData.requirements,
            payment_amount: this.submitAdRequestData.payment_amount,
          }),
        });
        if (res.ok) {
          const data = await response.json();
          this.adRequest = data;
          this.hasApplied = true;
        }
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
};

export default InfluencerCampaignDetails;
