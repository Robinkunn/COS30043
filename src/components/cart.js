// cart.js
window.Cart = {
  setup() {
    const { ref, computed } = Vue;

    // --- Reactive State ---
    const cartItems = ref([
      {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        price: 79.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop',
        inStock: true
      },
      {
        id: 2,
        name: 'Phone Case - Black',
        price: 24.98,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1587324104999-317133604dc1?w=80&h=80&fit=crop',
        inStock: true
      },
      {
        id: 3,
        name: 'USB-C Cable (3 pack)',
        price: 19.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1583863718228-56a86c639414?w=80&h=80&fit=crop',
        inStock: false
      }
    ]);

    // --- Computed Properties ---
    const subtotal = computed(() => {
      return cartItems.value.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    });

    const shipping = computed(() => {
      return subtotal.value > 50 ? 0 : 5.99;
    });

    const tax = computed(() => {
      return subtotal.value * 0.08;
    });

    const total = computed(() => {
      return subtotal.value + shipping.value + tax.value;
    });

    const itemCount = computed(() => {
      return cartItems.value.reduce((count, item) => {
        return count + item.quantity;
      }, 0);
    });

    // --- Methods ---
    const removeItem = (itemId) => {
      cartItems.value = cartItems.value.filter(item => item.id !== itemId);
    };

    const updateQuantity = (itemId, newQuantity) => {
      if (newQuantity < 1) return;
      const item = cartItems.value.find(item => item.id === itemId);
      if (item) item.quantity = newQuantity;
    };

    const formatCurrency = (value) => {
      return `$${value.toFixed(2)}`;
    };

    return {
      cartItems,
      subtotal,
      shipping,
      tax,
      total,
      itemCount,
      removeItem,
      updateQuantity,
      formatCurrency
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
                          <input type="number" class="form-control form-control-sm text-center" v-model.number="item.quantity" @change="updateQuantity(item.id, item.quantity)">
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
                <a href="#" class="btn btn-primary mt-3">Continue Shopping</a>
              </div>
            </div>
          </div>

          <!-- Continue Shopping -->
          <div class="d-flex justify-content-between">
            <a href="#" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-1"></i> Continue Shopping
            </a>
            <button class="btn btn-outline-danger" :disabled="cartItems.length === 0">
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
                <span>{{ shipping === 0 ? 'FREE' : formatCurrency(shipping) }}</span>
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
              
              <button class="btn btn-primary w-100 py-2" :disabled="cartItems.length === 0">
                Proceed to Checkout
              </button>
              
              <div class="mt-3 text-center">
                <small class="text-muted">
                  <i class="bi bi-lock-fill me-1"></i> Secure checkout
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};