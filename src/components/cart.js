// cart.js
window.Cart = {
  setup() {
    const { ref, computed, onMounted } = Vue;
    const router = VueRouter.useRouter();

    // --- Reactive State ---
    // The cartItems are now loaded from sessionStorage instead of being hardcoded.
    const cartItems = ref([]);

    // --- Helper Functions to manage sessionStorage ---
    const saveCart = () => {
      sessionStorage.setItem('cart', JSON.stringify(cartItems.value));
    };

    const loadCart = () => {
      const savedCart = sessionStorage.getItem('cart');
      if (savedCart) {
        cartItems.value = JSON.parse(savedCart);
      }
    };
    
    // --- Computed Properties ---
    const subtotal = computed(() => {
      return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
    });

    const shipping = computed(() => {
      // Set fixed shipping fee to RM5, free if cart is empty.
      return cartItems.value.length > 0 ? 5.00 : 0;
    });

    const tax = computed(() => {
      return subtotal.value * 0.08;
    });

    const total = computed(() => {
      return subtotal.value + shipping.value + tax.value;
    });

    const itemCount = computed(() => {
      return cartItems.value.reduce((count, item) => count + item.quantity, 0);
    });

    // --- Methods ---
    const removeItem = (itemId) => {
      cartItems.value = cartItems.value.filter(item => item.id !== itemId);
      saveCart(); // Save changes to sessionStorage
    };

    const updateQuantity = (itemId, newQuantity) => {
      const item = cartItems.value.find(item => item.id === itemId);
      if (item) {
        if (newQuantity < 1) {
          // If quantity goes below 1, remove the item
          removeItem(itemId);
        } else {
          item.quantity = newQuantity;
          saveCart(); // Save changes to sessionStorage
        }
      }
    };

    const clearCart = () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        cartItems.value = [];
        saveCart(); // Save changes to sessionStorage
      }
    };

    const formatCurrency = (value) => {
      // Format currency as RM
      return `RM${value.toFixed(2)}`;
    };
    
    const proceedToPurchase = () => {
      if (confirm('Are you sure you want to proceed with your purchase?')) {
        cartItems.value = [];
        saveCart();
        router.push('/my_purchase');
      }
    };

    // --- Lifecycle Hook ---
    // Load the cart from sessionStorage when the component is mounted
    onMounted(() => {
      loadCart();
    });

    return {
      cartItems,
      subtotal,
      shipping,
      tax,
      total,
      itemCount,
      removeItem,
      updateQuantity,
      clearCart,
      formatCurrency,
      proceedToPurchase // Expose the new function
    };
  },
  template: `
    <div class="container my-5">
      <div class="row">
        <div class="col-lg-8">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold"><i class="bi bi-cart3 me-2"></i>Your Shopping Cart</h2>
            <span class="text-muted">{{ itemCount }} items</span>
          </div>

          <!-- Cart Items -->
          <div class="card shadow-sm mb-4">
            <div class="card-body p-0">
              <div v-if="cartItems.length > 0">
                <div class="p-3 border-bottom d-none d-md-flex bg-light">
                  <div class="col-md-6"><strong>Product</strong></div>
                  <div class="col-md-2 text-center"><strong>Price</strong></div>
                  <div class="col-md-2 text-center"><strong>Quantity</strong></div>
                  <div class="col-md-2 text-end"><strong>Total</strong></div>
                </div>

                <!-- Cart Item -->
                <div class="p-3 border-bottom" v-for="item in cartItems" :key="item.id">
                  <div class="row align-items-center">
                    <!-- Product Image & Name -->
                    <div class="col-md-6 mb-3 mb-md-0">
                      <div class="d-flex align-items-center">
                        <img :src="item.image" :alt="item.name" class="img-thumbnail me-3" style="width: 80px; height: 80px; object-fit: cover;">
                        <div>
                          <h6 class="mb-1">{{ item.name }}</h6>
                          <div class="d-flex align-items-center">
                            <span v-if="item.inStock" class="badge bg-success me-2">In Stock</span>
                            <span v-else class="badge bg-danger me-2">Out of Stock</span>
                            <button @click="removeItem(item.id)" class="btn btn-link p-0 text-danger">
                              <small><i class="bi bi-trash me-1"></i>Remove</small>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Price -->
                    <div class="col-md-2 text-center mb-3 mb-md-0">
                      <span class="d-md-none text-muted">Price: </span>
                      {{ formatCurrency(item.price) }}
                    </div>

                    <!-- Quantity -->
                    <div class="col-md-2 mb-3 mb-md-0">
                      <div class="d-flex justify-content-center">
                        <div class="input-group" style="max-width: 120px;">
                          <button class="btn btn-outline-secondary btn-sm" @click="updateQuantity(item.id, item.quantity - 1)">-</button>
                          <input type="number" class="form-control form-control-sm text-center" :value="item.quantity" @change="updateQuantity(item.id, parseInt($event.target.value))">
                          <button class="btn btn-outline-secondary btn-sm" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
                        </div>
                      </div>
                    </div>

                    <!-- Total -->
                    <div class="col-md-2 text-end">
                      <span class="d-md-none text-muted">Total: </span>
                      <strong>{{ formatCurrency(item.price * item.quantity) }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty Cart -->
              <div v-else class="text-center py-5">
                <i class="bi bi-cart-x" style="font-size: 3rem; color: #6c757d;"></i>
                <h4 class="mt-3">Your cart is empty</h4>
                <p class="text-muted">Looks like you haven't added any items to your cart yet.</p>
                <router-link to="/product" class="btn btn-primary mt-3">Continue Shopping</router-link>
              </div>
            </div>
          </div>

          <!-- Continue Shopping -->
          <div class="d-flex justify-content-between">
            <router-link to="/product" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-1"></i> Continue Shopping
            </router-link>
            <button class="btn btn-outline-danger" @click="clearCart" :disabled="cartItems.length === 0">
              <i class="bi bi-trash me-1"></i> Clear Cart
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4 mt-4 mt-lg-0">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Order Summary</h5>
              
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Subtotal</span>
                <span>{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Shipping</span>
                <span>{{ shipping > 0 ? formatCurrency(shipping) : 'FREE' }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted">Tax (8%)</span>
                <span>{{ formatCurrency(tax) }}</span>
              </div>
              
              <hr>
              
              <div class="d-flex justify-content-between mb-3">
                <span><strong>Total</strong></span>
                <span><strong>{{ formatCurrency(total) }}</strong></span>
              </div>
              
              <button 
                class="btn btn-primary w-100 py-2" 
                :disabled="cartItems.length === 0"
                @click="proceedToPurchase"
              >
                Proceed to Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};