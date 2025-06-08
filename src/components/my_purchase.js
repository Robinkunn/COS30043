window.MyPurchase = {
  setup() {
    // Import necessary functions from Vue
    const { ref, computed } = Vue;

    // --- Reactive State ---

    const searchTerm = ref('');
    const activeFilter = ref('All Orders');
    const filters = ['All Orders', 'Pending', 'Completed', 'Cancelled', 'Last 30 Days'];

    // Sample data for purchase history. In a real app, this would come from an API.
    const allOrders = ref([
      {
        id: 'ORD-2023-00145',
        status: 'Delivered',
        date: '2023-06-15',
        total: 128.95,
        products: [
          { name: 'Wireless Bluetooth Headphones', qty: 1, price: 79.99, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop' },
          { name: 'Phone Case - Black', qty: 2, price: 24.98, img: 'https://images.unsplash.com/photo-1587324104999-317133604dc1?w=80&h=80&fit=crop' }
        ]
      },
      {
        id: 'ORD-2023-00132',
        status: 'Shipped',
        date: '2023-06-05',
        total: 65.50,
        products: [
          { name: 'Smart Watch - Fitness Tracker', qty: 1, price: 65.50, img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80&h=80&fit=crop' }
        ]
      },
      {
        id: 'ORD-2023-00118',
        status: 'Cancelled',
        date: '2023-05-22',
        total: 42.99,
        products: [
          { name: 'Wireless Charging Pad', qty: 1, price: 42.99, img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=80&h=80&fit=crop' }
        ]
      },
      {
        id: 'ORD-2023-00097',
        status: 'Delivered',
        date: '2023-05-05',
        total: 182.96,
        products: [
          { name: 'Portable Bluetooth Speaker', qty: 1, price: 89.99, img: 'https://images.unsplash.com/photo-1589100244010-69281372c349?w=80&h=80&fit=crop' },
          { name: 'USB-C Cable Set (3 pack)', qty: 1, price: 19.99, img: 'https://images.unsplash.com/photo-1583863718228-56a86c639414?w=80&h=80&fit=crop' },
          { name: 'Laptop Backpack', qty: 1, price: 59.99, img: 'https://images.unsplash.com/photo-1553062407-98eeb68c6a62?w=80&h=80&fit=crop' },
          { name: 'Screen Cleaning Kit', qty: 1, price: 12.99, img: 'https://images.unsplash.com/photo-1623479234839-9556883200a8?w=80&h=80&fit=crop' }
        ]
      }
    ]);

    // --- Computed Properties ---

    // This computed property filters orders based on the active filter and search term.
    const filteredOrders = computed(() => {
      let orders = allOrders.value;

      // 1. Filter by the active button
      if (activeFilter.value !== 'All Orders') {
        if (activeFilter.value === 'Pending') {
          orders = orders.filter(o => o.status === 'Shipped' || o.status === 'Processing');
        } else if (activeFilter.value === 'Completed') {
          orders = orders.filter(o => o.status === 'Delivered');
        } else if (activeFilter.value === 'Cancelled') {
          orders = orders.filter(o => o.status === 'Cancelled');
        } else if (activeFilter.value === 'Last 30 Days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          orders = orders.filter(o => new Date(o.date) >= thirtyDaysAgo);
        }
      }

      // 2. Filter by search term
      if (searchTerm.value.trim() !== '') {
        const lowerSearch = searchTerm.value.toLowerCase();
        orders = orders.filter(order => {
          const inOrderId = order.id.toLowerCase().includes(lowerSearch);
          const inProducts = order.products.some(p => p.name.toLowerCase().includes(lowerSearch));
          return inOrderId || inProducts;
        });
      }

      return orders;
    });

    // --- Methods ---

    const setFilter = (filter) => {
      activeFilter.value = filter;
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Delivered': return 'bg-success';
        case 'Shipped': return 'bg-warning text-dark';
        case 'Cancelled': return 'bg-danger';
        case 'Processing': return 'bg-info';
        default: return 'bg-secondary';
      }
    };

    const formatCurrency = (value) => {
      return `$${value.toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return {
      searchTerm,
      filters,
      activeFilter,
      filteredOrders,
      setFilter,
      getStatusBadgeClass,
      formatCurrency,
      formatDate
    };
  },
  template: `
    <div class="container my-5">
      <div class="row mb-4">
        <div class="col-md-6">
          <h2 class="fw-bold"><i class="bi bi-receipt me-2"></i>My Purchase History</h2>
          <p class="text-muted">View and manage all your past orders</p>
        </div>
        <div class="col-md-6 d-flex align-items-center justify-content-md-end">
          <div class="input-group" style="max-width: 300px;">
            <input type="text" class="form-control" placeholder="Search orders..." v-model="searchTerm">
            <button class="btn btn-outline-secondary" type="button"><i class="bi bi-search"></i></button>
          </div>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="d-flex flex-wrap gap-2 mb-4">
        <button 
          v-for="filter in filters" 
          :key="filter" 
          @click="setFilter(filter)" 
          class="filter-btn btn btn-sm"
          :class="activeFilter === filter ? 'btn-primary' : 'btn-outline-secondary'">
          {{ filter }}
        </button>
      </div>

      <!-- Orders List -->
      <div class="row">
        <div class="col-12">
          <div v-if="filteredOrders.length > 0">
            <!-- Order Card -->
            <div class="card mb-4 shadow-sm" v-for="order in filteredOrders" :key="order.id">
              <div class="card-body">
                <div class="d-md-flex justify-content-between align-items-start">
                  <div class="mb-3 mb-md-0">
                    <div class="d-flex align-items-center mb-2">
                      <h5 class="card-title mb-0 me-3">Order #{{ order.id }}</h5>
                      <span class="badge" :class="getStatusBadgeClass(order.status)">{{ order.status }}</span>
                    </div>
                    <p class="text-muted mb-2"><i class="bi bi-calendar me-1"></i> Placed on: {{ formatDate(order.date) }}</p>
                    <p class="mb-0 fw-bold"><i class="bi bi-currency-dollar me-1"></i> Total: {{ formatCurrency(order.total) }}</p>
                  </div>
                  <div class="d-flex flex-column flex-md-row">
                    <button class="btn btn-outline-primary btn-sm me-md-2 mb-2 mb-md-0">
                      <i class="bi bi-eye me-1"></i> View Details
                    </button>
                    <button class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-printer me-1"></i> Print Invoice
                    </button>
                  </div>
                </div>
                <hr>
                <div class="row">
                  <!-- Product List -->
                  <div class="col-lg-6 mb-3" v-for="product in order.products" :key="product.name">
                    <div class="d-flex">
                      <img :src="product.img" :alt="product.name" class="img-thumbnail me-3" style="width: 80px; height: 80px; object-fit: cover;">
                      <div>
                        <h6 class="mb-1">{{ product.name }}</h6>
                        <p class="text-muted small mb-1">Qty: {{ product.qty }}</p>
                        <p class="text-muted small mb-0">{{ formatCurrency(product.price) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Action Buttons based on status -->
                <div class="d-flex justify-content-end mt-3">
                  <template v-if="order.status === 'Delivered'">
                    <button class="btn btn-sm btn-outline-danger me-2">
                      <i class="bi bi-x-circle me-1"></i> Request Return
                    </button>
                    <button class="btn btn-sm btn-outline-success">
                      <i class="bi bi-star me-1"></i> Rate Products
                    </button>
                  </template>
                  <template v-if="order.status === 'Shipped'">
                    <button class="btn btn-sm btn-outline-primary me-2">
                      <i class="bi bi-truck me-1"></i> Track Package
                    </button>
                  </template>
                  <template v-if="order.status === 'Cancelled'">
                    <button class="btn btn-sm btn-outline-secondary">
                      <i class="bi bi-cart-plus me-1"></i> Reorder
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-5">
            <i class="bi bi-search" style="font-size: 3rem; color: #6c757d;"></i>
            <h4 class="mt-3">No Orders Found</h4>
            <p class="text-muted">Your search or filter criteria did not match any orders.</p>
          </div>

          <!-- Pagination -->
          <nav aria-label="Page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item disabled">
                <a class="page-link" href="#" tabindex="-1">Previous</a>
              </li>
              <li class="page-item active"><a class="page-link" href="#">1</a></li>
              <li class="page-item"><a class="page-link" href="#">2</a></li>
              <li class="page-item"><a class="page-link" href="#">3</a></li>
              <li class="page-item">
                <a class="page-link" href="#">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `
};