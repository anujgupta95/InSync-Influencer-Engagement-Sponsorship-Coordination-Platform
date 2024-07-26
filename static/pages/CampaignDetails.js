const CampaignDetails = {
  template: `
        <div>
            <div v-if="campaign" class="container mt-4">
            <div class="card shadow">
                <div class="card-body">
                <h1>{{ campaign.name }}</h1>
                <p><strong>Description:</strong> {{ campaign.description }}</p>
                <p><strong>Start Date:</strong> {{ campaign.start_date }}</p>
                <p><strong>End Date:</strong> {{ campaign.end_date}}</p>
                <p><strong>Budget:</strong> {{ campaign.budget }}</p>
                <p><strong>Goals:</strong> {{ campaign.goals }}</p>

                <button v-if="!hasApplied" @click="applyForCampaign" class="btn btn-primary">
                    Apply for this Campaign
                </button>
                
                <p v-if="hasApplied">You have already applied for this campaign.</p>
                
                <div v-if="campaign.comments">
                    <h3>Comments</h3>
                    <ul>
                    <li v-for="comment in campaign.comments" :key="comment.id">{{ comment.text }}</li>
                    </ul>
                </div>
                </div>
            </div>
            </div>
        </div>
    `,
  data() {
    return {
      campaign: {
        id: null,
        name: null,
        user_id: 0,
        name: null,
        description: null,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        budget: 0,
        visibility: null,
        goals: null,
      },
      hasApplied: false,
    };
  },
  computed: {
    isLoggedIn() {
      return store.getters.isLoggedIn;
    },
    userRole() {
      return store.getters.userRole;
    },
  },
  async created() {
    await this.fetchCampaignDetails();
    await this.checkApplicationStatus();
  },
  methods: {
    async fetchCampaignDetails() {
      const campaignId = this.$route.params.id;
      try {
        const response = await fetch(`/api/campaign/${campaignId}`, {
          headers: {
            "Content-type": "application/json",
          },
        });
        const data = await response.json();
        this.campaign = data;
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch campaign details:", error);
      }
    },
    async applyForCampaign() {
      const campaignId = this.$route.params.id;
      try {
        const response = await fetch(`/api/campaign/apply/${campaignId}`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
        });
        if (response.ok) {
          this.hasApplied = true;
        }
      } catch (error) {
        console.error("Failed to apply for campaign:", error);
      }
    },
    async checkApplicationStatus() {
      const campaignId = this.$route.params.id;
      try {
        const response = await fetch(`/api/campaign/status/${campaignId}`, {
          headers: {
            "Content-type": "application/json",
          },
        });
        const data = await response.json();
        this.hasApplied = data.hasApplied;
        console.log(data);
      } catch (error) {
        console.error("Failed to check application status:", error);
      }
    },
  },
};

export default CampaignDetails;
