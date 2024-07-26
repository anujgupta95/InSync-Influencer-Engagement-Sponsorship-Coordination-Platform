import Campaign from "../components/Campaign.js";
import router from "../utils/router.js";
const ViewAdRequest = {
  template: `
    <div>
        <div class="container mt-4" v-if="adRequest && campaign">
            <div class="row">
                <div class="col-lg-6 col-md-12 mb-3">
                    <Campaign :campaign="campaign" @delete="goBack" header="Campaign Details" class="card"/>
                </div>
                <div class="col-lg-6 col-md-12 mb-3">
                    <div class="card">
                        <h5 class="card-header">Influencer Details</h5>
                        <div class="card-body">
                            <div>
                                <p class="card-text"><strong>Name:</strong> {{ influencer.name  }}</p>
                                <p class="card-text"><strong>Category:</strong> {{ influencer.influencer_data.category }}</p>
                                <p class="card-text"><strong>Niche:</strong> {{ influencer.influencer_data.niche }}</p>
                                <p class="card-text"><strong>Followers:</strong> {{ influencer.influencer_data.followers }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <div class="card rounded shadow mb-2">
            <p class="mb-4 card-header">Ad Request Details</p>
            <div class="card-body">
            <div>
                <div class="mb-3">
                    <p><strong>Messages:</strong> {{ adRequest.messages }}</p>
                    <p><strong>Requirements:</strong> {{ adRequest.requirements }}</p>
                    <p><strong>Payment Amount:</strong> {{ adRequest.payment_amount }}</p>
                    <p><strong>Status:</strong> {{ adRequest.status }}</p>
                    <p><strong>Negotiation Notes:</strong> {{ adRequest.negotiation_notes }}</p>
                    <p><strong>Revised Payment Amount:</strong> {{ adRequest.revised_payment_amount }}</p>
                </div>

                <div v-if="adRequest.status === 'negotiating'" class="mt-4">
                    <h4>Negotiation</h4>
                    <div class="mb-3">
                    <textarea v-model="adRequest.negotiation_notes" class="form-control" rows="3" placeholder="Add negotiation notes"></textarea>
                    </div>
                    <div class="mb-3">
                    <input v-model="adRequest.revised_payment_amount" type="number" class="form-control" placeholder="Revised Payment Amount" />
                    </div>
                    <button @click="updateNegotiation" class="btn btn-primary">Update Negotiation</button>
                </div>

                <div v-if="adRequest.status === 'pending'" class="mt-4">
                    <button @click="acceptRequest" class="btn btn-success me-2">Accept</button>
                    <button @click="rejectRequest" class="btn btn-danger me-2">Reject</button>
                    <button @click="startNegotiation" class="btn btn-warning">Start Negotiating</button>
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
      adRequest: {},
      campaign: {},
      influencer: {
        influencer_data: {},
      },
    };
  },
  async created() {
    this.updateInfo();
  },
  methods: {
    async updateInfo() {
      const adRequestId = this.$route.params.id;
      try {
        const adRequestRes = await fetch(`/api/ad_request/${adRequestId}`);
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
    async updateNegotiation() {
      try {
        await fetch(`/api/ad_request/${this.adRequest.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            negotiation_notes: this.adRequest.negotiation_notes,
            revised_payment_amount: this.adRequest.revised_payment_amount,
            ...this.adRequest,
          }),
        });
      } catch (error) {
        console.error("Error updating negotiation:", error);
      }
      this.updateInfo();
    },
    // async acceptRequest() {
    //     try {
    //       await fetch(`/api/campaign/status/${this.adRequest.id}`, {
    //         method: "PUT",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ status: "accepted" }),
    //       });
    //       this.$router.push("/sponsor/ad-requests");
    //     } catch (error) {
    //       console.error("Error accepting request:", error);
    //     }
    //   },
    //   async rejectRequest() {
    //     try {
    //       await fetch(`/api/campaign/status/${this.adRequest.id}`, {
    //         method: "PUT",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ status: "rejected" }),
    //       });
    //       this.$router.push("/sponsor/ad-requests");
    //     } catch (error) {
    //       console.error("Error rejecting request:", error);
    //     }
    //   },
    //   async startNegotiation() {
    //     try {
    //       await fetch(`/api/campaign/status/${this.adRequest.id}`, {
    //         method: "PUT",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ status: "negotiating" }),
    //       });
    //       this.$router.push("/sponsor/ad-requests");
    //     } catch (error) {
    //       console.error("Error starting negotiation:", error);
    //     }
    //   },
  },
  components: {
    Campaign,
  },
};

export default ViewAdRequest;
