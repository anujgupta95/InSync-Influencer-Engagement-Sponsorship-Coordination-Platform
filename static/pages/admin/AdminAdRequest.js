const AdminAdRequests = {
    template: `
      <div class="container mt-4">
        <div class="card mb-4">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h3 class="flex-grow-1">All Ad Requests</h3>
              <button class="btn btn-outline-secondary" @click="resetAdRequestSearch">Clear Filter</button>
            </div>
            <div class="d-flex mb-3 row g-2">
              <div class="form-floating col">
                <input v-model="adRequestSearchQuery" type="text" class="form-control" id="adRequestSearch" placeholder="Search"/>
                <label for="adRequestSearch">Search ad requests</label>
              </div>
              <div class="form-floating col-3">
                <select v-model="statusFilter" class="form-select" id="filterStatus">
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="negotiating">Rejected</option>
                </select>
                <label for="filterStatus">Status</label>
              </div>
            </div>
            <div class="table-responsive">
              <table v-if="filteredAdRequests.length > 0" class="table-responsive text-center rounded card-body">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Campaign ID</th>
                    <th>User ID</th>
                    <th>Messages</th>
                    <th>Requirements</th>
                    <th>Payment Amount</th>
                    <th>Revised Payment Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="adRequest in filteredAdRequests" :key="adRequest.id" class="col-12">
                    <td>{{ adRequest.id }}</td>
                    <td>{{ adRequest.campaign_id }}</td>
                    <td>{{ adRequest.user_id }}</td>
                    <td>{{ adRequest.messages }}</td>
                    <td>{{ adRequest.requirements }}</td>
                    <td>{{ adRequest.payment_amount }}</td>
                    <td>{{ adRequest.revised_payment_amount }}</td>
                    <td>{{ adRequest.status.toUpperCase() }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="card-body fw-bold">No Ad Requests Found...</div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        adRequests: [],
        adRequestSearchQuery: "",
        statusFilter: "",
      };
    },
    computed: {
      filteredAdRequests() {
        return this.adRequests.filter(adRequest => {
          const matchesSearchQuery = this.adRequestSearchQuery === "" ||
              Object.values(adRequest).some(value =>
              String(value).toLowerCase().includes(this.adRequestSearchQuery.toLowerCase())
              );
  
          const matchesStatus = this.statusFilter === "" || this.statusFilter === adRequest.status;
  
          return matchesSearchQuery && matchesStatus;
        });
      },
    },
    mounted() {
      this.fetchAdRequests();
    },
    methods: {
      async fetchAdRequests() {
        try {
          const response = await fetch("/api/admin/ad_requests");
          this.adRequests = await response.json();
        } catch (error) {
          console.error("Error fetching ad requests:", error);
          window.triggerToast(error, "warning");
        }
      },
      resetAdRequestSearch() {
        this.adRequestSearchQuery = "";
        this.statusFilter = "";
      },
    },
  };
  
  export default AdminAdRequests;
  