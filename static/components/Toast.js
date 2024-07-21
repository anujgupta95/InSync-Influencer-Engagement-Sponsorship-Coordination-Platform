const Toast = {
  template: `
        <div>
            <!-- <button type="button" class="btn btn-primary" @click="triggerToast">Show live toast</button> -->
            <div id="liveToast" :class="toastClass" 
              class="toast shadow position-fixed top-0 start-50 translate-middle-x m-3" role="alert" 
              aria-live="assertive" aria-atomic="true"  style="max-width:300px;"
              >
                <div class="d-flex" >
                    <div class="toast-body">
                        {{ message }}
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>   
    `,
  // props: {
  //   message: {
  //     type: String,
  //     default: "Hello, world! This is a toast message.",
  //   },
  //   variant: {
  //     type: String,
  //     default: "variant",
  //   },
  // },
  data() {
    return {
      message: "",
      variant: "",
    };
  },
  computed: {
    toastClass() {
      return {
        "custom-bg-success": this.variant == "success",
        "custom-bg-warning": this.variant == "warning",
        "custom-bg-danger": this.variant == "danger",
        "custom-bg": this.variant == "normal",
      };
    },
  },
  mounted() {
    this.toast = new bootstrap.Toast(document.getElementById("liveToast"));

    // Expose a method to trigger the toast programmatically
    window.triggerToast = this.triggerToast;
  },
  methods: {
    triggerToast(message = "", variant = "success") {
      // Check if there is already an active toast instance
      this.toast = new bootstrap.Toast(document.getElementById("liveToast"));
      // if (window.activeToast) {
      //   window.activeToast.hide();
      // }
      if (message) {
        this.message = message;
      }
      if (variant) {
        this.variant = variant;
      }
      this.toast.show();
      // Update the activeToast variable to store the current toast instance
      // window.activeToast = this.toast;
    },
  },
};

export default Toast;
