import router from "../../utils/router.js";
const DashboardInfluencer = {
  template: `
    <div class="container mt-4">
      <div class="card rounded shadow table-responsive">
          <p class="card-header h4">{{adRequests.length}} Active Ad Requests</p>
          <table v-if="adRequests.length > 0" class="text-center rounded card-body">
            <thead>
              <tr>
                <th>Campaign ID</th>
                <th>Messages</th>
                <th>Payment Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="adRequest in adRequests" :key="adRequest.id" class="col-12">
                <td>{{ adRequest.campaign_id }}</td>
                <td>{{ adRequest.messages }}</td>
                <td>{{ adRequest.payment_amount }}</td>
                <td>{{ adRequest.status }}</td>
                <td>
                  <button class="btn btn-warning" @click="viewRequestDetails(adRequest.id)">View</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="card-body fw-bold">No ad requests found at the moment...</div>
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
        const response = await fetch(url + "/api/ad-request");
        this.adRequests = await response.json();
      } catch (error) {
        window.triggerToast(error, "danger");
      }
    },
    viewRequestDetails(campaignId) {
      router.push(`/influencer/ad-request/${campaignId}`);
    },
  },
};

export default DashboardInfluencer;
