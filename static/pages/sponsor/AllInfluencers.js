const AllInfluencers = {
  template: `
      <div class="container mt-4">
          <div class="card rounded shadow">
              <div class="card-body">
                  <div class="d-flex align-items-center justify-content-between mb-3">
                      <h3 class="flex-grow-1">All Influencers</h3>
                      <button class="btn btn-outline-secondary" @click="resetFilter">Clear Filter</button>
                  </div>
  
                  <div class="d-flex mb-3 row g-2">
                      <div class="form-floating col-6">
                          <input v-model="SearchQuery" type="text" class="form-control" id="search" placeholder="Search influencers"/>
                          <label for="search">Search influencers</label>
                      </div>
                      
                      <div class="form-floating col">
                          <select v-model="followers" class="form-select" id="filter">
                              <option value="">All</option>
                              <option value="lessthan">Less Than</option>
                              <option value="greaterthan">Greater Than</option>
                          </select>
                          <label for="filter">Followers</label>
                      </div>
                      <div class="form-floating col mt-4">
                          <input v-model="range" type="range" min="0" :max="maxFollowers" step="500" class="form-range" placeholder="Search range"/>
                          <label for="range">Followers: {{ range }}</label>
                      </div>
                  </div>
              </div>
          </div>
  
          <div class="card mt-2 table-responsive">
              <table v-if="filterInfluencers.length > 0" class="text-center rounded card-body">
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Niche</th>
                          <th>Followers</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="influencer in filterInfluencers" :key="influencer.id" class="col-12">
                          <td>{{ influencer.id }}</td>
                          <td>{{ influencer.name }}</td>
                          <td>{{ influencer.influencer_data.category }}</td>
                          <td>{{ influencer.influencer_data.niche }}</td>
                          <td>{{ influencer.influencer_data.followers }}</td>
                      </tr>
                  </tbody>
              </table>
              <div v-else class="card-body fw-bold">No influencers found at the moment...</div>
          </div>
      </div>
    `,
  data() {
    return {
      influencers: [],
      SearchQuery: "",
      followers: "",
      range: 0,
    };
  },
  computed: {
    filterInfluencers() {
      return this.influencers.filter((influencer) => {
        const matchesSearchQuery =
          this.SearchQuery === "" ||
          Object.values(influencer).some((value) =>
            String(value).toLowerCase().includes(this.SearchQuery.toLowerCase())
          ) ||
          Object.values(influencer.influencer_data).some((value) =>
            String(value).toLowerCase().includes(this.SearchQuery.toLowerCase())
          );

        const followerCount = influencer.influencer_data.followers || 0;
        const matchesFollowers =
          this.followers === "" ||
          (this.followers === "lessthan" && followerCount <= this.range) ||
          (this.followers === "greaterthan" && followerCount >= this.range);

        return matchesSearchQuery && matchesFollowers;
      });
    },
    maxFollowers() {
      if (this.influencers.length === 0) return 1000000;
      return Math.max(
        this.influencers.map(
          (influencer) => influencer.influencer_data.followers
        )
      )+500;
    },
  },
  mounted() {
    this.updateInfluencers();
  },
  methods: {
    async updateInfluencers() {
      try {
        const res = await fetch("/api/users/all");
        this.influencers = await res.json();
      } catch (error) {
        window.triggerToast(error, "warning");
      }
    },
    resetFilter() {
      this.SearchQuery = "";
      this.followers = "";
      this.range = 0;
    },
  },
};

export default AllInfluencers;
