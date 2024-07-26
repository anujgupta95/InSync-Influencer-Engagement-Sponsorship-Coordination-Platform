import Campaign from "../components/Campaign.js";
import router from "../utils/router.js";
const DashboardInfluencer = {
  template: `
    <div>
      <h1>Influencer Dashboard</h1>
      <div class="container mt-4">

        <div class="row">
          <div class="card rounded shadow mb-2">
            <div class="card-body d-flex justify-content-between align-items-center">
              <h3>Active Campaigns</h3>
            </div>
          </div>
          <Campaign v-for="campaign in campaigns" :key="campaign.id" :campaign="campaign"
             class="col-12 col-sm-6 col-md-6 col-lg-4 mb-3"/>
        </div>

        <div class="card rounded shadow mt-4">
          <div class="card-body">
            <h3>Ad Requests</h3>
            <div v-if="adRequests.length === 0">
              No ad requests at the moment.
            </div>
            <ul v-else>
              <li v-for="request in adRequests" :key="request.id">
                <p>{{ request.messages }}</p>
                <button class="btn btn-info" @click="viewRequestDetails(request.id)">View Details</button>
              </li>
            </ul>
          </div>
        </div>

      </div>     
    </div>
    `,
  data() {
    return {
      campaigns: [],
      adRequests: [],
    };
  },
  created() {
    this.fetchCampaigns();
    this.fetchAdRequests();
  },
  methods: {
    async fetchCampaigns() {
      const url = window.location.origin;
      try {
        const response = await fetch(url + "/api/campaign", {
          headers: {
            "Content-type": "application/json",
          },
        });
        const data = await response.json();
        this.campaigns = data;
      } catch (error) {
        window.triggerToast(error, "danger");
        // console.error("Failed to fetch campaigns:", error);
      }
    },
    async fetchAdRequests() {
      const url = window.location.origin;
      try {
        const response = await fetch(url + "/api/ad_request", {
          headers: {
            "Content-type": "application/json",
          },
        });
        const data = await response.json();
        // console.log(data);
        this.adRequests = data;
      } catch (error) {
        window.triggerToast(error, "danger");
        // console.error("Failed to fetch ad requests:", error);
      }
    },
    viewRequestDetails(requestId) {
      router.push(`/ad-request/${requestId}`);
    },
  },
  components: {
    Campaign,
  },
};

export default DashboardInfluencer;
