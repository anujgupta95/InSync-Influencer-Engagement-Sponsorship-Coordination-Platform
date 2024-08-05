const DashboardAdmin = {
  template: `
  <div class="container mt-4">
    <div  class="card">
        <p class="card-header h4">Pending Requests</p>
        <table v-if="sponsors.length > 0" class="text-center rounded card-body">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sponsor in sponsors" :key="sponsor.id" class="col-12">
              <td>{{ sponsor.id }}</td>
              <td>{{ sponsor.name }}</td>
              <td>{{ sponsor.email }}</td>
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
      sponsors: [],
    };
  },
  mounted() {
    this.fetchSponsors();
  },
  methods: {
    async fetchSponsors() {
      try {
        const response = await fetch("/api/admin/sponsor");
        this.sponsors = await response.json();
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async approveSponsor(sponsorId) {
      if (!confirm("Are you sure you want to approve this sponsor?")) {
        return;
      }
      try {
        const res = await fetch(`/api/admin/sponsor/${sponsorId}`, {
          method: "PUT",
        });
        if (res.ok) {
          const data = await res.json();
          window.triggerToast(data.message, "success");
        }
      } catch (error) {
        window.triggerToast(error, "warning");
      }
      this.fetchSponsors();
    },
  },
};

export default DashboardAdmin;
