window.NavBar = {
  setup() {
    const { ref, onMounted } = Vue;

    // --- Reactive Data ---
    const user = ref({
      name: 'Jane Doe',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    });

    const orderCount = ref(3);
    const cartItemCount = ref(5);
    
    // --- Lifecycle Hooks ---
    onMounted(() => {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    });

    return {
      user,
      orderCount,
      cartItemCount,
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
            <li class="nav-item dropdown">
              <a class="pizza-nav-link nav-link dropdown-toggle" href="#" id="pizzaProductsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Products
              </a>
              <ul class="pizza-dropdown-menu dropdown-menu" aria-labelledby="pizzaProductsDropdown">
                <li><router-link class="dropdown-item" to="/product">Pizzas</router-link></li>
                <li><router-link class="dropdown-item" to="/product">Sides</router-link></li>
                <li><router-link class="dropdown-item" to="/product">Drinks</router-link></li>
                <li><router-link class="dropdown-item" to="/product">Dessert</router-link></li>
              </ul>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="pizza-nav-link nav-link" active-class="router-link-active">About</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/contact" class="pizza-nav-link nav-link" active-class="router-link-active">Contact</router-link>
            </li>
          </ul>
          
          <!-- Right side items -->
          <div class="d-flex align-items-center">
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
                <span v-if="orderCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {{ orderCount }}
                  <span class="visually-hidden">unread orders</span>
                </span>
              </button>
            </router-link>
            
            <!-- Cart -->
            <router-link to="/cart" class="pizza-nav-cart position-relative me-3">
              <i class="pizza-nav-icon bi bi-cart3"></i>
              <span v-if="cartItemCount > 0" class="pizza-badge-notification">{{ cartItemCount }}</span>
            </router-link>
            
            <!-- User dropdown -->
            <div class="nav-item dropdown">
              <a class="pizza-nav-link nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img :src="user.avatar" :alt="user.name" class="pizza-nav-avatar me-2">
                <span class="d-none d-lg-inline">{{ user.name }}</span>
              </a>
              <ul class="pizza-dropdown-menu dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><router-link class="dropdown-item" to="/account"><i class="bi bi-person me-2"></i>Profile</router-link></li>
                <li><hr class="dropdown-divider"></li>
                <li><router-link class="dropdown-item text-danger" to="/authentication"><i class="bi bi-box-arrow-right me-2"></i>Logout</router-link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
};