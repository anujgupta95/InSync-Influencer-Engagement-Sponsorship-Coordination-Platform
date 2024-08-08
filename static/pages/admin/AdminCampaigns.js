const AdminCampaigns = {
    template: `
      <div class="container mt-4">
        <div v-if="flaggedCampaigns.length > 0" class="card mb-4">
          <div class="card-header">
            <p class="h4">Flagged Campaigns</p>
          </div>
          <div class="card-body table-responsive">
            <table class="text-center rounded card-body">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Budget</th>
                  <th>Visibility</th>
                  <th>Goals</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in flaggedCampaigns" :key="campaign.id" class="col-12">
                  <td>{{ campaign.id }}</td>
                  <td>{{ campaign.name }}</td>
                  <td>{{ campaign.description }}</td>
                  <td>{{ campaign.start_date }}</td>
                  <td>{{ campaign.end_date }}</td>
                  <td>{{ campaign.budget }}</td>
                  <td>{{ campaign.visibility.toUpperCase() }}</td>
                  <td>{{ campaign.goals }}</td>
                  <td>
                    <button class="btn btn-warning" @click="campaignAction(campaign.id, 'unflag')">Unflag</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
  
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h3 class="flex-grow-1">All Campaigns</h3>
              <button class="btn btn-outline-secondary" @click="resetCampaignSearch">Clear Filter</button>
            </div>
            <div class="d-flex mb-3 row g-2">
              <div class="form-floating col">
                <input v-model="campaignSearchQuery" type="text" class="form-control" id="campaignSearch" placeholder="Search"/>
                <label for="campaignSearch">Search campaigns</label>
              </div>
              <div class="form-floating col-3">
                <select v-model="visibility" class="form-select" id="filterStatus">
                  <option value="">All</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <label for="filterStatus">Status</label>
              </div>
            </div>
            <div class="table-responsive">
              <table v-if="filteredCampaigns.length > 0" class="table-responsive text-center rounded card-body">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Budget</th>
                    <th>Visibility</th>
                    <th>Goals</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="campaign in filteredCampaigns" :key="campaign.id" class="col-12">
                    <td>{{ campaign.id }}</td>
                    <td>{{ campaign.name }}</td>
                    <td>{{ campaign.description }}</td>
                    <td>{{ campaign.start_date }}</td>
                    <td>{{ campaign.end_date }}</td>
                    <td>{{ campaign.budget }}</td>
                    <td>{{ campaign.visibility.toUpperCase() }}</td>
                    <td>{{ campaign.goals }}</td>
                    <td>
                      <button class="btn btn-danger" @click="campaignAction(campaign.id, 'flag')">Flag</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="card-body fw-bold">No Campaigns Found...</div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        campaigns: [],
        flaggedCampaigns: [],
        campaignSearchQuery: "",
        visibility: "",
      };
    },
    computed: {
      filteredCampaigns() {
        return this.campaigns.filter(campaign => {
          const matchesSearchQuery = this.campaignSearchQuery === "" ||
              Object.values(campaign).some(value =>
              String(value).toLowerCase().includes(this.campaignSearchQuery.toLowerCase())
              );
  
          const matchesStatus = this.visibility === "" || this.visibility === campaign.visibility;
  
          return matchesSearchQuery && matchesStatus;
        });
      },
    },
    mounted() {
      this.fetchCampaigns();
    },
    methods: {
      async fetchCampaigns() {
        try {
          const response = await fetch("/api/admin/campaigns");
          const campaigns = await response.json();
          this.campaigns = campaigns.filter(campaign => !campaign.flagged);
          this.flaggedCampaigns = campaigns.filter(campaign => campaign.flagged);
        } catch (error) {
          console.error("Error fetching campaigns:", error);
          window.triggerToast(error, "warning");
        }
      },
      async campaignAction(campaignId, action) {
        if (!confirm(`Are you sure you want to ${action} this campaign?`)) {
          return;
        }
        try {
          const res = await fetch(`/api/admin/campaign/${campaignId}/${action}`, {
            method: "PUT",
          });
          if (res.ok) {
            const data = await res.json();
            window.triggerToast(data.message, "success");
          }
        } catch (error) {
          window.triggerToast(error, "warning");
        }
        this.fetchCampaigns();
      },
      resetCampaignSearch() {
        this.campaignSearchQuery = "";
        this.visibility = "";
      },
    },
  };
  
  export default AdminCampaigns;
  