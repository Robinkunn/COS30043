window.Authentication = {
  setup(props, { root }) {
    const activeTab = Vue.ref('login');
    const loginForm = Vue.ref({
      username: '',
      password: '',
      remember: false
    });
    const registerForm = Vue.ref({
      username: '',
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      password: '',
      confirmPassword: '',
      agreeTerms: false
    });

    const router = VueRouter.useRouter();

    const handleLogin = () => {
      // Simple form validation
      if (!loginForm.value.username || !loginForm.value.password) {
        alert('Please enter both username and password.');
        return;
      }

      const form = new URLSearchParams();
      form.append('action', 'login');
      form.append('username', loginForm.value.username);
      form.append('password', loginForm.value.password);

      // fetch('api_user.php', {
      fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI', {
        method: 'POST',
        body: form
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        if (data.success) {
          // Store user details in sessionStorage
          sessionStorage.setItem('user', JSON.stringify(data.user));
          // Clear any existing cart upon successful login to start a fresh session.
          sessionStorage.removeItem('cart');
          router.push('/'); // Use vue-router to navigate to homepage
        }
      });
    };


    const handleRegister = () => {
    // fetch('api_user.php?action=register', {
    fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm.value)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.success) activeTab.value = 'login';
    });
  };


    return { activeTab, loginForm, registerForm, handleLogin, handleRegister };
  },
  template: `
    <div class="auth-page" style="
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <!-- Video Background -->
      <div class="video-background" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        overflow: hidden;
      ">
        <video autoplay muted loop playsinline style="
          width: 100%;
          height: 100%;
          object-fit: cover;
        ">
          <source src="src/videos/login_background.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div class="video-overlay" style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
        "></div>
      </div>
      
      <!-- Auth Container -->
      <div class="auth-container" style="
        width: 100%;
        max-width: 500px;
        padding: 20px;
      ">
        <div class="auth-card" style="
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          padding: 30px;
        ">
          <div class="brand-logo" style="
            text-align: center;
            margin-bottom: 30px;
          ">
            <img src="src/images/logo.png" alt="Pizza Hat" style="max-width: 150px;">
          </div>
          
          <!-- Tabs Navigation -->
          <ul class="nav nav-tabs" id="authTabs" style="
            border-bottom: 1px solid #dee2e6;
            margin-bottom: 25px;
          ">
            <li class="nav-item">
              <button 
                class="nav-link" 
                :class="{ 'active': activeTab === 'login' }" 
                @click="activeTab = 'login'"
                style="
                  border: none;
                  color: #6c757d;
                  font-weight: 500;
                  padding: 10px 20px;
                "
                :style="activeTab === 'login' ? 'color: #dc3545; background: transparent; border-bottom: 2px solid #dc3545;' : ''"
              >
                Sign In
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link" 
                :class="{ 'active': activeTab === 'register' }" 
                @click="activeTab = 'register'"
                style="
                  border: none;
                  color: #6c757d;
                  font-weight: 500;
                  padding: 10px 20px;
                "
                :style="activeTab === 'register' ? 'color: #dc3545; background: transparent; border-bottom: 2px solid #dc3545;' : ''"
              >
                Create Account
              </button>
            </li>
          </ul>
          
          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Login Form -->
            <div class="tab-pane" :class="{ 'active': activeTab === 'login' }">
              <form @submit.prevent="handleLogin" class="auth-form">
                <div class="mb-3">
                  <label for="loginUsername" class="form-label">Username</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="loginUsername" 
                    v-model="loginForm.username"
                    required
                    style="
                      padding: 12px 15px;
                      margin-bottom: 15px;
                    "
                  >
                </div>
                <div class="mb-3">
                  <label for="loginPassword" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="loginPassword" 
                    v-model="loginForm.password"
                    required
                    style="
                      padding: 12px 15px;
                      margin-bottom: 15px;
                    "
                  >
                </div>

                <button type="submit" class="btn btn-primary w-100" style="
                  padding: 12px;
                  font-weight: 600;
                ">Sign In</button>
              </form>
            </div>
            
            <!-- Register Form -->
            <div class="tab-pane" :class="{ 'active': activeTab === 'register' }">
              <form @submit.prevent="handleRegister" class="auth-form">
                <!-- Personal Information Section -->
                <div class="form-section" style="margin-bottom: 25px;">
                  <h5 style="
                    color: #dc3545;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                  ">Personal Information</h5>
                  
                  <div class="mb-3">
                    <label for="registerName" class="form-label">Full Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="registerName" 
                      v-model="registerForm.name"
                      required
                      style="
                        padding: 12px 15px;
                        margin-bottom: 15px;
                      "
                    >
                  </div>
                  <div class="mb-3">
                    <label for="registerEmail" class="form-label">Email address</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="registerEmail" 
                      v-model="registerForm.email"
                      required
                      style="
                        padding: 12px 15px;
                        margin-bottom: 15px;
                      "
                    >
                  </div>
                  <div class="mb-3">
                    <label for="registerPhone" class="form-label">Phone</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      id="registerPhone" 
                      v-model="registerForm.phone"
                      required
                      style="
                        padding: 12px 15px;
                        margin-bottom: 15px;
                      "
                    >
                  </div>
                </div>

                <!-- Address Section -->
                <div class="form-section" style="margin-bottom: 25px;">
                  <h5 style="
                    color: #dc3545;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                  ">Delivery Address</h5>
                  <div class="mb-3">
                    <label class="form-label">Street</label>
                    <input 
                      type="text" 
                      class="form-control mb-2" 
                      placeholder="Street address"
                      v-model="registerForm.address.street"
                      required
                    >
                  </div>
                  <div class="row">
                    <div class="col-6">
                      <label class="form-label">City</label>
                      <input 
                        type="text" 
                        class="form-control mb-2" 
                        placeholder="City"
                        v-model="registerForm.address.city"
                        required
                      >
                    </div>
                    <div class="col-3">
                      <label class="form-label">State</label>
                      <input 
                        type="text" 
                        class="form-control mb-2" 
                        placeholder="State"
                        v-model="registerForm.address.state"
                        required
                      >
                    </div>
                    <div class="col-3">
                      <label class="form-label">ZIP</label>
                      <input 
                        type="text" 
                        class="form-control mb-2" 
                        placeholder="ZIP"
                        v-model="registerForm.address.zip"
                        required
                      >
                    </div>
                  </div>
                </div>

                <!-- Account Security Section -->
                <div class="form-section" style="margin-bottom: 25px;">
                  <h5 style="
                    color: #dc3545;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                  ">Account</h5>

                  <div class="mb-3">
                    <label for="registerUsername" class="form-label">Username</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="registerUsername" 
                      v-model="registerForm.username"
                      required
                      style="
                        padding: 12px 15px;
                        margin-bottom: 15px;
                      "
                    >
                  </div>
                  
                  <div class="mb-3">
                    <label for="registerPassword" class="form-label">Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      id="registerPassword" 
                      v-model="registerForm.password"
                      required
                      style="
                        padding: 12px 15px;
                        margin-bottom: 15px;
                      "
                    >
                  </div>
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      id="confirmPassword" 
                      v-model="registerForm.confirmPassword"
                      required
                      style="
                        padding: 12px 15px;
                        margin-bottom: 15px;
                      "
                    >
                  </div>
                </div>

                <!-- Terms and Conditions -->
                <div class="mb-3 form-check">
                  <input 
                    type="checkbox" 
                    class="form-check-input" 
                    id="agreeTerms"
                    v-model="registerForm.agreeTerms"
                    required
                  >
                  <label class="form-check-label" for="agreeTerms">
                    I agree to the Terms and Conditions
                  </label>
                </div>
                <button type="submit" class="btn btn-danger w-100" style="
                  padding: 12px;
                  font-weight: 600;
                ">Create Account</button>
              </form>
            </div>
          </div>
          
          <div class="auth-footer text-center mt-3" style="font-size: 14px;">
            <p class="text-muted">
              {{ activeTab === 'login' ? "Don't have an account?" : "Already have an account?" }}
              <a href="#" @click.prevent="activeTab = activeTab === 'login' ? 'register' : 'login'" style="
                color: #dc3545;
                text-decoration: none;
                font-weight: 500;
              ">
                {{ activeTab === 'login' ? 'Sign up' : 'Sign in' }}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
};