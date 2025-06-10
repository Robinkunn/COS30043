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
    cart_items JSON DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, username, name, email, phone, street, city, state, zip, password, cart_items)
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
  'achoo',
  NULL
);
