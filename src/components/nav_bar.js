window.NavBar = {
  setup() {
    const { ref, onMounted, watch } = Vue;
    const router = VueRouter.useRouter();

    // --- Reactive Data ---
    const user = ref({
      name: '',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg' // Default avatar
    });

    const orderCount = ref(3);
    const cartItemCount = ref(0);

    // Function to load user data from sessionStorage
    const loadUserData = () => {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          user.value = {
            name: userData.name || userData.username || 'User',
            avatar: userData.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'
          };
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Fallback to empty name if parsing fails
          user.value.name = '';
        }
      } else {
        // No user logged in, clear the name
        user.value.name = '';
      }
    };

    // Function to load cart count from sessionStorage
    const loadCartCount = () => {
      const cart = sessionStorage.getItem('cart');
      if (cart) {
        try {
          const cartArr = JSON.parse(cart);
          cartItemCount.value = cartArr.reduce((sum, item) => sum + (item.quantity || 1), 0);
        } catch (e) {
          cartItemCount.value = 0;
        }
      } else {
        cartItemCount.value = 0;
      }
    };

    // --- Lifecycle Hooks ---
    onMounted(() => {
      loadUserData();
      loadCartCount();

      // Listen for storage changes (in case user logs in/out or cart changes in another tab)
      window.addEventListener('storage', () => {
        loadUserData();
        loadCartCount();
      });

      // Optionally, update cart count when navigating (for SPA)
      window.addEventListener('focus', loadCartCount);

      // Initialize Bootstrap tooltips
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    });

    function goToOurStory() {
      router.push('/').then(() => {
        setTimeout(() => {
          const el = document.getElementById('our-story');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      });
    }

    function goToFooter() {
      router.push('/').then(() => {
        setTimeout(() => {
          const el = document.getElementById('footer');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      });
    }

    // Function to handle logout (you might want to add this)
    const handleLogout = () => {
      sessionStorage.removeItem('user');
      loadUserData(); // Refresh user data
      router.push('/auth'); // Redirect to login page
    };

    return {
      user,
      orderCount,
      cartItemCount,
      goToOurStory,
      goToFooter,
      handleLogout,
      loadUserData
    };
  },
  template: `
    <style>
      .pizza-navbar {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        background-color: #fff !important;
        transition: all 0.3s ease;
      }
      
      .pizza-navbar:hover {
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      }
      
      .pizza-navbar-brand {
        transition: transform 0.3s ease;
      }
      
      .pizza-navbar-brand:hover {
        transform: scale(1.05);
      }
      
      .pizza-logo {
        transition: all 0.3s ease;
      }
      
      .pizza-nav-link {
        font-weight: 500;
        color: #333 !important;
        padding: 0.5rem 1rem;
        margin: 0 0.15rem;
        border-radius: 0.5rem;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .pizza-nav-link:hover,
      .pizza-nav-link.router-link-active {
        color: #d9230f !important;
        background-color: rgba(217, 35, 15, 0.1);
      }
      
      .pizza-nav-link.router-link-active:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background-color: #d9230f;
        border-radius: 3px;
      }
      
      .pizza-dropdown-menu {
        border: none;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        border-radius: 0.5rem;
        padding: 0.5rem;
        margin-top: 0.5rem;
      }
      
      .pizza-dropdown-menu .dropdown-item {
        padding: 0.5rem 1rem;
        border-radius: 0.3rem;
        transition: all 0.2s ease;
      }
      
      .pizza-dropdown-menu .dropdown-item:hover {
        background-color: rgba(217, 35, 15, 0.1);
        color: #d9230f;
      }
      
      .pizza-nav-btn {
        border-radius: 0.5rem !important;
        font-weight: 500;
        transition: all 0.2s ease;
        padding: 0.5rem 1rem;
      }
      
      .pizza-nav-btn:hover {
        background-color: #d9230f;
        color: white !important;
        transform: translateY(-2px);
      }
      
      .pizza-nav-icon {
        font-size: 1.2rem;
      }
      
      .pizza-nav-cart {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        transition: all 0.2s ease;
      }
      
      .pizza-nav-cart:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: #d9230f !important;
      }
      
      .pizza-badge-notification {
        position: absolute;
        top: -5px;
        right: -5px;
        font-size: 0.7rem;
        padding: 0.25rem 0.4rem;
        color: white;
      }
      
      .pizza-nav-avatar {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      
      .pizza-nav-avatar:hover {
        border-color: #d9230f;
      }
      
      .login-btn {
        background-color: #d9230f;
        border-color: #d9230f;
        color: white;
        font-weight: 500;
        padding: 0.5rem 1.5rem;
        border-radius: 0.5rem;
        transition: all 0.2s ease;
      }
      
      .login-btn:hover {
        background-color: #b71c0c;
        border-color: #b71c0c;
        transform: translateY(-2px);
      }
      
      @media (max-width: 992px) {
        .pizza-dropdown-menu {
          box-shadow: none;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .pizza-nav-link.router-link-active:after {
          display: none;
        }
      }
    </style>
    
    <nav class="pizza-navbar navbar navbar-expand-lg navbar-light sticky-top px-3 py-2">
      <div class="container-fluid">
        <!-- Logo -->
        <router-link to="/" class="pizza-navbar-brand navbar-brand me-4">
          <img src="src/images/logo.png" alt="Logo" height="50" class="pizza-logo d-inline-block align-top">
        </router-link>
        
        <!-- Mobile toggle -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#pizzaNavbarContent" 
                aria-controls="pizzaNavbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Navigation content -->
        <div class="collapse navbar-collapse" id="pizzaNavbarContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to="/" class="pizza-nav-link nav-link" exact-active-class="router-link-active">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/product" class="pizza-nav-link nav-link" active-class="router-link-active">Products</router-link>
            </li>
            <li class="nav-item">
              <a
                href="#"
                class="pizza-nav-link nav-link"
                @click.prevent="goToOurStory"
              >About</a>
            </li>
            <li class="nav-item">
              <a
                href="#"
                class="pizza-nav-link nav-link"
                @click.prevent="goToFooter"
              >Contact</a>
            </li>
          </ul>
          
          <!-- Right side items -->
          <div class="d-flex align-items-center">
            <!-- Show these only if user is logged in -->
            <template v-if="user.name">
              <!-- Order button -->
              <router-link to="/my_purchase" custom v-slot="{ navigate, href }">
                <button
                  type="button"
                  class="pizza-nav-btn btn btn-outline-primary me-3 position-relative"
                  :href="href"
                  @click="navigate"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  title="Track your orders"
                >
                  <i class="pizza-nav-icon bi bi-clipboard-check me-1"></i>
                  <span class="d-none d-md-inline">My Purchase</span>
                </button>
              </router-link>
              
              <!-- Cart -->
              <router-link to="/cart" class="pizza-nav-cart position-relative me-3">
                <i class="pizza-nav-icon bi bi-cart3"></i>
                <span v-if="cartItemCount > 0" class="pizza-badge-notification">{{ cartItemCount }}</span>
              </router-link>
              
              <!-- User section (navigates to /account) -->
              <router-link to="/account" class="pizza-nav-link nav-link d-flex align-items-center ms-2" style="cursor:pointer;">
                <img :src="user.avatar" :alt="user.name" class="pizza-nav-avatar me-2">
                <span class="d-none d-lg-inline">{{ user.name }}</span>
              </router-link>
            </template>
            
            <!-- Show login button if user is not logged in -->
            <template v-else>
              <router-link to="/authentication" class="btn login-btn">
                <i class="bi bi-person-circle me-1"></i>
                Login
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>
  `
};