import store from "../utils/store.js";

const AdRequest = {
  template: `
  <div>
    <h2>Ad Request Details</h2>
    <div v-if="adRequest">
      <p><strong>ID:</strong> {{ adRequest.id }}</p>
      <p><strong>Campaign ID:</strong> {{ adRequest.campaign_id }}</p>
      <p><strong>Influencer ID:</strong> {{ adRequest.influencer_id }}</p>
      <p><strong>Messages:</strong> {{ adRequest.messages }}</p>
      <p><strong>Requirements:</strong> {{ adRequest.requirements }}</p>
      <p><strong>Payment Amount:</strong> {{ adRequest.payment_amount }}</p>
      <p><strong>Status:</strong> {{ adRequest.status }}</p>

      <button @click="editAdRequest">Edit</button>
      <button @click="deleteAdRequest">Delete</button>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
    <router-link to="/ad-request">Back to List</router-link>
  </div>
    `,
  data() {
    return {
      adRequest: null,
    };
  },
  async created() {
    const adRequestId = this.$route.params.id;
    try {
      const response = await axios.get(`/api/ad_request/${adRequestId}`);
      this.adRequest = response.data;
    } catch (error) {
      console.error("Error fetching ad request:", error);
    }
  },
  methods: {
    async deleteAdRequest() {
      const adRequestId = this.$route.params.id;
      if (confirm("Are you sure you want to delete this ad request?")) {
        try {
          await axios.delete(`/api/ad_request/${adRequestId}`);
          this.$router.push("/ad-request");
        } catch (error) {
          console.error("Error deleting ad request:", error);
        }
      }
    },
    editAdRequest() {
      const adRequestId = this.$route.params.id;
      this.$router.push(`/ad-request/edit/${adRequestId}`);
    },
  },
};
