import store from "../utils/store.js";
const Home = {
  template: `
  <div>
    <h1>Hi this is from Home Component </h1>
    <h2 v-if="isLoggedIn">You are Logged in</h2>
    <h2 v-else>You are Not Logged in</h2>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
  </div>`,
  computed: {
    isLoggedIn() {
      return store.getters.isLoggedIn;
    },
    userRole() {
      return store.getters.userRole;
    },
  },
  mounted() {
    store.dispatch("checkLogin");
  },
};

export default Home;
