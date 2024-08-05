import Campaign from "../../components/Campaign.js";
import router from "../../utils/router.js";
const DashboardInfluencer = {
  template: `
    <div>
      <h1>Influencer Dashboard</h1>
      <div class="container mt-4">
        <div class="card rounded shadow mt-4">
          <div class="card-body">
            <h3>Ad Requests</h3>
            <div v-if="adRequests.length === 0">
              No ad requests at the moment.
            </div>
            <ul v-else>
              <li v-for="adRequest in adRequests" :key="adRequest.id">
                <p>{{ adRequest.messages }}</p>
                <button class="btn btn-info" @click="viewRequestDetails(adRequest.id)">View Details</button>
              </li>
            </ul>
          </div>
        </div>
      </div>     
    </div>
    `,
  data() {
    return {
      adRequests: [],
    };
  },
  created() {
    this.fetchAdRequests();
  },
  methods: {
    async fetchAdRequests() {
      const url = window.location.origin;
      try {
        const response = await fetch(url + "/api/ad-request", {
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
    viewRequestDetails(campaignId) {
      router.push(`/influencer/ad-request/${campaignId}`);
    },
  },
};

export default DashboardInfluencer;
