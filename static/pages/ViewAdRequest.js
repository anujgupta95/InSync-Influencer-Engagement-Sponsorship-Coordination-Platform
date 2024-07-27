import Campaign from "../components/Campaign.js";
import router from "../utils/router.js";
const ViewAdRequest = {
  template: `
    <div>
        <div class="container mt-4" v-if="adRequest && campaign">
          <div class="d-flex flex-wrap">
              <div class="col-12 mb-0">
                <campaign :campaign="campaign" @delete="goBack" header="Campaign Details" class="card"></campaign>
              </div>
              <div class="col-12 mb-0">
                <div class="card ms-1 mb-2">
                  <h5 class="card-header">Influencer Details</h5>
                  <div class="card-body">
                    <div>
                      <p class="card-text"><strong>Name:</strong> {{ influencer.name }}</p>
                      <p class="card-text"><strong>Category:</strong> {{ influencer.influencer_data.category }}</p>
                      <p class="card-text"><strong>Niche:</strong> {{ influencer.influencer_data.niche }}</p>
                      <p class="card-text"><strong>Followers:</strong> {{ influencer.influencer_data.followers }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        <div class="card rounded shadow mb-2">
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
                <button v-if="adRequest.status === 'negotiating'" @click="updateStatus" class="btn btn-warning w-25 me-2">Update Negotiation</button>
                <button v-if="!['rejected', 'accepted'].includes(adRequest.status)" @click="updateStatus('accepted')" class="btn btn-success me-2 w-25">Accept</button>
                <button v-if="!['rejected', 'accepted'].includes(adRequest.status)" @click="updateStatus('rejected')" class="btn btn-danger me-2 w-25">Reject</button>
                <button v-if="adRequest.status === 'pending'" @click="updateStatus('negotiating')" class="btn btn-warning me-2 w-25">Start Negotiating</button>
                </div>
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
    async updateStatus(status = null) {
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
            status: status ? status : this.adRequest.status,
          }),
        });
      } catch (error) {
        console.error("Error updating negotiation:", error);
      }
      this.updateInfo();
      this.negotiationNotes = null;
      this.revisedPaymentAmount = null;
    },
  },
  components: {
    Campaign,
  },
};

export default ViewAdRequest;
