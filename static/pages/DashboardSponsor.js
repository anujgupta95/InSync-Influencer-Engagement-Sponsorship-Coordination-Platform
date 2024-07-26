import Campaign from "../components/Campaign.js";
const DashboardSponsor = {
  template: `
    <div>
      <h1>Sponsor Dashboard</h1>
      <div class="container mt-4">
        
      <div class="container mt-4">
        <div class="card rounded shadow mb-2">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h3 class="flex-grow-1">All Campaigns</h3>
              <router-link to="/sponsor/campaign/add" class="btn btn-success me-2">Add Campaign</router-link>
              <button class="btn btn-outline-secondary" @click="resetFilter">Clear Filter</button>
            </div>

            <div class="d-flex mb-3 row g-2">
              <div class="form-floating col-6">
                  <input v-model="searchQuery" type="text" class="form-control" id="search" placeholder="Search campaigns"/>
                  <label for="search">Search campaigns</label>
                </div>
              <div class="form-floating col">
                  <select v-model="selectedFilter" class="form-select" id="filter">
                    <option value="">All</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <label for="filter">Filter</label>
              </div>
              <div class="col">
                <div class="form-floating">
                  <input v-model="startDate" type="date" class="form-control" id="startDate"/>
                  <label for="startDate">Start Date</label>
                </div>
              </div>
              <div class="col">
                <div class="form-floating">
                  <input v-model="endDate" type="date" class="form-control" id="endDate"/>
                  <label for="endDate">End Date</label>
                </div>
              </div>
            </div>
          </div>
          </div>
          <div class="d-flex">
            <Campaign v-for="campaign in filteredCampaigns" :key="campaign.id" :campaign="campaign"
            @delete="removeCampaign" @update="handleUpdate" class="col-12 col-sm-6 col-md-6 col-lg-4 mb-3"/>
          </div>
        </div>
      </div>     
    </div>
    `,
  data() {
    return {
      campaigns: [],
      searchQuery: "",
      selectedFilter: "",
      startDate: "",
      endDate: "",
    };
  },
  computed: {
    filteredCampaigns() {
      return this.campaigns.filter((campaign) => {
        const matchesSearchQuery =
          this.searchQuery === "" ||
          Object.values(campaign).some((value) =>
            String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
          );

        const matchesFilter =
          this.selectedFilter === "" ||
          campaign.visibility === this.selectedFilter;

        const matchesStartDate =
          !this.startDate ||
          new Date(campaign.startDate) >= new Date(this.startDate);

        const matchesEndDate =
          !this.endDate || new Date(campaign.endDate) <= new Date(this.endDate);

        return (
          matchesSearchQuery &&
          matchesFilter &&
          matchesStartDate &&
          matchesEndDate
        );
      });
    },
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
    resetFilter() {
      this.searchQuery = "";
      this.selectedFilter = "";
      this.startDate = "";
      this.endDate = "";
    },
  },
  components: {
    Campaign,
  },
};

export default DashboardSponsor;
