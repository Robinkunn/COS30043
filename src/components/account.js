window.Account = {
  setup() {
    // Import necessary functions from Vue
    const { reactive, computed } = Vue;

    // --- Reactive State for User Profile ---
    // In a real app, this data would be fetched from an API on component mount.
    const user = reactive({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      phone: '(123) 456-7890',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      },
      about: "I'm a digital designer with over 5 years of experience in UX/UI design.",
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      membership: 'Premium Member',
      social: {
        twitter: '@sarahjohnson',
        facebook: 'sarah.johnson',
        instagram: '@sarahjohnson',
      },
    });

    const states = reactive(['NY', 'CA', 'TX', 'FL', 'IL']); // Sample list of states for the dropdown

    // --- Computed Properties ---
    const fullName = computed(() => `${user.firstName} ${user.lastName}`);

    // --- Methods ---
    const updateProfile = () => {
      // In a real app, you would send the 'user' object to your backend API
      console.log('Updating profile with data:', JSON.parse(JSON.stringify(user)));
      alert('Profile updated successfully! (Check console for data)');
    };

    const updateSocialProfiles = () => {
      console.log('Updating social profiles with data:', JSON.parse(JSON.stringify(user.social)));
      alert('Social profiles updated! (Check console for data)');
    };
    
    const changePhoto = () => {
        // This could trigger a hidden file input or open a modal for uploading.
        alert('Change photo functionality would be implemented here.');
    };

    // Expose state and methods to the template
    return {
      user,
      states,
      fullName,
      updateProfile,
      updateSocialProfiles,
      changePhoto
    };
  },
  template: `
    <div class="account-container bg-white">
      <!-- Account Header -->
      <div class="account-header">
        <img :src="user.avatar" alt="Profile" class="profile-img">
        <h3>{{ fullName }}</h3>
        <p class="mb-0">{{ user.membership }} <span class="badge bg-warning text-dark ms-2">PRO</span></p>
      </div>

      <!-- Account Content -->
      <div class="row g-0">
        <div class="col-12">
          <div class="account-content">
            <h4 class="mb-4">Profile Information</h4>
            <div class="row">
              <!-- Left Column: Photo and Social -->
              <div class="col-lg-4">
                <div class="card">
                  <div class="card-body text-center">
                    <img :src="user.avatar" alt="Profile" class="profile-img mb-3" style="width:120px; height:120px;">
                    <h5>{{ fullName }}</h5>
                    <p class="text-muted">{{ user.membership }}</p>
                    <button class="btn btn-primary btn-sm" @click="changePhoto">
                      <i class="fas fa-camera me-1"></i> Change Photo
                    </button>
                  </div>
                </div>
                <div class="card mt-4">
                  <div class="card-header">Social Profiles</div>
                  <div class="card-body">
                    <form @submit.prevent="updateSocialProfiles">
                      <div class="mb-3">
                        <label class="form-label">Twitter</label>
                        <div class="input-group">
                          <span class="input-group-text"><i class="fab fa-twitter"></i></span>
                          <input type="text" class="form-control" v-model="user.social.twitter">
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Facebook</label>
                        <div class="input-group">
                          <span class="input-group-text"><i class="fab fa-facebook-f"></i></span>
                          <input type="text" class="form-control" v-model="user.social.facebook">
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Instagram</label>
                        <div class="input-group">
                          <span class="input-group-text"><i class="fab fa-instagram"></i></span>
                          <input type="text" class="form-control" v-model="user.social.instagram">
                        </div>
                      </div>
                      <button type="submit" class="btn btn-primary w-100">Update Social</button>
                    </form>
                  </div>
                </div>
              </div>
              <!-- Right Column: Personal Information -->
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header">Personal Information</div>
                  <div class="card-body">
                    <form @submit.prevent="updateProfile">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">First Name</label>
                          <input type="text" class="form-control" v-model="user.firstName">
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Last Name</label>
                          <input type="text" class="form-control" v-model="user.lastName">
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" v-model="user.email">
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="form-control" v-model="user.phone">
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Address</label>
                        <input type="text" class="form-control" v-model="user.address.street">
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">City</label>
                          <input type="text" class="form-control" v-model="user.address.city">
                        </div>
                        <div class="col-md-3 mb-3">
                          <label class="form-label">State</label>
                          <select class="form-select" v-model="user.address.state">
                            <option v-for="state in states" :key="state" :value="state">{{ state }}</option>
                          </select>
                        </div>
                        <div class="col-md-3 mb-3">
                          <label class="form-label">ZIP</label>
                          <input type="text" class="form-control" v-model="user.address.zip">
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">About Me</label>
                        <textarea class="form-control" rows="3" v-model="user.about"></textarea>
                      </div>
                      <button type="submit" class="btn btn-primary">Update Profile</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};