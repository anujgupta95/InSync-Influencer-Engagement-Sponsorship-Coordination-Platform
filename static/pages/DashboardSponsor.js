import Campaign from "../components/Campaign.js";
import AdRequest from "../components/AdRequest.js";
const DashboardSponsor = {
  template: `
    <div>
      <h1>Sponsor Dashboard</h1>
      <div class="container mt-4">
        
        <div class="card rounded shadow mb-2">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h3 class="flex-grow-1">Ad Requests</h3>
              <button class="btn btn-outline-secondary" @click="resetAdRequestFilter">Clear Filter</button>
            </div>
            <div class="d-flex mb-3 row g-2">
              <div class="form-floating col">
                <input v-model="adRequestSearchQuery" type="text" class="form-control" id="searchAdRequests" placeholder="Search ad requests"/>
                <label for="searchAdRequests">Search ad requests</label>
              </div>
              <div class="form-floating col-3">
                <select v-model="selectedAdRequestStatus" class="form-select" id="adRequestStatus">
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="negotiating">Negotiating</option>
                </select>
                <label for="adRequestStatus">Status</label>
              </div>
            </div>
          </div>
        </div>
        <div v-if="filteredAdRequests.length === 0">
            <p>No ad requests found.</p>
        </div>
        <div v-else class="card card-body">
          <table class="text-center rounded">
            <thead>
              <tr>
                <th>Campaign ID</th>
                <th>Influencer ID</th>
                <th>Messages</th>
                <th>Requirements</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AdRequest v-for="adRequest in filteredAdRequests" :key="adRequest.id" :adRequest="adRequest" class="col-12"/>
            </tbody>
          </table>
        </div>
        
        <!-- Campaigns Section -->
        <div class="card rounded shadow mt-4 mb-2">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h3 class="flex-grow-1">All Campaigns</h3>
              <router-link to="/sponsor/campaign/add" class="btn btn-success me-2">Add Campaign</router-link>
              <button class="btn btn-outline-secondary" @click="resetCampaignFilter">Clear Filter</button>
            </div>

            <div class="d-flex mb-3 row g-2">
              <div class="form-floating col-6">
                <input v-model="campaignSearchQuery" type="text" class="form-control" id="search" placeholder="Search campaigns"/>
                <label for="search">Search campaigns</label>
              </div>
              <div class="form-floating col">
                <select v-model="campaignVisibility" class="form-select" id="filter">
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
        
        <div class="d-flex row">
          <Campaign v-for="campaign in filteredCampaigns" :key="campaign.id" :campaign="campaign"
            @delete="removeCampaign" @update="handleUpdate" class="shadow col-12 col-sm-6 col-md-6 col-lg-6 mb-2"/>
        </div>
      </div>  
    </div>
    `,
  data() {
    return {
      campaigns: [],
      adRequests: [],
      campaignSearchQuery: "",
      campaignVisibility: "",
      startDate: "",
      endDate: "",
      adRequestSearchQuery: "",
      selectedAdRequestStatus: "",
    };
  },
  computed: {
    filteredCampaigns() {
      return this.campaigns.filter((campaign) => {
        const matchesSearchQuery =
          this.campaignSearchQuery === "" ||
          Object.values(campaign).some((value) =>
            String(value)
              .toLowerCase()
              .includes(this.campaignSearchQuery.toLowerCase())
          );

        const matchesFilter =
          this.campaignVisibility === "" ||
          campaign.visibility === this.campaignVisibility;

        const matchesStartDate =
          !this.startDate ||
          new Date(campaign.start_date) >= new Date(this.startDate);

        const matchesEndDate =
          !this.endDate ||
          new Date(campaign.end_date) <= new Date(this.endDate);

        return (
          matchesSearchQuery &&
          matchesFilter &&
          matchesStartDate &&
          matchesEndDate
        );
      });
    },
    filteredAdRequests() {
      return this.adRequests.filter((request) => {
        const matchesSearchQuery =
          this.adRequestSearchQuery === "" ||
          Object.values(request).some((value) =>
            String(value)
              .toLowerCase()
              .includes(this.adRequestSearchQuery.toLowerCase())
          );

        const matchesStatus =
          this.selectedAdRequestStatus === "" ||
          request.status === this.selectedAdRequestStatus;

        return matchesSearchQuery && matchesStatus;
      });
    },
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
        console.error("Failed to fetch campaigns:", error);
      }
    },
    async fetchAdRequests() {
      const url = window.location.origin;
      try {
        const response = await fetch(url + "/api/ad-request", {
          headers: {
            "Content-type": "application/json",
          },
        });
        const data = await response.json();
        this.adRequests = data;
      } catch (error) {
        console.error("Failed to fetch ad requests:", error);
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
    resetCampaignFilter() {
      this.campaignSearchQuery = "";
      this.campaignVisibility = "";
      this.startDate = "";
      this.endDate = "";
    },
    resetAdRequestFilter() {
      this.adRequestSearchQuery = "";
      this.selectedAdRequestStatus = "";
    },
  },
  components: {
    Campaign,
    AdRequest,
  },
};

export default DashboardSponsor;
