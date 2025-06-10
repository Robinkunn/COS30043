// cart.js
window.Cart = {
  setup() {
    const { ref, computed, onMounted } = Vue;
    const router = VueRouter.useRouter();
    const route = VueRouter.useRoute();

    // --- State ---
    const cartItems = ref([]);
    const editingOrderId = ref(null);

    // --- Computed Properties for Edit Mode ---
    const isEditing = computed(() => !!editingOrderId.value);
    const pageTitle = computed(() => isEditing.value ? `Edit Order #${editingOrderId.value}` : 'Your Shopping Cart');
    const submitButtonText = computed(() => isEditing.value ? 'Update Order' : 'Proceed to Purchase');

    // --- Helper Functions to manage sessionStorage ---
    const saveCart = () => {
      if (!isEditing.value) {
        sessionStorage.setItem('cart', JSON.stringify(cartItems.value));
      }
    };

    const loadCart = () => {
      const savedCart = sessionStorage.getItem('cart');
      if (savedCart) {
        cartItems.value = JSON.parse(savedCart);
      }
    };

    // --- Computed Properties for Totals ---
    const subtotal = computed(() => cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0));
    const shipping = computed(() => cartItems.value.length > 0 ? 5.00 : 0);
    const tax = computed(() => subtotal.value * 0.08);
    const total = computed(() => subtotal.value + shipping.value + tax.value);
    const itemCount = computed(() => cartItems.value.reduce((count, item) => count + item.quantity, 0));

    // --- Methods ---
    const removeItem = (itemId) => {
      cartItems.value = cartItems.value.filter(item => item.id !== itemId);
      saveCart();
    };

    const updateQuantity = (itemId, newQuantity) => {
      const item = cartItems.value.find(item => item.id === itemId);
      if (item) {
        if (newQuantity < 1) {
          removeItem(itemId);
        } else {
          item.quantity = newQuantity;
          saveCart();
        }
      }
    };

    const clearCart = () => {
      if (isEditing.value) {
        if (confirm('Are you sure you want to cancel editing? Your changes will be lost.')) {
          router.push('/my_purchase');
        }
        return;
      }
      if (confirm('Are you sure you want to clear your cart?')) {
        cartItems.value = [];
        saveCart();
      }
    };

    const formatCurrency = (value) => `RM${value.toFixed(2)}`;

    // Handles both creating and updating an order
    const proceedToPurchase = async () => {
      if (cartItems.value.length === 0) return;
      if (isEditing.value) {
        await updateOrder();
      } else {
        await createOrder();
      }
    };

    const updateOrder = async () => {
      if (!confirm('Are you sure you want to update this order?')) return;

      const updatePayload = {
        order_id: editingOrderId.value,
        items: cartItems.value.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          product_name: item.name,
          img: item.image
        })),
        total_amount: total.value,
        shipping: shipping.value,
        tax: tax.value
      };

      // Update order (main order table)
      const res = await fetch('api_orders.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();

      // Update order items (order_items table)
      const itemsRes = await fetch('api_order_items.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: editingOrderId.value,
          items: updatePayload.items
        })
      });
      const itemsData = await itemsRes.json();

      if (data.success && itemsData.success) {
        alert('Order updated successfully!');
        router.push('/my_purchase');
      } else {
        alert((data.message || itemsData.message) || 'Failed to update order.');
      }
    };

    const createOrder = async () => {
      if (!confirm('Are you sure you want to proceed with your purchase?')) return;
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user.id) {
        alert('You must be logged in to make a purchase.');
        return;
      }
      const orderPayload = {
        user_id: user.id,
        items: cartItems.value.map(item => ({
          product_id: item.id, product_name: item.name, price: item.price, quantity: item.quantity, img: item.image
        })),
        total_amount: total.value, shipping: shipping.value, tax: tax.value
      };
      const orderRes = await fetch('api_orders.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        alert(orderData.message || 'Failed to create order.');
        return;
      }
      const orderId = orderData.order_id;
      const itemsPayload = { order_id: orderId, items: orderPayload.items };
      const itemsRes = await fetch('api_order_items.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemsPayload) });
      const itemsData = await itemsRes.json();
      if (!itemsData.success) {
        alert(itemsData.message || 'Failed to save order items.');
        return;
      }
      cartItems.value = [];
      saveCart();
      alert('Thank you for your purchase! Your order has been placed.');
      router.push('/my_purchase');
    };

    // --- Lifecycle Hook ---
    onMounted(() => {
      if (route.params.orderId) {
        editingOrderId.value = route.params.orderId;
        const orderToEdit = JSON.parse(sessionStorage.getItem('editingOrder'));
        if (orderToEdit && orderToEdit.id == editingOrderId.value) {
          cartItems.value = orderToEdit.products.map(p => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price),
            quantity: parseInt(p.qty, 10),
            image: p.img,
            inStock: true
          }));
        } else {
          alert("Error: Could not find the order to edit.");
          router.push('/my_purchase');
        }
        sessionStorage.removeItem('editingOrder');
      } else {
        loadCart();
      }
    });

    return {
      cartItems, subtotal, shipping, tax, total, itemCount,
      removeItem, updateQuantity, clearCart, formatCurrency, proceedToPurchase,
      isEditing, pageTitle, submitButtonText
    };
  },
  template: `
    <div class="container my-5">
      <div class="row">
        <div class="col-lg-8">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold"><i class="bi me-2" :class="isEditing ? 'bi-pencil-square' : 'bi-cart3'"></i>{{ pageTitle }}</h2>
            <span class="text-muted">{{ itemCount }} items</span>
          </div>
          <div class="card shadow-sm mb-4">
            <div class="card-body p-0">
              <div v-if="cartItems.length > 0">
                <div class="p-3 border-bottom d-none d-md-flex bg-light">
                  <div class="col-md-6"><strong>Product</strong></div>
                  <div class="col-md-2 text-center"><strong>Price</strong></div>
                  <div class="col-md-2 text-center"><strong>Quantity</strong></div>
                  <div class="col-md-2 text-end"><strong>Total</strong></div>
                </div>
                <div class="p-3 border-bottom" v-for="item in cartItems" :key="item.id">
                  <div class="row align-items-center">
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
                    <div class="col-md-2 text-center mb-3 mb-md-0">
                      <span class="d-md-none text-muted">Price: </span>
                      {{ formatCurrency(item.price) }}
                    </div>
                    <div class="col-md-2 mb-3 mb-md-0">
                      <div class="d-flex justify-content-center">
                        <div class="input-group" style="max-width: 120px;">
                          <button class="btn btn-outline-secondary btn-sm" @click="updateQuantity(item.id, item.quantity - 1)">-</button>
                          <input type="number" class="form-control form-control-sm text-center" :value="item.quantity" @change="updateQuantity(item.id, parseInt($event.target.value))">
                          <button class="btn btn-outline-secondary btn-sm" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
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
            <router-link v-if="!isEditing" to="/product" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-1"></i> Continue Shopping
            </router-link>
            <button class="btn" :class="isEditing ? 'btn-outline-warning' : 'btn-outline-danger'" @click="clearCart" :disabled="cartItems.length === 0">
              <i class="bi me-1" :class="isEditing ? 'bi-x-circle' : 'bi-trash'"></i> 
              {{ isEditing ? 'Cancel Edit' : 'Clear Cart' }}
            </button>
          </div>
        </div>
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
                class="btn w-100 py-2"
                :class="isEditing ? 'btn-success' : 'btn-primary'"
                :disabled="cartItems.length === 0"
                @click="proceedToPurchase"
              >
                {{ submitButtonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};