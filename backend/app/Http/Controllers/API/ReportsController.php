<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $params = $this->resolveParams($request);

        $summary = $this->buildSummary($params['start'], $params['end']);
        $trends = $this->buildMonthlyTrend($params['start'], $params['end']);
        $topProducts = $this->buildTopProducts($params['start'], $params['end']);
        $topCategories = $this->buildTopCategories($params['start'], $params['end']);

        return response()->json([
            'report_type' => $params['report_type'],
            'period_label' => $params['label'],
            'start' => $params['start']->toDateString(),
            'end' => $params['end']->toDateString(),
            'summary' => $summary,
            'monthly' => $trends,
            'top_products' => $topProducts,
            'top_categories' => $topCategories,
        ]);
    }

    public function pdf(Request $request)
    {
        $params = $this->resolveParams($request);

        $summary = $this->buildSummary($params['start'], $params['end']);
        $trends = $this->buildMonthlyTrend($params['start'], $params['end']);
        $topProducts = $this->buildTopProducts($params['start'], $params['end']);
        $topCategories = $this->buildTopCategories($params['start'], $params['end']);
        $dateGenerated = now();

        $pdf = Pdf::loadView('reports.pdf', [
            'reportType' => $params['report_type'],
            'periodLabel' => $params['label'],
            'summary' => $summary,
            'monthly' => $trends,
            'topProducts' => $topProducts,
            'topCategories' => $topCategories,
            'dateGenerated' => $dateGenerated,
        ])->setPaper('a4', 'portrait');

        return $pdf->download(sprintf('rapport-financier-%s-%s.pdf', $params['report_type'], now()->format('Ymd')));
    }

    private function resolveParams(Request $request): array
    {
        $reportType = $request->get('report_type', 'monthly');
        $year = (int) $request->get('year', now()->year);
        $from = $request->get('from');
        $to = $request->get('to');

        if ($reportType === 'annual') {
            $start = Carbon::create($year, 1, 1)->startOfDay();
            $end = Carbon::create($year, 12, 31)->endOfDay();
            $label = "Année {$year}";
        } elseif ($reportType === 'custom' && $from && $to) {
            $start = Carbon::parse($from)->startOfDay();
            $end = Carbon::parse($to)->endOfDay();
            if ($end->lessThan($start)) {
                [$start, $end] = [$end, $start];
            }
            $label = sprintf('Période personnalisée (%s - %s)', $start->format('d/m/Y'), $end->format('d/m/Y'));
        } else {
            if ($request->has('year')) {
                $start = Carbon::create($year, 1, 1)->startOfDay();
                $end = Carbon::create($year, 12, 31)->endOfDay();
                $label = "Année {$year}";
            } else {
                $end = now()->endOfDay();
                $start = now()->subMonths(11)->startOfMonth();
                $label = '12 derniers mois';
            }
            $reportType = 'monthly';
        }

        return [
            'report_type' => $reportType,
            'start' => $start,
            'end' => $end,
            'label' => $label,
            'year' => $year,
            'from' => $from,
            'to' => $to,
        ];
    }

    private function buildSummary(Carbon $start, Carbon $end): array
    {
        $totalRevenue = Order::where('status', '!=', 'annulee')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total');

        $totalOrders = Order::whereBetween('created_at', [$start, $end])->count();

        $totalProductsSold = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'annulee')
            ->whereBetween('orders.created_at', [$start, $end])
            ->sum('order_items.quantity');

        $totalUsers = User::count();

        $recentRevenue = Order::where('status', '!=', 'annulee')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('total');

        $revenueEvolution = $this->calculateRevenueEvolution($start, $end, $totalRevenue);

        return [
            'total_revenue' => (float) $totalRevenue,
            'total_orders' => (int) $totalOrders,
            'total_products_sold' => (int) $totalProductsSold,
            'total_users' => (int) $totalUsers,
            'recent_revenue' => (float) $recentRevenue,
            'revenue_evolution' => $revenueEvolution,
        ];
    }

    private function calculateRevenueEvolution(Carbon $start, Carbon $end, float $currentRevenue): ?float
    {
        $periodLength = $start->diffInMonths($end) + 1;
        $previousStart = $start->copy()->subMonths($periodLength)->startOfMonth();
        $previousEnd = $start->copy()->subDay()->endOfDay();

        $previousRevenue = Order::where('status', '!=', 'annulee')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->sum('total');

        if ($previousRevenue <= 0) {
            return null;
        }

        return round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 2);
    }

    private function buildMonthlyTrend(Carbon $start, Carbon $end): array
    {
        $rows = Order::select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->where('status', '!=', 'annulee')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $periods = [];
        $cursor = $start->copy();

        while ($cursor->lessThanOrEqualTo($end)) {
            $key = $cursor->format('Y-m');
            $periods[$key] = [
                'label' => $cursor->format('M Y'),
                'revenue' => 0.0,
                'orders' => 0,
            ];
            $cursor->addMonth();
        }

        foreach ($rows as $row) {
            $key = sprintf('%04d-%02d', $row->year, $row->month);
            if (isset($periods[$key])) {
                $periods[$key]['revenue'] = (float) $row->revenue;
                $periods[$key]['orders'] = (int) $row->orders;
            }
        }

        return array_values($periods);
    }

    private function buildTopProducts(Carbon $start, Carbon $end): array
    {
        return OrderItem::select(
                'products.id as product_id',
                'products.name as product_name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue')
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', '!=', 'annulee')
            ->whereBetween('orders.created_at', [$start, $end])
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product_name,
                    'total_sold' => (int) $item->total_sold,
                    'revenue' => (float) $item->revenue,
                ];
            })
            ->toArray();
    }

    private function buildTopCategories(Carbon $start, Carbon $end): array
    {
        return OrderItem::select(
                'categories.id as category_id',
                'categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue')
            )
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.status', '!=', 'annulee')
            ->whereBetween('orders.created_at', [$start, $end])
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->category_id,
                    'name' => $item->category_name,
                    'total_sold' => (int) $item->total_sold,
                    'revenue' => (float) $item->revenue,
                ];
            })
            ->toArray();
    }
}
