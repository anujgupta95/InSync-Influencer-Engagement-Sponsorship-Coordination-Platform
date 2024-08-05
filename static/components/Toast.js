const Toast = {
  template: `
        <div>
            <!-- <button type="button" class="btn btn-primary" @click="triggerToast">Show live toast</button> -->
            <div id="liveToast" :class="[toastClass, visible ? 'show' : '']"
              class="toast shadow position-fixed top-0 start-50 translate-middle-x m-3 fade" role="alert" 
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
  data() {
    return {
      message: "",
      variant: "",
      visible: false,
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
    window.triggerToast = this.triggerToast;
  },
  methods: {
    triggerToast(message = "", variant = "success") {
      if (message) {
        this.message = message;
      }
      if (variant) {
        this.variant = variant;
      }
      // this.toast.show();
      this.showToast();
    },
    showToast() {
      this.visible = true;
      setTimeout(() => {
        this.visible = false;
      }, 3000); // Adjust delay as needed
    },
  },
};

export default Toast;
