const DashboardAdmin = {
  template: `
  <div class="container mt-4">
    <div class="row">
      <!-- Users Card -->
      <div class="col-md-4 mb-2">
        <div class="card shadow-sm ">
          <div class="card-header d-flex align-items-center text-body">
            <i class="bi bi-people-fill me-2"></i>
            <span class="h4"> {{ totalUsers }} Users</span>
          </div>
          <div class="card-body">
            <p class="h5 text-success"><i class="bi bi-person-vcard-fill"></i> Sponsors: {{ totalSponsors }}</p>
            <p class="h5 text-success"><i class="bi bi-person-badge"></i> Influencers: {{ totalInfluencers }}</p>
            <p class="h5 text-danger"><i class="bi bi-person-exclamation"></i> Flagged: {{ flaggedUsers }}</p>
          </div>
          <div class="card-footer text-muted">
            <small>Last updated: {{ new Date().toLocaleString() }}</small>
          </div>
        </div>
      </div>

      <!-- Campaigns Card -->
      <div class="col-md-4 mb-2">
        <div class="card shadow-sm">
          <div class="card-header d-flex align-items-center text-body">
            <i class="bi bi-bullseye me-2"></i>
            <span class="h4">{{ totalCampaigns }} Campaigns</span>
          </div>
          <div class="card-body">
            <p class="h5 text-success"><i class="bi bi-eye-fill"></i> Public: {{ publicCampaigns }}</p>
            <p class="h5 text-secondary"><i class="bi bi-incognito"></i> Private: {{ privateCampaigns }}</p>
            <p class="h5 text-danger"><i class="bi bi-ban"></i> Flagged: {{ flaggedCampaigns }}</p>
          </div>
          <div class="card-footer text-muted">
            <small>Last updated: {{ new Date().toLocaleString() }}</small>
          </div>
        </div>
      </div>

      <!-- Ad Requests Card -->
      <div class="col-md-4 mb-2">
        <div class="card shadow-sm ">
          <div class="card-header d-flex align-items-center text-body">
            <i class="bi bi-envelope-open me-2"></i>
            <span class="h4">{{ totalAdRequests }} Ad Requests</span>
          </div>
          <div class="card-body">
            <p class="h5 text-success"><i class="bi bi-envelope-check-fill"></i> Accepted: {{ acceptedAdRequests }}</p>
            <p class="h5 text-secondary"><i class="bi bi-envelope-exclamation-fill"></i> Pending: {{ pendingAdRequests }}</p>
            <p class="h5 text-danger"><i class="bi bi-envelope-slash"></i> Rejected: {{ rejectedAdRequests }}</p>
          </div>
          <div class="card-footer text-muted">
            <small>Last updated: {{ new Date().toLocaleString() }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Requests Table -->
    <div class="card table-responsive mt-2">
      <p class="card-header h4">Pending Requests</p>
      <table v-if="pendingSponsors.length > 0" class="text-center rounded card-body">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <!--<th>Company</th>
            <th>Industry</th>
            <th>Budget</th>-->
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sponsor in pendingSponsors" :key="sponsor.id" class="col-12">
            <td>{{ sponsor.id }}</td>
            <td>{{ sponsor.name }}</td>
            <td>{{ sponsor.email }}</td>
            <!--<td>{{ sponsor.sponsor_data?.company_name }}</td>
            <td>{{ sponsor.sponsor_data?.industry }}</td>
            <td>{{ sponsor.sponsor_data?.budget }}</td>-->
            <td>
              <button class="btn btn-success" @click="approveSponsor(sponsor.id)">Approve</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="card-body fw-bold">No Pending Requests...</div>
    </div>
  </div>
  `,
  data() {
    return {
      users: [],
      campaigns: [],
      adRequests: [],
      pendingSponsors: [],
      totalUsers: 0,
      flaggedUsers: 0,
      totalSponsors: 0,
      totalInfluencers: 0,
      totalCampaigns: 0,
      flaggedCampaigns: 0,
      totalAdRequests: 0,
      pendingAdRequests: 0,
      acceptedAdRequests:0,
      rejectedAdRequests:0,
      publicCampaigns:0,
      privateCampaigns:0
    };
  },
  mounted() {
    this.fetchAllData();
  },
  methods: {
    async fetchAllData() {
      try {
        const response = await fetch("/api/admin/all_data");
        const data = await response.json();

        this.pendingSponsors = data.users.filter(user =>  !user.flagged && !user.active && user.role==="sponsor");

        // Calculate User statistics
        this.totalUsers = data.users.length;
        this.flaggedUsers = data.users.filter(user => user.flagged).length;
        this.totalSponsors = data.users.filter(user => user.role === 'sponsor').length;
        this.totalInfluencers = data.users.filter(user => user.role === 'influencer').length;

        // Calculate Campaign statistics
        this.totalCampaigns = data.campaigns.length;
        this.flaggedCampaigns = data.campaigns.filter(campaign => campaign.flagged).length;
        this.publicCampaigns = data.campaigns.filter(campaign => campaign.visibility === 'public').length;
        this.privateCampaigns = data.campaigns.filter(campaign => campaign.visibility === 'private').length;

        // Calculate Ad Request statistics
        this.totalAdRequests = data.ad_requests.length; 
        this.pendingAdRequests = data.ad_requests.filter(adRequest => adRequest.status === 'pending').length;
        this.acceptedAdRequests = data.ad_requests.filter(adRequest => adRequest.status === 'accepted').length;
        this.rejectedAdRequests = data.ad_requests.filter(adRequest => adRequest.status === 'rejected').length;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    async approveSponsor(sponsorId) {
      if (!confirm("Are you sure you want to approve this sponsor?")) {
        return;
      }
      try {
        const res = await fetch(`/api/admin/sponsor/${sponsorId}/active`, {
          method: "PUT",
        });
        if (res.ok) {
          const data = await res.json();
          window.triggerToast(data.message, "success");
        }
      } catch (error) {
        window.triggerToast(error, "warning");
      }
      this.fetchAllData();
    },
  },
};

export default DashboardAdmin;
