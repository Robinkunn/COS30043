window.Cart = {
  setup() {
    const { ref, computed, onMounted } = Vue;
    const router = VueRouter.useRouter();
    const route = VueRouter.useRoute();

    // --- State ---
    const cartItems = ref([]);
    const cartId = ref(null);
    const isLoading = ref(true);
    const selectedItems = ref([]); // New state for selected items

    // --- Computed Properties for Edit Mode ---
    const pageTitle = computed(() => 'Your Shopping Cart');
    const submitButtonText = computed(() => 'Proceed to Purchase');

    // --- Core API Interaction ---
    const fetchCart = async () => {
      isLoading.value = true;
      const user = JSON.parse(sessionStorage.getItem('user') || sessionStorage.getItem('loggedInUser') || 'null');

      if (!user || !user.id) {
        cartItems.value = [];
        isLoading.value = false;
        return;
      }

      try {
        // const response = await fetch(`api_carts.php?user_id=${user.id}`);
        const response = await fetch(`https://us-central1-pizzahat.cloudfunctions.net/proxyAPI/api_carts?user_id=${user.id}`);
        const data = await response.json();

        if (data.success && data.cart) {
          cartId.value = data.cart.id;
          cartItems.value = data.cart.items.map(item => ({
            id: item.product_id,
            cart_item_id: item.id,
            name: item.product_name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10),
            image: item.img,
            inStock: true
          }));
          // Initialize with all items selected by default
          selectedItems.value = cartItems.value.map(item => item.cart_item_id);
        } else {
          console.error("Failed to fetch cart:", data.message);
          cartItems.value = [];
          selectedItems.value = [];
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        cartItems.value = [];
        selectedItems.value = [];
        alert("Could not load your cart. Please try again later.");
      } finally {
        isLoading.value = false;
      }
    };

    // --- Computed Properties for Totals ---
    const subtotal = computed(() => 
      cartItems.value.reduce((total, item) => 
        selectedItems.value.includes(item.cart_item_id) ? total + (item.price * item.quantity) : total, 0)
    );
    const shipping = computed(() => selectedItems.value.length > 0 ? 5.00 : 0);
    const tax = computed(() => subtotal.value * 0.08);
    const total = computed(() => subtotal.value + shipping.value + tax.value);
    const itemCount = computed(() => 
      cartItems.value.reduce((count, item) => 
        selectedItems.value.includes(item.cart_item_id) ? count + item.quantity : count, 0)
    );

    // --- Methods ---
    const removeItem = async (cartItemId) => {
      if (!confirm('Are you sure you want to remove this item?')) return;
      try {
        // const response = await fetch('api_cart_items.php', {
        const response = await fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI/api_cart_items', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cartItemId })
        });
        const data = await response.json();
        if (data.success) {
          await fetchCart(); // Refresh cart from server
          // Remove from selected items if it was there
          selectedItems.value = selectedItems.value.filter(id => id !== cartItemId);
        } else {
          alert(`Failed to remove item: ${data.message}`);
        }
      } catch (error) {
        console.error("Error removing item:", error);
        alert("An error occurred while removing the item.");
      }
    };

    const updateQuantity = async (cartItemId, newQuantity) => {
      const quantity = parseInt(newQuantity, 10);
      if (isNaN(quantity)) return;

      if (quantity < 1) {
        removeItem(cartItemId);
        return;
      }

      try {
        // const response = await fetch('api_cart_items.php', {
        const response = await fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI/api_cart_items', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cartItemId, quantity: quantity })
        });
        const data = await response.json();
        if (data.success) {
          await fetchCart(); // Refresh cart from server
        } else {
          alert(`Failed to update quantity: ${data.message}`);
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        alert("An error occurred while updating the quantity.");
      }
    };

    const toggleItemSelection = (cartItemId) => {
      const index = selectedItems.value.indexOf(cartItemId);
      if (index === -1) {
        selectedItems.value.push(cartItemId);
      } else {
        selectedItems.value.splice(index, 1);
      }
    };

    const clearCart = async () => {
      if (!confirm('Are you sure you want to clear your cart?')) return;
      
      const user = JSON.parse(sessionStorage.getItem('user') || sessionStorage.getItem('loggedInUser') || 'null');
      if (!user || !user.id) return;

      try {
        // const response = await fetch('api_carts.php', {
        const response = await fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI/api_carts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
        const data = await response.json();
        if (data.success) {
          cartItems.value = [];
          selectedItems.value = [];
        } else {
          alert(`Failed to clear cart: ${data.message}`);
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
        alert("An error occurred while clearing the cart.");
      }
    };
    
    const formatCurrency = (value) => `RM${value.toFixed(2)}`;

    // Only createOrder remains
    const createOrder = async () => {
      if (selectedItems.value.length === 0) {
        alert('Please select at least one item to proceed with your purchase.');
        return;
      }
      if (!confirm('Are you sure you want to proceed with your purchase?')) return;
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user.id) {
        alert('You must be logged in to make a purchase.');
        return;
      }

      // Only include selected items in the order
      const selectedCartItems = cartItems.value.filter(item => selectedItems.value.includes(item.cart_item_id));
      
      const orderPayload = {
        user_id: user.id,
        items: selectedCartItems.map(item => ({
          product_id: item.id, 
          product_name: item.name, 
          price: item.price, 
          quantity: item.quantity, 
          img: item.image
        })),
        total_amount: total.value, 
        shipping: shipping.value, 
        tax: tax.value
      };
      
      // const orderRes = await fetch('api_orders.php', { 
      const orderRes = await fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI/api_orders', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(orderPayload) 
      });
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        alert(orderData.message || 'Failed to create order.');
        return;
      }
      
      const orderId = orderData.order_id;
      const itemsPayload = { order_id: orderId, items: orderPayload.items };
      // const itemsRes = await fetch('api_order_items.php', { 
      const itemsRes = await fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI/api_order_items', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(itemsPayload) 
      });
      const itemsData = await itemsRes.json();
      
      if (!itemsData.success) {
        alert(itemsData.message || 'Failed to save order items.');
        return;
      }
      
      // Remove only the purchased items from the cart
      try {
        // Delete all selected items from cart
        const deletePromises = selectedItems.value.map(cartItemId => 
          // fetch('api_cart_items.php', {
          fetch('https://us-central1-pizzahat.cloudfunctions.net/proxyAPI/api_cart_items', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: cartItemId })
          })
        );
        
        await Promise.all(deletePromises);
        await fetchCart(); // Refresh cart from server
        selectedItems.value = []; // Clear selection
      } catch (error) {
        console.error("Error removing purchased items from cart:", error);
        // Don't show error to user since order was already created
      }
      
      alert('Thank you for your purchase! Your order has been placed.');
      router.push('/my_purchase');
    };

    // --- Lifecycle Hook ---
    onMounted(() => {
      fetchCart();
    });

    return {
      cartItems, selectedItems, subtotal, shipping, tax, total, itemCount, isLoading,
      removeItem, updateQuantity, toggleItemSelection, clearCart, formatCurrency,
      proceedToPurchase: createOrder
    };
  },
  template: `
    <div class="container my-5">
        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-danger" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading your cart...</p>
        </div>
        <div v-else class="row">
            <div class="col-lg-8">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="fw-bold"><i class="bi bi-cart3 me-2"></i>Your Shopping Cart</h2>
                    <span class="text-muted">{{ itemCount }} items</span>
                </div>
                <div class="card shadow-sm mb-4">
                    <div class="card-body p-0">
                        <div v-if="cartItems.length > 0">
                            <div class="p-3 border-bottom d-none d-md-flex bg-light">
                                <div class="col-md-1"><strong>Select</strong></div>
                                <div class="col-md-5"><strong>Product</strong></div>
                                <div class="col-md-2 text-center"><strong>Price</strong></div>
                                <div class="col-md-2 text-center"><strong>Quantity</strong></div>
                                <div class="col-md-2 text-end"><strong>Total</strong></div>
                            </div>
                            <div class="p-3 border-bottom" v-for="item in cartItems" :key="item.cart_item_id">
                                <div class="row align-items-center">
                                    <div class="col-md-1 mb-3 mb-md-0">
                                        <div class="form-check">
                                            <input 
                                              class="form-check-input" 
                                              type="checkbox" 
                                              :id="'item-' + item.cart_item_id"
                                              :checked="selectedItems.includes(item.cart_item_id)"
                                              @change="toggleItemSelection(item.cart_item_id)"
                                            >
                                        </div>
                                    </div>
                                    <div class="col-md-5 mb-3 mb-md-0">
                                        <div class="d-flex align-items-center">
                                            <img :src="item.image" :alt="item.name" class="img-thumbnail me-3" style="width: 80px; height: 80px; object-fit: cover;">
                                            <div>
                                                <h6 class="mb-1">{{ item.name }}</h6>
                                                <div class="d-flex align-items-center">
                                                    <span v-if="item.inStock" class="badge bg-success me-2">In Stock</span>
                                                    <span v-else class="badge bg-danger me-2">Out of Stock</span>
                                                    <button @click="removeItem(item.cart_item_id)" class="btn btn-link p-0 text-danger">
                                                        <small><i class="bi bi-trash me-1"></i>Remove</small>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-2 text-center mb-3 mb-md-0">
                                        <span class="d-md-none text-muted">Price: </span>
                                        {{ formatCurrency(item.price) }}
                                    </div>
                                    <div class="col-md-2 mb-3 mb-md-0">
                                        <div class="d-flex justify-content-center">
                                            <div class="input-group" style="max-width: 120px;">
                                                <button class="btn btn-outline-secondary btn-sm" @click="updateQuantity(item.cart_item_id, item.quantity - 1)">-</button>
                                                <input type="number" class="form-control form-control-sm text-center" :value="item.quantity" @change="updateQuantity(item.cart_item_id, $event.target.value)">
                                                <button class="btn btn-outline-secondary btn-sm" @click="updateQuantity(item.cart_item_id, item.quantity + 1)">+</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <span class="d-md-none text-muted">Total: </span>
                                        <strong>{{ formatCurrency(item.price * item.quantity) }}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-5">
                            <i class="bi bi-cart-x" style="font-size: 3rem; color: #6c757d;"></i>
                            <h4 class="mt-3">Your cart is empty</h4>
                            <p class="text-muted">Looks like you haven't added any items to your cart yet.</p>
                            <router-link to="/product" class="btn btn-primary mt-3">Continue Shopping</router-link>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between">
                    <router-link to="/product" class="btn btn-outline-secondary">
                        <i class="bi bi-arrow-left me-1"></i> Continue Shopping
                    </router-link>
                    <button class="btn btn-outline-danger" @click="clearCart" :disabled="cartItems.length === 0">
                        <i class="bi bi-trash me-1"></i> Clear Cart
                    </button>
                </div>
            </div>
            <div class="col-lg-4 mt-4 mt-lg-0">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title mb-4">Order Summary</h5>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">Subtotal ({{ selectedItems.length }} items)</span>
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
                            :disabled="selectedItems.length === 0"
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