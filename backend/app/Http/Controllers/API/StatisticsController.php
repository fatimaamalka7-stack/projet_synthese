<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\ReturnRequest;
use App\Models\AdminNotification;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function index()
    {
        $totalUsers    = User::where('role', 'client')->count();
        $totalOrders   = Order::count();
        $totalRevenue  = Order::where('status', '!=', 'annulee')->sum('total');
        $totalProducts = Product::count();

        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $pendingOrders = Order::where('status', 'en_attente')->count();
        $unseenOrders = Order::whereNull('admin_seen_at')->count();
        $unreadNotifications = AdminNotification::unread()->count();

        $revenueByMonth = Order::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(total) as revenue')
            )
            ->where('status', '!=', 'annulee')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $returnStats = $this->buildReturnStatistics();

        $returnRequestsByStatus = ReturnRequest::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return response()->json([
            'total_return_requests' => $returnRequestsByStatus->sum('count'),
            'pending_return_requests' => $returnRequestsByStatus->get('pending')->count ?? 0,
            'approved_return_requests' => $returnRequestsByStatus->get('approved')->count ?? 0,
            'rejected_return_requests' => $returnRequestsByStatus->get('rejected')->count ?? 0,
            'refunded_return_requests' => $returnRequestsByStatus->get('refunded')->count ?? 0,
            'total_users'      => $totalUsers,
            'total_orders'     => $totalOrders,
            'total_revenue'    => $totalRevenue,
            'total_products'   => $totalProducts,
            'pending_orders'   => $pendingOrders,
            'unseen_orders'    => $unseenOrders,
            'unread_notifications' => $unreadNotifications,
            'orders_by_status' => $ordersByStatus,
            'revenue_by_month' => $revenueByMonth,
            'return_stats' => $returnStats,
        ]);
    }

    public function revenue()
    {
        $data = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->where('status', '!=', 'annulee')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    public function popularProducts()
    {
        $products = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->with('product:id,name,price,image')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        return response()->json($products);
    }

    private function buildReturnStatistics(): array
    {
        $products = OrderItem::select(
                'products.id as product_id',
                'products.name as product_name',
                DB::raw('SUM(CASE WHEN orders.status = "retournee" THEN order_items.quantity ELSE 0 END) as returned_quantity'),
                DB::raw('SUM(CASE WHEN orders.status != "annulee" THEN order_items.quantity ELSE 0 END) as sold_quantity')
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->groupBy('products.id', 'products.name')
            ->get();

        $byProduct = $products->map(function ($item) {
            $sold = (int) $item->sold_quantity;
            $returned = (int) $item->returned_quantity;

            return [
                'id' => $item->product_id,
                'name' => $item->product_name,
                'sold_quantity' => $sold,
                'returned_quantity' => $returned,
                'return_rate' => $sold > 0 ? round(($returned / $sold) * 100, 2) : 0,
            ];
        });

        $mostReturned = $byProduct->sortByDesc('returned_quantity')->first();
        $lowestReturnRates = $byProduct
            ->filter(fn($item) => $item['sold_quantity'] > 0)
            ->sortBy('return_rate')
            ->take(5)
            ->values();

        return [
            'return_count_by_product' => $byProduct->sortByDesc('returned_quantity')->values(),
            'most_returned_product' => $mostReturned,
            'lowest_return_rate_products' => $lowestReturnRates,
        ];
    }
}
