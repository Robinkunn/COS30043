window.Product = {
  setup() {
    const { ref, reactive, onMounted, computed } = Vue;

    const menu = reactive({
      pizzas: [],
      sides: [],
      drinks: [],
      desserts: []
    });

    const activeTab = ref('all');
    const currentPage = ref(1);
    const itemsPerPage = ref(6);
    const searchQuery = ref('');
    const priceRange = ref([0, 50]);
    const selectedTags = ref([]);
    const sortOption = ref('default');

    const allTags = computed(() => {
      const tags = new Set();
      Object.values(menu).forEach(category => {
        category.forEach(item => {
          item.tags.forEach(tag => tags.add(tag));
        });
      });
      return Array.from(tags);
    });

    const filteredItems = computed(() => {
      let items = [];
      if (activeTab.value === 'all') {
        items = [...menu.pizzas, ...menu.sides, ...menu.drinks, ...menu.desserts];
      } else {
        items = [...menu[activeTab.value]];
      }

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.desc.toLowerCase().includes(query)
        );
      }

      // Apply price filter
      items = items.filter(item => 
        item.price >= priceRange.value[0] && 
        item.price <= priceRange.value[1]
      );

      // Apply tag filter
      if (selectedTags.value.length > 0) {
        items = items.filter(item => 
          selectedTags.value.some(tag => item.tags.includes(tag))
        );
      }

      // Apply sorting
      switch(sortOption.value) {
        case 'price-asc':
          items.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          items.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          items.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          // Default sorting (original order)
          break;
      }

      return items;
    });

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredItems.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredItems.value.length / itemsPerPage.value);
    });

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
      currentPage.value = 1; // Reset to first page when changing tabs
    };

    const addToCart = (item) => {
      // Check if user is logged in
      const user = JSON.parse(sessionStorage.getItem('user') || sessionStorage.getItem('loggedInUser') || 'null');
      if (!user || !user.id) {
        if (confirm('You must login first to add items to your cart.\n\nGo to login page?')) {
          // Use Vue Router to navigate
          window.location.hash = '#/authentication';
          // Or, if you have access to the router instance:
          // router.push('/authentication');
        }
        return;
      }

      // Get the current cart from sessionStorage, or create an empty array if it doesn't exist
      let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

      // Check if the item is already in the cart
      const existingItem = cart.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        // If it exists, just increase the quantity
        existingItem.quantity++;
      } else {
        // If it's a new item, add it to the cart with quantity 1
        cart.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.img,
          inStock: true
        });
      }

      // Save the updated cart back to sessionStorage
      sessionStorage.setItem('cart', JSON.stringify(cart));

      // Notify the user
      alert(`${item.name} has been added to your cart.`);
    };

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const toggleTag = (tag) => {
      const index = selectedTags.value.indexOf(tag);
      if (index === -1) {
        selectedTags.value.push(tag);
      } else {
        selectedTags.value.splice(index, 1);
      }
      currentPage.value = 1; // Reset to first page when changing filters
    };

    onMounted(async () => {
      try {
        const response = await fetch('products.json');
        const data = await response.json();
        Object.assign(menu, data);
        
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Set max price for range slider
        const allItems = [...data.pizzas, ...data.sides, ...data.drinks, ...data.desserts];
        const maxPrice = Math.max(...allItems.map(item => item.price));
        priceRange.value[1] = Math.ceil(maxPrice);
      } catch (error) {
        console.error('Failed to load product data:', error);
      }
    });

    return {
      menu,
      activeTab,
      currentPage,
      itemsPerPage,
      searchQuery,
      priceRange,
      selectedTags,
      sortOption,
      allTags,
      filteredItems,
      paginatedItems,
      totalPages,
      getBadgeClass,
      setActiveTab,
      addToCart,
      changePage,
      toggleTag
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
          <!-- Filters Sidebar -->
          <div class="col-lg-3 mb-4">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="card-title mb-4">Filters</h5>
                
                <!-- Search Filter -->
                <div class="mb-4">
                  <label for="searchInput" class="form-label">Search</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="searchInput" 
                    placeholder="Search products..."
                    v-model="searchQuery"
                  >
                </div>
                
                <!-- Price Range Filter removed -->
                
                <!-- Tags Filter -->
                <div class="mb-4">
                  <label class="form-label">Tags</label>
                  <div class="d-flex flex-wrap gap-2">
                    <button 
                      v-for="tag in allTags" 
                      :key="tag"
                      class="btn btn-sm" 
                      :class="{
                        'btn-danger': selectedTags.includes(tag),
                        'btn-outline-secondary': !selectedTags.includes(tag)
                      }"
                      @click="toggleTag(tag)"
                    >
                      {{ tag }}
                    </button>
                  </div>
                </div>
                
                <!-- Sorting Options -->
                <div class="mb-3">
                  <label for="sortSelect" class="form-label">Sort By</label>
                  <select class="form-select" id="sortSelect" v-model="sortOption">
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>
                
                <!-- Results Count -->
                <div class="text-muted small mt-4">
                  Showing {{ paginatedItems.length }} of {{ filteredItems.length }} items
                </div>
              </div>
            </div>
          </div>
          
          <!-- Menu Section -->
          <div class="col-lg-9">
            <div id="menu">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold mb-0">Our Menu</h2>
                <div class="d-flex align-items-center">
                  <span class="me-2">Items per page:</span>
                  <select class="form-select form-select-sm w-auto" v-model="itemsPerPage">
                    <option value="6">6</option>
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="48">48</option>
                  </select>
                </div>
              </div>
              
              <!-- Category Tabs -->
              <ul class="nav nav-pills mb-4 pizza-hat-nav-pills" id="menuTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link" 
                    :class="{ 'active': activeTab === 'all' }"
                    @click="setActiveTab('all')"
                  >
                    <i class="bi bi-list-ul me-1"></i> All
                  </button>
                </li>  
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
                    <i class="bi bi-heart-fill  me-1"></i> Desserts
                  </button>
                </li>
              </ul>
              
              <!-- Products Grid -->
              <div class="row">
                <template v-if="paginatedItems.length > 0">
                  <div 
                    class="col-md-6 col-lg-4 mb-4" 
                    v-for="item in paginatedItems" 
                    :key="item.id + '-' + item.name"
                  >
                    <div class="card pizza-hat-food-card h-100">
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
                          <span class="pizza-hat-food-price">\RM{{ item.price.toFixed(2) }}</span>
                          <button 
                            class="btn btn-sm btn-outline-danger ms-2" 
                            @click="addToCart(item)"
                            data-bs-toggle="tooltip" 
                            title="Add to cart"
                          >
                            <i class="bi bi-cart-plus"></i> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="col-12 text-center py-5">
                    <h4 class="text-muted">No products found matching your criteria</h4>
                    <button class="btn btn-link" @click="() => {
                      searchQuery = '';
                      priceRange = [0, Math.max(...priceRange)];
                      selectedTags = [];
                      sortOption = 'default';
                    }">
                      Reset filters
                    </button>
                  </div>
                </template>
              </div>
              
              <!-- Pagination -->
              <nav v-if="totalPages > 1" aria-label="Page navigation">
                <ul class="pagination justify-content-center mt-4">
                  <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
                  </li>
                  
                  <template v-for="page in totalPages" :key="page">
                    <li class="page-item" :class="{ 'active': page === currentPage }">
                      <button class="page-link" @click="changePage(page)">{{ page }}</button>
                    </li>
                  </template>
                  
                  <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
                    <button class="page-link" @click="changePage(currentPage + 1)">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};