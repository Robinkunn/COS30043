const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Import the HomePage and NavBar components from their respective files
const HomePage = window.HomePage;
const NavBar = window.NavBar;

// Example Products and About components (you can expand these)
const Products = {
  template: `
    <div class="container py-5">
      <h2>Products Page</h2>
      <p>Here you can browse all our pizzas and products.</p>
      <router-link to="/" class="btn btn-secondary mt-3">Back to Home</router-link>
    </div>
  `
};

const About = {
  template: `
    <div class="container py-5">
      <h2>About Pizza Hat</h2>
      <p>Our story and mission...</p>
    </div>
  `
};

// Define routes
const routes = [
  { path: '/', component: HomePage },
  { path: '/product', component: Product },
  { path: '/about', component: About },
  { path: '/my_purchase', component: MyPurchase },
  { path: '/authentication', component: Authentication },
  { path: '/account', component: Account },
];

const router = createRouter({
  history: createWebHashHistory('/COS30043/'),
  routes,
});

// Root App with NavBar and router-view
const App = {
  components: { NavBar },
  template: `
    <div>
      <NavBar />
      <router-view></router-view>
    </div>
  `
};

createApp(App).use(router).mount('#app');
