window.MyPurchase = {
  setup() {
    const { ref, computed, onMounted } = Vue;

    const searchTerm = ref('');
    const activeFilter = ref('All Orders');
    const filters = ['All Orders', 'Pending', 'Completed', 'Cancelled', 'Last 30 Days'];
    const allOrders = ref([]);
    const isLoading = ref(true);
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const itemsPerPageOptions = [5, 10, 20, 50]; // Options for items per page

    // Fetch orders and order items for the logged-in user
    const fetchOrders = async () => {
      isLoading.value = true;
      const user = JSON.parse(sessionStorage.getItem('user') || sessionStorage.getItem('loggedInUser') || 'null');
      if (!user || !user.id) {
        allOrders.value = [];
        isLoading.value = false;
        return;
      }

      // 1. Fetch orders for this user
      const ordersRes = await fetch(`api_orders.php?user_id=${user.id}`);
      const ordersData = await ordersRes.json();
      if (!ordersData.success || !Array.isArray(ordersData.orders)) {
        allOrders.value = [];
        isLoading.value = false;
        return;
      }

      // 2. For each order, fetch its items
      const ordersWithItems = await Promise.all(
        ordersData.orders.map(async (order) => {
          const itemsRes = await fetch(`api_order_items.php?order_id=${order.id}`);
          const itemsData = await itemsRes.json();
          return {
            ...order,
            products: Array.isArray(itemsData.items) ? itemsData.items.map(item => ({
              id: item.product_id, // <-- Add this line
              name: item.product_name,
              qty: item.quantity,
              price: item.price,
              img: item.img
            })) : []
          };
        })
      );

      allOrders.value = ordersWithItems;
      isLoading.value = false;
    };
    
  const deleteOrderItem = async (itemId, orderId) => {
    try {
      const response = await fetch('api_order_items.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${itemId}&order_id=${orderId}`
      });
      const data = await response.json();
      if (data.success) {
        await fetchOrders(); // Refresh the order list
      }
      return data;
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch('api_orders.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId })
      });
      const data = await response.json();
      if (data.success) {
        await fetchOrders(); // Refresh the order list
      }
      return data;
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, message: 'Network error' };
    }
  };
    // --- Computed Properties ---
    const filteredOrders = computed(() => {
      let orders = allOrders.value;

      // Filter by active button
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

      // Filter by search term
      if (searchTerm.value.trim() !== '') {
        const lowerSearch = searchTerm.value.toLowerCase();
        orders = orders.filter(order => {
          const inOrderId = order.id.toString().toLowerCase().includes(lowerSearch);
          const inProducts = order.products.some(p => p.name.toLowerCase().includes(lowerSearch));
          const inStatus = order.status.toLowerCase().includes(lowerSearch);
          return inOrderId || inProducts || inStatus;
        });
      }

      return orders;
    });
    
    // Paginated orders
    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredOrders.value.slice(start, end);
    });

    // Total pages
    const totalPages = computed(() => {
      return Math.ceil(filteredOrders.value.length / itemsPerPage.value);
    });

    // Showing X to Y of Z entries
    const showingText = computed(() => {
      const total = filteredOrders.value.length;
      if (total === 0) return 'No orders found';
      
      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(currentPage.value * itemsPerPage.value, total);
      return `Showing ${start} to ${end} of ${total} orders`;
    });

    const editOrder = (order) => {
      // Store the entire order object to be picked up by the cart page
      sessionStorage.setItem('editingOrder', JSON.stringify(order));
      // Navigate to the cart's edit mode
      router.push(`/cart/edit/${order.id}`);
    };
    
    // --- Methods ---
    const setFilter = (filter) => {
      activeFilter.value = filter;
      currentPage.value = 1;
    };

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const changeItemsPerPage = (value) => {
      itemsPerPage.value = value;
      currentPage.value = 1; // Reset to first page when changing items per page
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
      const num = Number(value);
      if (isNaN(num)) return 'RM0.00';
      return `RM${num.toFixed(2)}`;
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    };

    const confirmDeleteOrder = (orderId) => {
      if (window.confirm('Are you sure you want to delete this order?')) {
        deleteOrder(orderId);
      }
    };

    onMounted(fetchOrders);

    return {
      searchTerm,
      filters,
      activeFilter,
      filteredOrders: paginatedOrders,
      setFilter,
      getStatusBadgeClass,
      formatCurrency,
      formatDate,
      isLoading,
      currentPage,
      totalPages,
      changePage,
      itemsPerPage,
      itemsPerPageOptions,
      changeItemsPerPage,
      showingText,
      fetchOrders,
      deleteOrder,
      confirmDeleteOrder,
      editOrder,
    };
  },
  template: `
    <div class="container my-5">
      <div class="row mb-4">
        <div class="col-md-6">
          <h2 class="fw-bold"><i class="bi bi-receipt me-2"></i>My Purchase History</h2>
          <p class="text-muted">View and manage all your past orders</p>
        </div>
        <!-- Search bar and filters removed -->
      </div>

      <!-- Orders List -->
      <div class="row">
        <div class="col-12">
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-danger" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="filteredOrders.length > 0">
            <!-- Order Card -->
            <div class="card mb-4 shadow-sm" v-for="order in filteredOrders" :key="order.id">
              <div class="card-body">
                <div class="d-md-flex justify-content-between align-items-start">
                  <div class="mb-3 mb-md-0">
                    <div class="d-flex align-items-center mb-2">
                      <h5 class="card-title mb-0 me-3">Order #{{ order.id }}</h5>
                      <span class="badge" :class="getStatusBadgeClass(order.status)">{{ order.status }}</span>
                    </div>
                    <p class="text-muted mb-2">
                      <i class="bi bi-calendar me-1"></i>
                      Placed on: {{ formatDate(order.created_at) }}
                    </p>
                    <p class="mb-0 fw-bold"><i class="bi bi-currency-dollar me-1"></i> Total: {{ formatCurrency(order.total_amount) }}</p>
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
                <div class="d-flex justify-content-end mt-3">
                  <!-- Action Buttons based on status -->
                    <button class="btn btn-sm btn-outline-primary me-2" @click="editOrder(order)">
                      <i class="bi bi-pencil-square me-1"></i> Edit Order
                    </button>
                  <!-- Delete Button -->
                  <button class="btn btn-sm btn-danger"
                    @click="confirmDeleteOrder(order.id)">
                    <i class="bi bi-trash me-1"></i> Delete
                  </button>
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

          <!-- Pagination Controls -->
          <div class="row align-items-center mt-4" v-if="filteredOrders.length > 0">
            <div class="col-md-6 mb-3 mb-md-0">
              <div class="d-flex align-items-center">
                <span class="me-2">Show:</span>
                <select class="form-select form-select-sm" style="width: auto;" v-model="itemsPerPage" @change="changeItemsPerPage(parseInt($event.target.value))">
                  <option v-for="option in itemsPerPageOptions" :value="option">{{ option }}</option>
                </select>
                <span class="ms-2">entries</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="d-flex justify-content-md-end">
                <nav aria-label="Page navigation">
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="changePage(1)" aria-label="First">
                        <span aria-hidden="true">&laquo;&laquo;</span>
                      </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                      </a>
                    </li>
                    
                    <!-- Dynamic page numbers with ellipsis -->
                    <template v-if="totalPages <= 7">
                      <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                      </li>
                    </template>
                    <template v-else>
                      <li class="page-item" :class="{ active: currentPage === 1 }">
                        <a class="page-link" href="#" @click.prevent="changePage(1)">1</a>
                      </li>
                      
                      <li class="page-item" v-if="currentPage > 3">
                        <span class="page-link">...</span>
                      </li>
                      
                      <template v-if="currentPage <= 3">
                        <li class="page-item" :class="{ active: currentPage === 2 }">
                          <a class="page-link" href="#" @click.prevent="changePage(2)">2</a>
                        </li>
                        <li class="page-item" :class="{ active: currentPage === 3 }">
                          <a class="page-link" href="#" @click.prevent="changePage(3)">3</a>
                        </li>
                        <li class="page-item">
                          <span class="page-link">...</span>
                        </li>
                      </template>
                      <template v-else-if="currentPage > totalPages - 3">
                        <li class="page-item">
                          <span class="page-link">...</span>
                        </li>
                        <li class="page-item" :class="{ active: currentPage === totalPages - 2 }">
                          <a class="page-link" href="#" @click.prevent="changePage(totalPages - 2)">{{ totalPages - 2 }}</a>
                        </li>
                        <li class="page-item" :class="{ active: currentPage === totalPages - 1 }">
                          <a class="page-link" href="#" @click.prevent="changePage(totalPages - 1)">{{ totalPages - 1 }}</a>
                        </li>
                      </template>
                      <template v-else>
                        <li class="page-item">
                          <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">{{ currentPage - 1 }}</a>
                        </li>
                        <li class="page-item active">
                          <a class="page-link" href="#" @click.prevent="changePage(currentPage)">{{ currentPage }}</a>
                        </li>
                        <li class="page-item">
                          <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">{{ currentPage + 1 }}</a>
                        </li>
                        <li class="page-item">
                          <span class="page-link">...</span>
                        </li>
                      </template>
                      
                      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                          <span aria-hidden="true">&raquo;</span>
                        </a>
                      </li>
                      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" href="#" @click.prevent="changePage(totalPages)" aria-label="Last">
                          <span aria-hidden="true">&raquo;&raquo;</span>
                        </a>
                      </li>
                    </template>
                    
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                      </a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <a class="page-link" href="#" @click.prevent="changePage(totalPages)" aria-label="Last">
                        <span aria-hidden="true">&raquo;&raquo;</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
          <!-- Showing X of Y entries -->
          <div class="text-center text-muted mt-2" v-if="filteredOrders.length > 0">
            {{ showingText }}
          </div>
        </div>
      </div>
    </div>
  `
};