window.Account = {
  setup() {
    const { reactive } = Vue;
    const router = VueRouter.useRouter();
    const user = reactive({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      phone: '(123) 456-7890',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      about: "I'm a digital designer with over 5 years of experience in UX/UI design.",
      address: {
        street: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zip: "94105"
      },
      socialLinks: [
        { platform: 'Twitter', url: '#', icon: 'bi-twitter' },
        { platform: 'LinkedIn', url: '#', icon: 'bi-linkedin' },
        { platform: 'Dribbble', url: '#', icon: 'bi-dribbble' }
      ],
      stats: {
        orders: 24,
        reviews: 8,
        memberSince: 'Jan 2018'
      }
    });

    // Sign out handler
    function signOut() {
      router.push('/authentication');
    }
    
    return { user, signOut };
  },
  template: `
    <div class="container py-5">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body text-center p-4">
              <div class="position-relative d-inline-block mb-3">
                <img :src="user.avatar" alt="Profile" class="rounded-circle shadow" style="width:120px;height:120px;object-fit:cover;">
                <button class="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0" style="width:36px;height:36px;">
                  <i class="bi bi-camera"></i>
                </button>
              </div>
              <h4 class="mb-1">{{ user.firstName }} {{ user.lastName }}</h4>
              <p class="text-muted mb-3">{{ user.email }}</p>
              
              <div class="d-flex justify-content-center gap-2 mb-4">
                <a v-for="link in user.socialLinks" :href="link.url" class="btn btn-outline-secondary btn-sm rounded-circle" style="width:36px;height:36px;">
                  <i :class="'bi ' + link.icon"></i>
                </a>
              </div>
              
              <div class="list-group list-group-flush mb-3">
                <router-link to="/account" class="list-group-item list-group-item-action active">
                  <i class="bi bi-person me-2"></i>Profile
                </router-link>
                <router-link to="/account/orders" class="list-group-item list-group-item-action">
                  <i class="bi bi-bag me-2"></i>Orders
                </router-link>
                <router-link to="/account/settings" class="list-group-item list-group-item-action">
                  <i class="bi bi-gear me-2"></i>Settings
                </router-link>
                <router-link to="/account/security" class="list-group-item list-group-item-action">
                  <i class="bi bi-shield-lock me-2"></i>Security
                </router-link>
              </div>
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
                  <label class="form-label text-muted small mb-1">First Name</label>
                  <input type="text" class="form-control" v-model="user.firstName">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Last Name</label>
                  <input type="text" class="form-control" v-model="user.lastName">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Email</label>
                  <input type="email" class="form-control" v-model="user.email">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted small mb-1">Phone</label>
                  <input type="tel" class="form-control" v-model="user.phone">
                </div>
                <div class="col-12 mb-3">
                  <label class="form-label text-muted small mb-1">About</label>
                  <textarea class="form-control" rows="3" v-model="user.about"></textarea>
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
                    <input type="text" class="form-control" v-model="user.address.street">
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label text-muted small mb-1">City</label>
                      <input type="text" class="form-control" v-model="user.address.city">
                    </div>
                    <div class="col-md-3 mb-3">
                      <label class="form-label text-muted small mb-1">State</label>
                      <input type="text" class="form-control" v-model="user.address.state">
                    </div>
                    <div class="col-md-3 mb-3">
                      <label class="form-label text-muted small mb-1">ZIP</label>
                      <input type="text" class="form-control" v-model="user.address.zip">
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6 mb-4">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white border-bottom-0">
                  <h5 class="mb-0">Account Stats</h5>
                </div>
                <div class="card-body">
                  <div class="d-flex align-items-center mb-3">
                    <div class="bg-light rounded p-3 me-3">
                      <i class="bi bi-bag text-primary" style="font-size:1.5rem;"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ user.stats.orders }}</h6>
                      <small class="text-muted">Total Orders</small>
                    </div>
                  </div>
                  
                  <div class="d-flex align-items-center mb-3">
                    <div class="bg-light rounded p-3 me-3">
                      <i class="bi bi-star text-primary" style="font-size:1.5rem;"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ user.stats.reviews }}</h6>
                      <small class="text-muted">Reviews Written</small>
                    </div>
                  </div>
                  
                  <div class="d-flex align-items-center">
                    <div class="bg-light rounded p-3 me-3">
                      <i class="bi bi-calendar text-primary" style="font-size:1.5rem;"></i>
                    </div>
                    <div>
                      <h6 class="mb-0">{{ user.stats.memberSince }}</h6>
                      <small class="text-muted">Member Since</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary">Cancel</button>
            <button class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `
};