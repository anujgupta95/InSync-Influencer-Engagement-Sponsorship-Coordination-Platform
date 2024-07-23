import Campaign from "../components/Campaign.js";
const DashboardSponsor = {
  template: `
    <div>
      <h1>Sponsor Dashboard</h1>
      <div class="container mt-4">
        <button class="btn btn-success mb-2">Add Campaign</button>
        <div class="row">
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
