const Home = {
  template: `
  <div>
    <h1>Hi this is from Home Component </h1>
    <h2 v-if="loggedIn">You are Logged in</h2>
    <h2 v-else>You are Not Logged in</h2>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
    <p class="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, quas! Cum deleniti eveniet corrupti pariatur assumenda voluptatum quam dolore tempore reprehenderit doloribus, aperiam perspiciatis nulla consequuntur facere fugiat magnam provident.</p>
  </div>`,
  async mounted() {
    const res = await fetch(window.location.origin + "/check_login");
    try {
      const data = await res.json();
      console.log(data);
      this.loggedIn = true;
    } catch {
      this.loggedIn = false;
    }
  },
  data() {
    return {
      loggedIn: false,
    };
  },
};

export default Home;
