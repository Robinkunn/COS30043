window.Product = {
  setup() {
    const { ref, reactive, onMounted } = Vue;

    const menu = reactive({
      pizzas: [],
      sides: [],
      drinks: [],
      desserts: []
    });

    const activeTab = ref('pizzas');

    const getBadgeClass = (tag) => {
      switch(tag) {
        case 'Veg': return 'pizza-hat-badge-veg';
        case 'Non-Veg': return 'bg-danger';
        case 'Spicy': return 'pizza-hat-badge-spicy';
        default: return 'bg-secondary';
      }
    };

    const setActiveTab = (tab) => {
      activeTab.value = tab;
    };

    const addToCart = (item) => {
      // Add item to cart logic here
    };

    onMounted(async () => {
      // Load product data from products.json
      try {
        const response = await fetch('products.json');
        const data = await response.json();
        Object.assign(menu, data);
        
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl);
        });
      } catch (error) {
        console.error('Failed to load product data:', error);
      }
    });

    return {
      menu,
      activeTab,
      getBadgeClass,
      setActiveTab,
      addToCart
    };
  },
  template: `
    <div>
      <!-- Hero Section -->
      <div class="pizza-hat-hero text-center">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">Order Pizza Online</h1>
          <p class="lead mb-4">Delicious pizzas made with authentic Italian recipes, delivered to your door</p>
          <div class="d-flex justify-content-center gap-3">
            <router-link to="/cart" class="btn btn-danger btn-lg px-4">Go to Cart</router-link>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="container my-5">
        <div class="row">
          <!-- Menu Section -->
          <div class="col-lg-10 mx-auto">
            <div id="menu">
              <h2 class="mb-4 fw-bold">Our Menu</h2>
              
              <!-- Category Tabs -->
              <ul class="nav nav-pills mb-4 pizza-hat-nav-pills" id="menuTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    :class="{ 'active': activeTab === 'pizzas' }"
                    @click="setActiveTab('pizzas')"
                  >
                    <i class="bi bi-egg-fried me-1"></i> Pizzas
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    :class="{ 'active': activeTab === 'sides' }"
                    @click="setActiveTab('sides')"
                  >
                    <i class="bi bi-basket me-1"></i> Sides
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    :class="{ 'active': activeTab === 'drinks' }"
                    @click="setActiveTab('drinks')"
                  >
                    <i class="bi bi-cup-straw me-1"></i> Drinks
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    :class="{ 'active': activeTab === 'desserts' }"
                    @click="setActiveTab('desserts')"
                  >
                    <i class="bi bi-cake me-1"></i> Desserts
                  </button>
                </li>
              </ul>
              
              <!-- Tab Content -->
              <div class="tab-content" id="menuTabsContent">
                <!-- Pizzas Tab -->
                <div class="tab-pane fade" :class="{ 'show active': activeTab === 'pizzas' }">
                  <div class="row">
                    <div class="col-md-6 col-lg-4" v-for="item in menu.pizzas" :key="item.id">
                      <div class="card pizza-hat-food-card">
                        <img :src="item.img" class="card-img-top pizza-hat-food-img" :alt="item.name">
                        <div class="card-body d-flex flex-column">
                          <div class="d-flex justify-content-between align-items-start">
                            <h5 class="pizza-hat-food-title">{{ item.name }}</h5>
                            <div>
                              <span v-for="tag in item.tags" :key="tag" class="badge ms-1" :class="getBadgeClass(tag)">{{ tag }}</span>
                            </div>
                          </div>
                          <p class="pizza-hat-food-description">{{ item.desc }}</p>
                          <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="pizza-hat-food-price">\${{ item.price.toFixed(2) }}</span>
                            <button class="btn btn-sm btn-outline-danger ms-2" @click="addToCart(item)">
                              <i class="bi bi-cart-plus"></i> Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Sides Tab -->
                <div class="tab-pane fade" :class="{ 'show active': activeTab === 'sides' }">
                  <div class="row">
                    <div class="col-md-6 col-lg-4" v-for="item in menu.sides" :key="item.id">
                      <div class="card pizza-hat-food-card">
                        <img :src="item.img" class="card-img-top pizza-hat-food-img" :alt="item.name">
                        <div class="card-body d-flex flex-column">
                          <div class="d-flex justify-content-between align-items-start">
                            <h5 class="pizza-hat-food-title">{{ item.name }}</h5>
                            <div>
                              <span v-for="tag in item.tags" :key="tag" class="badge ms-1" :class="getBadgeClass(tag)">{{ tag }}</span>
                            </div>
                          </div>
                          <p class="pizza-hat-food-description">{{ item.desc }}</p>
                          <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="pizza-hat-food-price">\${{ item.price.toFixed(2) }}</span>
                            <button class="btn btn-sm btn-outline-danger ms-2" @click="addToCart(item)">
                              <i class="bi bi-cart-plus"></i> Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Drinks Tab -->
                <div class="tab-pane fade" :class="{ 'show active': activeTab === 'drinks' }">
                  <div class="row">
                    <div class="col-md-6 col-lg-4" v-for="item in menu.drinks" :key="item.id">
                      <div class="card pizza-hat-food-card">
                        <img :src="item.img" class="card-img-top pizza-hat-food-img" :alt="item.name">
                        <div class="card-body d-flex flex-column">
                          <div class="d-flex justify-content-between align-items-start">
                            <h5 class="pizza-hat-food-title">{{ item.name }}</h5>
                            <div>
                              <span v-for="tag in item.tags" :key="tag" class="badge ms-1" :class="getBadgeClass(tag)">{{ tag }}</span>
                            </div>
                          </div>
                          <p class="pizza-hat-food-description">{{ item.desc }}</p>
                          <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="pizza-hat-food-price">\${{ item.price.toFixed(2) }}</span>
                            <button class="btn btn-sm btn-outline-danger ms-2" @click="addToCart(item)">
                              <i class="bi bi-cart-plus"></i> Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Desserts Tab -->
                <div class="tab-pane fade" :class="{ 'show active': activeTab === 'desserts' }">
                  <div class="row">
                    <div class="col-md-6 col-lg-4" v-for="item in menu.desserts" :key="item.id">
                      <div class="card pizza-hat-food-card">
                        <img :src="item.img" class="card-img-top pizza-hat-food-img" :alt="item.name">
                        <div class="card-body d-flex flex-column">
                          <div class="d-flex justify-content-between align-items-start">
                            <h5 class="pizza-hat-food-title">{{ item.name }}</h5>
                            <div>
                              <span v-for="tag in item.tags" :key="tag" class="badge ms-1" :class="getBadgeClass(tag)">{{ tag }}</span>
                            </div>
                          </div>
                          <p class="pizza-hat-food-description">{{ item.desc }}</p>
                          <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="pizza-hat-food-price">\${{ item.price.toFixed(2) }}</span>
                            <button class="btn btn-sm btn-outline-danger ms-2" @click="addToCart(item)">
                              <i class="bi bi-cart-plus"></i> Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- End Menu Section -->
        </div>
      </div>
    </div>
  `
};
