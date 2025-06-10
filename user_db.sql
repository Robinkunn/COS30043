CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(10),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, username, name, email, phone, street, city, state, zip, password)
VALUES (
  'U_001',
  'achoo',
  'Achoo',
  'achoo@example.com',
  '1234567890',
  '123 Dummy St',
  'Dummytown',
  'DummyState',
  '12345',
  'achoo'
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10),
    items JSON NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id VARCHAR(20),
    product_name VARCHAR(100),
    price DECIMAL(10, 2),
    quantity INT,
    img VARCHAR(255), 
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
