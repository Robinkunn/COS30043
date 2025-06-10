window.HomePage = {
  setup() {
    const { ref, onMounted } = Vue;

    // Initialize state with empty arrays
    const pizzas = ref([]);
    const testimonials = ref([]);

    // Fetch data from external JSON files when the component is mounted
    onMounted(async () => {
      try {
        // Fetch both products and testimonials at the same time
        const [pizzaResponse, testimonialResponse] = await Promise.all([
          fetch('products.json'),
          fetch('testimonials.json')
        ]);

        if (!pizzaResponse.ok || !testimonialResponse.ok) {
          throw new Error('Network response was not ok.');
        }

        const pizzaData = await pizzaResponse.json();
        const testimonialData = await testimonialResponse.json();

        // Update the state with the fetched data
        pizzas.value = pizzaData.pizzas.slice(0, 4); // Only show the first four pizzas
        testimonials.value = testimonialData;
        
      } catch (error) {
        console.error("Failed to fetch page data:", error);
      }
    });
    
    const renderStars = (rating) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      
      for (let i = 0; i < fullStars; i++) {
        stars.push('<i class="bi bi-star-fill"></i>');
      }
      
      if (hasHalfStar) {
        stars.push('<i class="bi bi-star-half"></i>');
      }
      
      return stars.join('');
    };

    // Add to Cart logic (copied from product.js)
    const addToCart = (item) => {
      // Check if user is logged in
      const user = JSON.parse(sessionStorage.getItem('user') || sessionStorage.getItem('loggedInUser') || 'null');
      if (!user || !user.id) {
        if (confirm('You must login first to add items to your cart.\n\nGo to login page?')) {
          window.location.hash = '#/authentication';
          // If you use Vue Router instance, you can use: router.push('/authentication');
        }
        return;
      }

      let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
      const existingItem = cart.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.img,
          inStock: true
        });
      }

      sessionStorage.setItem('cart', JSON.stringify(cart));
      alert(`${item.name} has been added to your cart.`);
    };

    return { pizzas, testimonials, renderStars, addToCart };
  },
  template: `
    <div>
      <!-- Hero Section with Enhanced Video Styling -->
      <div class="video-hero">
        <div class="video-wrapper">
          <video autoplay muted loop playsinline class="hero-video">
            <source src="src/videos/homepage_background.mov" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="hero-content">
          <div class="container">
            <div class="hero-text">
              <h1 class="hero-title">Authentic Italian Pizza</h1>
              <p class="hero-subtitle">Handcrafted with the finest ingredients and traditional recipes passed down through generations.</p>
              <div class="hero-buttons">
                <router-link to="/product" class="btn btn-primary btn-lg me-3">Order Now</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Menu Section -->
      <section id="menu" class="section bg-light">
        <div class="container">
          <h2 class="section-title">Our Signature Pizzas</h2>
          <div class="row">
            <div class="col-md-6 col-lg-3" v-for="(pizza, index) in pizzas" :key="index">
              <div class="menu-item">
                <img :src="pizza.img" :alt="pizza.name">
                <div class="menu-item-body">
                  <h4>{{ pizza.name }}</h4>
                  <p>{{ pizza.desc }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="price">{{ pizza.price }}</span>
                    <button class="btn btn-sm btn-outline-danger" @click="addToCart(pizza)">Add to Cart</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center mt-5">
            <router-link to="/product" class="btn btn-danger btn-lg px-4 py-2">
              View Full Menu <i class="bi bi-arrow-right ms-2"></i>
            </router-link>
          </div>
        </div>
      </section>
      
      <!-- About Section -->
      <section id="our-story" class="section">
        <div class="container">
          <div class="row align-items-center justify-content-center text-justify">
            <div class="col-lg-6 mb-4 mb-lg-0">
              <div class="about-img">
                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5" alt="Our Restaurant">
              </div>
            </div>
            <div class="col-lg-6">
              <h2 class="section-title">Our Story</h2>
              <p style="text-align:justify;">Founded in 1985 by Italian immigrant Giovanni Rossi, Pizza Hat brings authentic Neapolitan pizza to your table. Our recipes have been passed down through three generations of pizza makers in Naples.</p>
              <p style="text-align:justify;">We use only the finest ingredients imported directly from Italy, including San Marzano tomatoes, fresh buffalo mozzarella, and extra virgin olive oil from Tuscany.</p>
              <p style="text-align:justify;">Our wood-fired oven reaches 900°F, cooking each pizza in just 90 seconds for that perfect char and texture that Naples is famous for.</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Testimonials Section -->
      <section class="section bg-light">
        <div class="container">
          <h2 class="section-title text-center">What Our Customers Say</h2>
          <div class="row justify-content-center text-center">
            <div class="col-md-4" v-for="(testimonial, index) in testimonials" :key="index">
              <div class="testimonial-card mx-auto">
                <img :src="testimonial.img" :alt="testimonial.name" class="testimonial-img">
                <h5>{{ testimonial.name }}</h5>
                <div class="mb-3 text-warning" v-html="renderStars(testimonial.rating)"></div>
                <p>{{ testimonial.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Contact Section -->
      <section id="reservation" class="section">
        <div class="container">
          <h2 class="section-title">Visit Us</h2>
          <div class="row">
            <div class="col-lg-4 mb-4 mb-lg-0">
              <div class="contact-info">
                <i class="bi bi-geo-alt"></i>
                <h4>Location</h4>
                <p>123 Pasta Street<br>Little Italy, NY 10013</p>
              </div>
            </div>
            <div class="col-lg-4 mb-4 mb-lg-0">
              <div class="contact-info">
                <i class="bi bi-clock"></i>
                <h4>Opening Hours</h4>
                <p>Monday - Friday: 11am - 10pm<br>
                Saturday - Sunday: 10am - 11pm</p>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="contact-info">
                <i class="bi bi-telephone"></i>
                <h4>Reservations</h4>
                <p>Phone: (212) 555-1234<br>
                Email: info@bellanapoli.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Footer -->
      <footer id="footer" class="bg-dark text-white py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-4 mb-4 mb-lg-0 text-center">
              <h5>Pizza Hat</h5>
              <p>Authentic Italian pizza since 1985. Bringing the taste of Naples to your neighborhood.</p>
              <div class="social-icons">
                <a href="https://www.facebook.com/pizzahutmalaysia/?brand_redir=321935321302049#" class="text-white me-3" target="_blank" rel="noopener">
                  <i class="bi bi-facebook"></i>
                </a>
                <a href="https://www.instagram.com/pizzahut/" class="text-white me-3" target="_blank" rel="noopener">
                  <i class="bi bi-instagram"></i>
                </a>
                <a href="https://x.com/pizzahut" class="text-white me-3" target="_blank" rel="noopener">
                  <i class="bi bi-twitter"></i>
                </a>
              </div>
            </div>
          </div>
          <hr class="my-4 bg-secondary">
          <div class="row">
            <div class="col-md-6 text-center text-md-start">
              <p class="mb-0">© 2023 Pizza Hat. All rights reserved.</p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <p class="mb-0">Designed with <i class="bi bi-heart-fill text-danger"></i> by our team</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
};