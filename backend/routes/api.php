<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\StatisticsController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\AdminNotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Auth routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}/products', [CategoryController::class, 'products']);
Route::get('/reviews/{productId}', [ReviewController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update/{id}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);

    // Orders
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Payments
    Route::post('/payments', [PaymentController::class, 'store']);

    // Admin routes
    Route::middleware('admin')->group(function () {

        // Products CRUD
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Categories CRUD
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Users management
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::get('/admin/users/{id}', [UserController::class, 'show']);
        Route::put('/admin/users/{id}', [UserController::class, 'update']);
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
        Route::put('/admin/users/{id}/block', [UserController::class, 'block']);

        // Orders management
        Route::get('/admin/orders', [OrderController::class, 'adminIndex']);
        Route::get('/admin/orders/unseen-count', [OrderController::class, 'unseenCount']);
        Route::put('/admin/orders/{id}/seen', [OrderController::class, 'markAsSeen']);
        Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);

        // Reviews management
        Route::get('/admin/reviews', [ReviewController::class, 'adminIndex']);
        Route::put('/admin/reviews/{id}/validate', [ReviewController::class, 'validate']);

        // Statistics
        Route::get('/admin/statistics', [StatisticsController::class, 'index']);
        Route::get('/admin/statistics/revenue', [StatisticsController::class, 'revenue']);
        Route::get('/admin/statistics/products', [StatisticsController::class, 'popularProducts']);

        // Admin notifications
        Route::get('/admin/notifications', [AdminNotificationController::class, 'index']);
        Route::get('/admin/notifications/unread-count', [AdminNotificationController::class, 'unreadCount']);
        Route::put('/admin/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
        Route::put('/admin/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
    });
});
