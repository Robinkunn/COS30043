window.Product = {
  setup() {
    // Import necessary functions from Vue and VueRouter
    const { ref, reactive, computed, onMounted } = Vue;
    const { useRoute } = VueRouter;

    // --- State Management ---

    // All menu items are stored in a reactive object, categorized for easy rendering in tabs.
    const menu = reactive({
      pizzas: [
        { id: 1, name: 'Margherita', desc: 'Classic pizza with tomato sauce, mozzarella, and fresh basil', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591', price: 12.99, tags: ['Veg'] },
        { id: 2, name: 'Pepperoni', desc: 'Tomato sauce, mozzarella, and spicy pepperoni', img: 'https://images.unsplash.com/photo-1593504049359-74330189a345', price: 14.99, tags: ['Non-Veg'] },
        { id: 3, name: 'Veggie Delight', desc: 'Bell peppers, mushrooms, onions, olives, and mozzarella', img: 'https://images.unsplash.com/photo-1571066811602-716837d681de', price: 13.99, tags: ['Veg'] },
        { id: 4, name: 'BBQ Chicken', desc: 'BBQ sauce, chicken, red onions, and cilantro', img: 'https://images.unsplash.com/photo-1627626775846-122b778965ae', price: 15.99, tags: ['Non-Veg'] },
        { id: 5, name: 'Quattro Formaggi', desc: 'Four cheese blend with mozzarella, gorgonzola, parmesan, and provolone', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3', price: 16.99, tags: ['Veg'] },
        { id: 6, name: 'Diavola', desc: 'Spicy salami, tomato sauce, mozzarella, and chili flakes', img: 'https://images.unsplash.com/photo-1620374645498-af6bd681a0bd', price: 16.99, tags: ['Non-Veg', 'Spicy'] },
      ],
      sides: [
        { id: 7, name: 'Garlic Bread', desc: 'Freshly baked bread with garlic butter and herbs', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246', price: 5.99, tags: [] },
        { id: 8, name: 'Mozzarella Sticks', desc: 'Breaded mozzarella sticks with marinara sauce', img: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92', price: 7.99, tags: [] },
        { id: 9, name: 'Chicken Wings', desc: 'Crispy chicken wings with buffalo sauce', img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f', price: 9.99, tags: ['Spicy'] },
      ],
      drinks: [
        { id: 10, name: 'Soft Drink', desc: 'Coke, Diet Coke, Sprite, Fanta, or Dr. Pepper', img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7', price: 2.99, tags: [] },
        { id: 11, name: 'Iced Tea', desc: 'Freshly brewed sweet or unsweetened iced tea', img: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256', price: 3.49, tags: [] },
        { id: 12, name: 'Italian Soda', desc: 'Carbonated water with flavored syrup', img: 'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9', price: 4.99, tags: [] },
      ],
      desserts: [
        { id: 13, name: 'Tiramisu', desc: 'Classic Italian dessert with coffee-soaked ladyfingers', img: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9', price: 6.99, tags: [] },
        { id: 14, name: 'Cannoli', desc: 'Crispy pastry shells filled with sweet ricotta', img: 'https://images.unsplash.com/photo-1614707267531-bc4533845b32', price: 5.99, tags: [] },
        { id: 15, name: 'Chocolate Lava Cake', desc: 'Warm chocolate cake with a molten center', img: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e', price: 7.99, tags: [] },
      ]
    });

    // The shopping cart is a reactive array of items.
    const cart = ref([]);
    const deliveryFee = 2.99;

    // --- Computed Properties ---

    // Automatically recalculates when the cart changes.
    const cartSubtotal = computed(() => {
      return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0);
    });

    const cartTotal = computed(() => {
      return cartSubtotal.value + deliveryFee;
    });

    const isCartEmpty = computed(() => cart.value.length === 0);

    // --- Methods ---

    const formatCurrency = (value) => {
      return `$${value.toFixed(2)}`;
    };

    const addToCart = (product) => {
      const existingItem = cart.value.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.value.push({ ...product, quantity: 1 });
      }
    };

    const removeFromCart = (productId) => {
      cart.value = cart.value.filter(item => item.id !== productId);
    };

    const updateQuantity = (productId, amount) => {
      const item = cart.value.find(item => item.id === productId);
      if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
          removeFromCart(productId);
        }
      }
    };
    
    const getBadgeClass = (tag) => {
        switch(tag) {
            case 'Veg': return 'pizza-hat-badge-veg';
            case 'Non-Veg': return 'bg-danger';
            case 'Spicy': return 'pizza-hat-badge-spicy';
            default: return 'bg-secondary';
        }
    };

    // --- Lifecycle Hooks ---
    onMounted(() => {
      // Access the current route to check for a hash.
      const route = useRoute();
      const hash = route.hash;

      // If a hash exists (e.g., /products#sides), activate the corresponding tab.
      if (hash) {
        const tabEl = document.querySelector(`button[data-bs-target="${hash}"]`);
        if (tabEl) {
          const tab = new bootstrap.Tab(tabEl);
          tab.show();
        }
      }
    });

    return {
      menu,
      cart,
      deliveryFee,
      cartSubtotal,
      cartTotal,
      isCartEmpty,
      addToCart,
      removeFromCart,
      updateQuantity,
      formatCurrency,
      getBadgeClass
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
            <a href="#menu" class="btn btn-danger btn-lg px-4">View Menu</a>
            <a href="#cart" class="btn btn-outline-light btn-lg px-4">Your Cart</a>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="container my-5">
        <div class="row">
          <!-- Menu Section -->
          <div class="col-lg-8">
            <div id="menu">
              <h2 class="mb-4 fw-bold">Our Menu</h2>
              
              <!-- Category Tabs -->
              <ul class="nav nav-pills mb-4 pizza-hat-nav-pills" id="menuTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="pizzas-tab" data-bs-toggle="pill" data-bs-target="#pizzas" type="button" role="tab">
                    <i class="bi bi-egg-fried me-1"></i> Pizzas
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="sides-tab" data-bs-toggle="pill" data-bs-target="#sides" type="button" role="tab">
                    <i class="bi bi-basket me-1"></i> Sides
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="drinks-tab" data-bs-toggle="pill" data-bs-target="#drinks" type="button" role="tab">
                    <i class="bi bi-cup-straw me-1"></i> Drinks
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="desserts-tab" data-bs-toggle="pill" data-bs-target="#desserts" type="button" role="tab">
                    <i class="bi bi-cake me-1"></i> Desserts
                  </button>
                </li>
              </ul>
              
              <!-- Tab Content -->
              <div class="tab-content" id="menuTabsContent">
                <!-- Loop through each category in the menu object -->
                <div v-for="(items, category, index) in menu" :key="category" 
                     :class="['tab-pane', 'fade', { 'show active': index === 0 }]" 
                     :id="category" role="tabpanel">
                  <div class="row">
                    <!-- Loop through each item in the category -->
                    <div class="col-md-6 col-lg-4" v-for="item in items" :key="item.id">
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
                            <span class="pizza-hat-food-price">{{ formatCurrency(item.price) }}</span>
                            <button class="btn btn-sm btn-outline-danger" @click="addToCart(item)">Add to Cart</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Cart Section -->
          <div class="col-lg-4">
            <div id="cart" class="pizza-hat-cart-summary">
              <h3 class="mb-4 fw-bold">Your Order</h3>
              
              <!-- Empty Cart State -->
              <div v-if="isCartEmpty" class="pizza-hat-empty-cart text-center mb-4">
                <i class="bi bi-cart-x text-danger" style="font-size: 2.5rem;"></i>
                <h5 class="mt-3">Your cart is empty</h5>
                <p class="mb-0 text-muted">Add some delicious items to get started!</p>
              </div>
              
              <!-- Cart Items (shown when not empty) -->
              <div v-else>
                <div class="cart-items">
                  <div v-for="item in cart" :key="item.id" class="pizza-hat-cart-item">
                    <div class="d-flex justify-content-between">
                      <div>
                        <h6 class="mb-1">{{ item.name }}</h6>
                      </div>
                      <span>{{ formatCurrency(item.price * item.quantity) }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                      <div class="input-group pizza-hat-quantity-control">
                        <button class="btn btn-outline-secondary" type="button" @click="updateQuantity(item.id, -1)">-</button>
                        <input type="text" class="form-control text-center" :value="item.quantity" readonly>
                        <button class="btn btn-outline-secondary" type="button" @click="updateQuantity(item.id, 1)">+</button>
                      </div>
                      <button class="btn btn-sm btn-outline-danger" @click="removeFromCart(item.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <hr>
                
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Subtotal:</span>
                  <span>{{ formatCurrency(cartSubtotal) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Delivery Fee:</span>
                  <span>{{ formatCurrency(deliveryFee) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-3 fw-bold fs-5">
                  <span>Total:</span>
                  <span>{{ formatCurrency(cartTotal) }}</span>
                </div>
                
                <div class="d-grid gap-2">
                  <button class="btn btn-danger">Proceed to Checkout</button>
                  <a href="#menu" class="btn btn-outline-secondary">Continue Shopping</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};