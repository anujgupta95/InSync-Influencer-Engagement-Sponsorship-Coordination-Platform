const AdminUsers = {
    template: `
      <div class="container mt-4">
        <div v-if="flaggedUsers.length > 0" class="card mb-4">
          <div class="card-header">
            <h4>Flagged Users</h4>
          </div>
          <div class="card-body table-responsive">
            <table class="table-responsive text-center rounded card-body">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in flaggedUsers" :key="user.id" class="col-12">
                  <td>{{ user.id }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.role.toUpperCase() }}</td>
                  <td>
                    <button class="btn btn-warning" @click="userAction(user.id, 'unflag')">Unflag</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h3 class="flex-grow-1">All Users</h3>
              <button class="btn btn-outline-secondary" @click="resetUserSearch">Clear Filter</button>
            </div>
            <div class="d-flex mb-3 row g-2">
              <div class="form-floating col">
                <input v-model="userSearchQuery" type="text" class="form-control" id="userSearch" placeholder="Search"/>
                <label for="userSearch">Search users</label>
              </div>
              <div class="form-floating col-3">
                <select v-model="selectedRole" class="form-select" id="filterRoles">
                  <option value="">All</option>
                  <option value="influencer">Influencers</option>
                  <option value="sponsor">Sponsors</option>
                </select>
                <label for="filterRoles">Role</label>
              </div>
            </div>
            <div class="table-responsive">
              <table v-if="filteredUsers.length > 0" class="text-center rounded card-body">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Campaigns</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id" class="col-12">
                    <td>{{ user.id }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.role.toUpperCase() }}</td>
                    <td>{{ user.campaigns }}</td>
                    <td>
                      <button class="btn btn-danger" @click="userAction(user.id, 'flag')">Flag</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="card-body fw-bold">No Users Found...</div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        users: [],
        flaggedUsers: [],
        userSearchQuery: "",
        selectedRole: "",
      };
    },
    computed: {
      filteredUsers() {
        return this.users.filter(user => {
          const matchesSearchQuery = this.userSearchQuery === "" ||
                    Object.values(user).some(value =>
                    String(value).toLowerCase().includes(this.userSearchQuery.toLowerCase())
                    );
  
          const matchesRole = this.selectedRole === "" || this.selectedRole === user.role;
  
          return matchesSearchQuery && matchesRole;
        });
      },
    },
    mounted() {
      this.fetchUsers();
    },
    methods: {
      async fetchUsers() {
        try {
          const response = await fetch("/api/admin/users");
          const users = await response.json();
          this.users = users.filter(user => !user.flagged && user.active && user.role !== "admin");
          this.flaggedUsers = users.filter(user => user.flagged && !user.active);
        } catch (error) {
          console.error("Error fetching users:", error);
          window.triggerToast(error, "warning");
        }
      },
      async userAction(userId, action) {
        if (!confirm(`Are you sure you want to ${action} this user?`)) {
          return;
        }
        try {
          const res = await fetch(`/api/admin/user/${userId}/${action}`, {
            method: "PUT",
          });
          if (res.ok) {
            const data = await res.json();
            window.triggerToast(data.message, "success");
          }
        } catch (error) {
          window.triggerToast(error, "warning");
        }
        this.fetchUsers();
      },
      resetUserSearch() {
        this.userSearchQuery = "";
        this.selectedRole = "";
      },
    },
  };
  
  export default AdminUsers;
  