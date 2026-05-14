-- ============================================================
-- VêteMode E-Commerce - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce_vetemode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_vetemode;

-- Users
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('client','admin') DEFAULT 'client',
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    avatar VARCHAR(255) NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Categories
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Products
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT UNSIGNED DEFAULT 0,
    category_id BIGINT UNSIGNED NOT NULL,
    image VARCHAR(255) NULL,
    matiere VARCHAR(255) NULL,
    tailles VARCHAR(255) NULL,
    couleurs VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Carts
CREATE TABLE carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cart Items
CREATE TABLE cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('en_attente','expediee','livree','annulee') DEFAULT 'en_attente',
    payment_method ENUM('livraison','carte','paypal') NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Payments
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('livraison','carte','paypal') NOT NULL,
    status ENUM('en_attente','complete','echoue') DEFAULT 'en_attente',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Personal Access Tokens (Laravel Sanctum)
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- ============================================================
-- Seed Data
-- ============================================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Administrateur', 'admin@vetemode.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW(), NOW());

-- Categories
INSERT INTO categories (name, created_at, updated_at) VALUES
('Vêtements', NOW(), NOW()),
('Chaussures', NOW(), NOW()),
('Accessoires', NOW(), NOW());

-- Sample Products
INSERT INTO products (name, description, price, stock, category_id, matiere, tailles, couleurs, created_at, updated_at) VALUES
('T-Shirt Premium Coton', 'T-shirt en coton premium, coupe moderne et confortable.', 199.00, 50, 1, '100% Coton', 'S,M,L,XL,XXL', 'Blanc,Noir,Bleu,Rouge', NOW(), NOW()),
('Jean Slim Stretch', 'Jean slim stretch, idéal pour toutes occasions.', 349.00, 30, 1, '98% Coton, 2% Élasthanne', '36,38,40,42,44', 'Bleu foncé,Noir,Gris', NOW(), NOW()),
('Veste en Lin', 'Veste légère en lin, parfaite pour l\'été.', 499.00, 20, 1, '100% Lin', 'S,M,L,XL', 'Beige,Blanc,Kaki', NOW(), NOW()),
('Robe Fleurie', 'Robe légère à motifs fleuris, élégante et féminine.', 279.00, 25, 1, 'Viscose', 'XS,S,M,L', 'Rose,Bleu,Vert', NOW(), NOW()),
('Sneakers Urban', 'Sneakers modernes pour un look urbain tendance.', 599.00, 40, 2, 'Cuir synthétique', '38,39,40,41,42,43,44,45', 'Blanc,Noir,Gris', NOW(), NOW()),
('Boots Cuir Véritable', 'Boots en cuir véritable, confortables et durables.', 899.00, 15, 2, 'Cuir véritable', '37,38,39,40,41,42,43', 'Marron,Noir', NOW(), NOW()),
('Mocassins Classic', 'Mocassins classiques, parfaits pour le bureau.', 449.00, 22, 2, 'Cuir', '38,39,40,41,42,43,44', 'Marron,Noir,Bleu marine', NOW(), NOW()),
('Sac à Main Élégant', 'Sac à main en cuir synthétique, grande capacité.', 299.00, 35, 3, 'Cuir synthétique', 'Unique', 'Noir,Marron,Beige', NOW(), NOW()),
('Ceinture en Cuir', 'Ceinture en cuir véritable, boucle dorée.', 149.00, 60, 3, 'Cuir véritable', '80,85,90,95,100', 'Noir,Marron', NOW(), NOW()),
('Écharpe Cachemire', 'Écharpe en cachemire doux et chaud.', 249.00, 45, 3, '100% Cachemire', 'Unique', 'Gris,Beige,Rouge,Bleu', NOW(), NOW());
