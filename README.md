# 🛍️ VêteMode – Plateforme E-Commerce

> Application e-commerce complète pour la vente de vêtements et chaussures.  
> **Stack :** Laravel 10 · React 18 · MySQL · Tailwind CSS · Sanctum JWT

---

## 📁 Structure du projet

```
ecommerce-project/
├── backend/          ← API REST Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/API/   ← Tous les controllers
│   │   │   └── Middleware/        ← AdminMiddleware
│   │   └── Models/               ← User, Product, Order, Cart…
│   ├── config/cors.php
│   ├── database/
│   │   ├── schema.sql             ← Schéma complet + données de test
│   │   └── seeders/
│   └── routes/api.php
│
└── frontend/         ← Interface React
    └── src/
        ├── pages/
        │   ├── Admin/             ← Dashboard, Products, Orders, Users, Reviews, Settings
        │   ├── HomePage.jsx
        │   ├── ProductsPage.jsx
        │   ├── ProductDetail.jsx
        │   ├── CartPage.jsx
        │   ├── CheckoutPage.jsx
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        ├── components/
        │   ├── Layout/            ← MainLayout, AdminLayout, Footer
        │   ├── Navbar/            ← Navbar responsive
        │   └── Products/          ← ProductCard
        ├── context/               ← AuthContext, CartContext, ThemeContext
        └── services/api.js        ← Axios configuré
```

---

## ⚙️ Installation

### Pré-requis
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8+
- XAMPP ou Laragon

---

### 1️⃣ Backend (Laravel)

```bash
cd backend

# Installer les dépendances
composer install

# Configurer l'environnement
cp .env.example .env
php artisan key:generate
```

**Modifier `.env` :**
```env
DB_DATABASE=ecommerce_vetemode
DB_USERNAME=root
DB_PASSWORD=          # votre mot de passe MySQL
```

```bash
# Importer la base de données
# Option A : via MySQL Workbench → ouvrir database/schema.sql et exécuter
# Option B : via ligne de commande :
mysql -u root -p < database/schema.sql

# OU utiliser les migrations Laravel (si vous préférez) :
php artisan migrate --seed

# Lancer le serveur
php artisan serve
# → http://127.0.0.1:8000

# Lien storage pour les images
php artisan storage:link
```

---

### 2️⃣ Frontend (React)

```bash
cd frontend

# Copier le fichier env
cp .env.example .env

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

---

## 🔑 Comptes de démonstration

| Rôle          | Email                   | Mot de passe |
|---------------|-------------------------|--------------|
| Administrateur| admin@vetemode.com      | password     |
| Client        | client@vetemode.com     | password     |

---

## 🌐 URLs de l'application

| Service       | URL                              |
|---------------|----------------------------------|
| Frontend      | http://localhost:3000            |
| Backend API   | http://127.0.0.1:8000/api        |
| Admin Panel   | http://localhost:3000/admin      |

---

## 📡 API Endpoints

### Authentification
```
POST   /api/register
POST   /api/login
POST   /api/logout       (auth requis)
GET    /api/user          (auth requis)
PUT    /api/user/profile  (auth requis)
```

### Produits (publics)
```
GET    /api/products                  ?search= &category_id= &sort= &min_price= &max_price=
GET    /api/products/{id}
```

### Produits (admin)
```
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
```

### Catégories
```
GET    /api/categories
GET    /api/categories/{id}/products
POST   /api/categories               (admin)
PUT    /api/categories/{id}          (admin)
DELETE /api/categories/{id}          (admin)
```

### Panier (auth)
```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update/{id}
DELETE /api/cart/remove/{id}
DELETE /api/cart/clear
```

### Commandes (auth)
```
POST   /api/orders
GET    /api/orders
GET    /api/orders/{id}
PUT    /api/orders/{id}/cancel
```

### Admin
```
GET    /api/admin/users
PUT    /api/admin/users/{id}/block
GET    /api/admin/orders
PUT    /api/admin/orders/{id}/status
GET    /api/admin/statistics
GET    /api/admin/statistics/revenue
GET    /api/admin/statistics/products
GET    /api/admin/reviews
PUT    /api/admin/reviews/{id}/validate
```

---

## 🗄️ Schéma Base de Données

```
users ──────────────┐
  id, name, email,  │
  password, role,   │
  phone, address,   │
  is_blocked        │
                    │
categories ─────────┤
  id, name          │
                    │
products ───────────┤
  id, name, price,  │
  stock, category_id│
  image, matiere,   │
  tailles, couleurs │
                    │
carts ──────────────┤
  id, user_id       │
                    │
cart_items ─────────┤
  id, cart_id,      │
  product_id, qty   │
                    │
orders ─────────────┤
  id, user_id,      │
  total, status,    │
  payment_method,   │
  address           │
                    │
order_items ────────┤
  id, order_id,     │
  product_id, qty,  │
  price             │
                    │
reviews ────────────┤
  id, user_id,      │
  product_id,       │
  rating, comment,  │
  is_validated      │
                    │
payments ───────────┘
  id, order_id,
  amount, method,
  status
```

---

## ✨ Fonctionnalités implémentées

### Espace Visiteur / Client
- ✅ Page d'accueil avec sections vêtements & chaussures
- ✅ Liste produits avec filtres (recherche, prix, catégorie, tri)
- ✅ Fiche produit détaillée (images, tailles, couleurs, matière, stock)
- ✅ Produits similaires
- ✅ Système d'avis et notes (★★★★★)
- ✅ Panier dynamique avec quantités
- ✅ Checkout avec choix mode de paiement
- ✅ Confirmation de commande
- ✅ Historique des commandes
- ✅ Profil utilisateur

### Authentification
- ✅ Inscription avec validation
- ✅ Connexion avec Laravel Sanctum
- ✅ Routes protégées
- ✅ Redirection vers login si non connecté

### Dashboard Admin
- ✅ Statistiques (users, commandes, revenus, produits)
- ✅ Graphiques (LineChart revenus, PieChart statuts, BarChart populaires)
- ✅ CRUD Produits complet avec upload image
- ✅ Gestion commandes + changement de statut
- ✅ Gestion utilisateurs (bloquer, promouvoir admin, supprimer)
- ✅ Modération des avis (valider/invalider/supprimer)
- ✅ Paramètres (thème clair/sombre, profil, mot de passe)

### UI/UX
- ✅ Design moderne glassmorphism
- ✅ Responsive mobile/tablette/desktop
- ✅ Mode sombre / clair
- ✅ Animations et transitions
- ✅ Notifications toast
- ✅ Sidebar admin avec navigation active

---

## 🔧 Technologies utilisées

| Technologie       | Version  | Rôle                          |
|-------------------|----------|-------------------------------|
| Laravel           | 10       | API REST backend              |
| Laravel Sanctum   | 3.2      | Authentification par token    |
| PHP               | 8.1+     | Langage backend               |
| MySQL             | 8+       | Base de données               |
| React             | 18       | Interface utilisateur         |
| React Router DOM  | 6        | Navigation SPA                |
| Axios             | 1.6      | Requêtes HTTP                 |
| Tailwind CSS      | 3.4      | Styling                       |
| Recharts          | 2.x      | Graphiques admin              |
| React Hot Toast   | 2.4      | Notifications                 |
| React Icons       | 4.12     | Icônes (Feather Icons)        |
| Vite              | 5        | Build tool                    |

---

## 🚀 Build production

```bash
# Frontend
cd frontend
npm run build
# → dossier dist/ à déployer

# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 📞 Support

Développé dans le cadre d'un projet académique.  
**Stack :** Laravel + React + MySQL — Architecture API REST.
