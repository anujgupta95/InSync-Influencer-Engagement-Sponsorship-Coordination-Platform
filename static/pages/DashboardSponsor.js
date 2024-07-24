import Campaign from "../components/Campaign.js";
const DashboardSponsor = {
  template: `
    <div>
      <h1>Sponsor Dashboard</h1>
      <div class="container mt-4">
        
        <div class="row">
          <div class="card rounded shadow mb-2">
            <div class="card-body d-flex justify-content-between align-items-center">
              <h1 class="mb-0 flex-grow-1">Active Campaigns</h1>
              <router-link to="/sponsor/addCampaign" class="btn btn-success">Add Campaign</router-link>
            </div>
          </div>


          <Campaign v-for="campaign in campaigns" :key="campaign.id" :campaign="campaign"
          @delete="removeCampaign" @update="handleUpdate" class="col-12 col-sm-6 col-md-6 col-lg-4 mb-3"/>
        </div>
      </div>     
    </div>
    `,
  data() {
    return {
      campaigns: [],
    };
  },
  created() {
    this.fetchCampaigns();
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
        console.error("Failed to fetch campaigns:", error);
      }
    },
    removeCampaign(campaignId) {
      this.campaigns = this.campaigns.filter(
        (campaign) => campaign.id !== campaignId
      );
    },
    handleUpdate() {
      this.fetchCampaigns();
    },
  },
  components: {
    Campaign,
  },
};

export default DashboardSponsor;
