import router from "../utils/router.js";
const AdRequest = {
  template: `
      <tr :class="trClass">
        <th>{{ adRequest.campaign_id }}</th>
        <td >{{ adRequest.user_id }}</td>
        <td>{{ adRequest.messages }}</td>
        <td>{{ adRequest.requirements }}</td>
        <td>{{ adRequest.payment_amount }}</td>
        <td>{{ adRequest.status }}</td>
        <td>
          <button class="btn btn-warning" @click="viewAdRequest">View</button>
        </td>
      </tr>
    `,
  props: {
    adRequest: {
      type: Object,
      required: true,
    },
  },
  computed: {
    trClass() {
      return {
        "custom-bg-success": this.adRequest.status == "accepted",
        "custom-bg-warning": this.adRequest.status == "negotiating",
        "custom-bg-danger": this.adRequest.status == "rejected",
        "custom-bg": this.adRequest == "pending",
      };
    },
  },
  methods: {
    async viewAdRequest() {
      router.push(`/sponsor/ad-request/${this.adRequest.id}`);
    },
  },
};

export default AdRequest;
