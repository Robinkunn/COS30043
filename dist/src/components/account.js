window.Account = {
  setup() {
    const { reactive, onMounted, ref } = Vue;
    const router = VueRouter.useRouter();
    
    const user = reactive({
      fullname: '',
      username: '',
      email: '',
      phone: '',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      socialLinks: [
        { platform: 'Twitter', url: '#', icon: 'bi-twitter' },
        { platform: 'LinkedIn', url: '#', icon: 'bi-linkedin' },
        { platform: 'Dribbble', url: '#', icon: 'bi-dribbble' }
      ],
      stats: {
        orders: 0,
        reviews: 0,
        memberSince: ''
      }
    });

    // Password change form
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const isLoading = ref(true);
    const errorMessage = ref('');
    const isSaving = ref(false);
    const isChangingPassword = ref(false);
    const passwordError = ref('');
    const passwordSuccess = ref('');

    // Load user data from sessionStorage
    const loadUserData = () => {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);

          user.fullname = userData.name || userData.fullname || '';
          user.username = userData.username || '';
          user.email = userData.email || '';
          user.phone = userData.phone || '';
          user.avatar = userData.avatar || 'src/images/che.jpg';

          if (userData.address && typeof userData.address === 'object') {
            user.address.street = userData.address.street || '';
            user.address.city = userData.address.city || '';
            user.address.state = userData.address.state || '';
            user.address.zip = userData.address.zip || '';
          } else {
            user.address.street = userData.street || '';
            user.address.city = userData.city || '';
            user.address.state = userData.state || '';
            user.address.zip = userData.zip || '';
          }

          if (userData.stats) {
            user.stats.orders = userData.stats.orders || 0;
            user.stats.reviews = userData.stats.reviews || 0;
            user.stats.memberSince = userData.stats.memberSince || 'Recently';
          }

          isLoading.value = false;
        } catch (error) {
          console.error('Error parsing user data:', error);
          errorMessage.value = 'Error loading user data';
          isLoading.value = false;
        }
      } else {
        router.push('/authentication');
      }
    };

    // Save user data to database
    const saveUserData = async () => {
      if (!user.username) {
        alert('Username is required to save changes.');
        return;
      }

      isSaving.value = true;
      
      try {
        const updateData = {
          username: user.username,
          name: user.fullname,
          email: user.email,
          phone: user.phone,
          address: {
            street: user.address.street,
            city: user.address.city,
            state: user.address.state,
            zip: user.address.zip
          }
        };

        const response = await fetch('api_user.php?action=update_profile', {
        // const response = await fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI?action=update_profile', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (result.success) {
          const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
          const updatedUser = {
            ...currentUser,
            name: user.fullname,
            email: user.email,
            phone: user.phone,
            address: {
              street: user.address.street,
              city: user.address.city,
              state: user.address.state,
              zip: user.address.zip
            },
            street: user.address.street,
            city: user.address.city,
            state: user.address.state,
            zip: user.address.zip
          };
          
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          alert('Profile updated successfully!');
        } else {
          alert('Error: ' + (result.message || 'Failed to update profile'));
        }
        
      } catch (error) {
        console.error('Error saving user data:', error);
        alert('Network error. Please check your connection and try again.');
      } finally {
        isSaving.value = false;
      }
    };

    // Change password handler
    const changePassword = async () => {
      passwordError.value = '';
      passwordSuccess.value = '';

      // Validate form
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        passwordError.value = 'All fields are required';
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        passwordError.value = 'New passwords do not match';
        return;
      }

      isChangingPassword.value = true;

      try {
        const response = await fetch('api_user.php?action=change_password', {
        // const response = await fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI?action=change_password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: user.username,
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          })
        });

        const result = await response.json();

        if (result.success) {
          passwordSuccess.value = 'Password changed successfully!';
          // Clear form
          passwordForm.currentPassword = '';
          passwordForm.newPassword = '';
          passwordForm.confirmPassword = '';
        } else {
          passwordError.value = result.message || 'Failed to change password';
        }
      } catch (error) {
        console.error('Error changing password:', error);
        passwordError.value = 'Network error. Please try again.';
      } finally {
        isChangingPassword.value = false;
      }
    };

    // Sign out handler
    const signOut = () => {
      sessionStorage.removeItem('user');
      router.push('/authentication');
    };

    onMounted(() => {
      loadUserData();
    });
    
    return { 
      user, 
      passwordForm,
      isLoading, 
      errorMessage, 
      isSaving,
      isChangingPassword,
      passwordError,
      passwordSuccess,
      signOut, 
      saveUserData,
      changePassword,
      loadUserData
    };
  },
  template: `
    <div class="container py-5">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading profile...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
        <button class="btn btn-link p-0 ms-2" @click="loadUserData">Retry</button>
      </div>
      
      <!-- Main Content -->
      <div v-else class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body text-center p-4">
              <div class="position-relative d-inline-block mb-3">
                <img :src="user.avatar" alt="Profile" class="rounded-circle shadow" style="width:120px;height:120px;object-fit:cover;">
              </div>
              <h4 class="mb-1">
                {{ user.fullname || user.username || 'User' }}
              </h4>
              <p class="text-muted mb-3">{{ user.email || 'No email provided' }}</p>
              
              <button class="btn btn-outline-danger w-100" @click="signOut">
                <i class="bi bi-box-arrow-right me-2"></i>Sign Out
              </button>
            </div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="col-lg-9">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white border-bottom-0">
              <h5 class="mb-0">Profile Overview</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Full Name</label>
                  <input type="text" class="form-control" v-model="user.fullname" placeholder="Enter full name" :disabled="isSaving">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Username</label>
                  <input type="text" class="form-control" v-model="user.username" placeholder="Username" readonly>
                  <small class="text-muted">Username cannot be changed</small>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Email</label>
                  <input type="email" class="form-control" v-model="user.email" placeholder="Enter email" :disabled="isSaving">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Phone</label>
                  <input type="tel" class="form-control" v-model="user.phone" placeholder="Enter phone number" :disabled="isSaving">
                </div>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white border-bottom-0">
                  <h5 class="mb-0">Address</h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label text-muted small mb-1">Street</label>
                    <input type="text" class="form-control" v-model="user.address.street" placeholder="Enter street address" :disabled="isSaving">
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted small mb-1">City</label>
                      <input type="text" class="form-control" v-model="user.address.city" placeholder="Enter city" :disabled="isSaving">
                    </div>
                    <div class="col-md-3 mb-3">
                      <label class="form-label text-muted small mb-1">State</label>
                      <input type="text" class="form-control" v-model="user.address.state" placeholder="State" :disabled="isSaving">
                    </div>
                    <div class="col-md-3 mb-3">
                      <label class="form-label text-muted small mb-1">ZIP</label>
                      <input type="text" class="form-control" v-model="user.address.zip" placeholder="ZIP code" :disabled="isSaving">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Password Change Card -->
            <div class="col-md-6 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white border-bottom-0">
                  <h5 class="mb-0">Change Password</h5>
                </div>
                <div class="card-body">
                  <div v-if="passwordError" class="alert alert-danger mb-3">
                    {{ passwordError }}
                  </div>
                  <div v-if="passwordSuccess" class="alert alert-success mb-3">
                    {{ passwordSuccess }}
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted small mb-1">Current Password</label>
                    <input type="password" class="form-control" v-model="passwordForm.currentPassword" placeholder="Enter current password">
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted small mb-1">New Password</label>
                    <input type="password" class="form-control" v-model="passwordForm.newPassword" placeholder="Enter new password">
                  </div>
                  <div class="mb-3">
                    <label class="form-label text-muted small mb-1">Confirm New Password</label>
                    <input type="password" class="form-control" v-model="passwordForm.confirmPassword" placeholder="Confirm new password">
                  </div>
                  <button class="btn btn-primary" @click="changePassword" :disabled="isChangingPassword">
                    <span v-if="isChangingPassword" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-primary" @click="saveUserData" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
};