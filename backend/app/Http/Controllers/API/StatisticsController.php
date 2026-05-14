<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\OrderItem;
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

        return response()->json([
            'total_users'     => $totalUsers,
            'total_orders'    => $totalOrders,
            'total_revenue'   => $totalRevenue,
            'total_products'  => $totalProducts,
            'orders_by_status'=> $ordersByStatus,
            'revenue_by_month'=> $revenueByMonth,
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
}
