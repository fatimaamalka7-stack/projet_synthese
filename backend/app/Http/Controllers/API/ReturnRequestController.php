<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Services\AdminNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReturnRequestController extends Controller
{
    public function index(Request $request)
    {
        $requests = ReturnRequest::where('user_id', $request->user()->id)
            ->with(['order.items.product', 'order'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($requests);
    }

    public function store(Request $request, $orderId)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
            'description' => 'nullable|string|max:2000',
        ]);

        $order = Order::where('user_id', $request->user()->id)
            ->with('returnRequests')
            ->findOrFail($orderId);

        if (in_array($order->status, ['annulee', 'retournee']) || $order->returned_at) {
            return response()->json(['message' => 'Cette commande ne peut pas faire l objet d une demande de retour'], 422);
        }

        if (!$order->canBeCanceledOrReturned()) {
            return response()->json(['message' => 'La période de retour ou d annulation de 24 heures est expirée'], 422);
        }

        if ($order->returnRequests()->whereIn('status', ['pending', 'approved', 'refunded'])->exists()) {
            return response()->json(['message' => 'Une demande de retour est déjà en cours pour cette commande'], 422);
        }

        $returnRequest = ReturnRequest::create([
            'user_id' => $request->user()->id,
            'order_id' => $order->id,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        AdminNotificationService::create(
            'return_request_created',
            'Nouvelle demande de retour',
            "Demande de retour #{$returnRequest->id} pour la commande #{$order->id}",
            $returnRequest,
            $request->user()
        );

        return response()->json([
            'message' => 'Votre demande de retour a été soumise et est en attente de validation',
            'return_request' => $returnRequest,
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        $query = ReturnRequest::with(['order.user', 'order.items.product', 'user']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->order_id) {
            $query->where('order_id', $request->order_id);
        }

        $returns = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($returns);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected,refunded',
        ]);

        $returnRequest = ReturnRequest::with('order.items.product', 'order')->findOrFail($id);
        $order = $returnRequest->order;

        if ($returnRequest->status === $request->status) {
            return response()->json(['message' => 'Le statut est déjà défini'], 200);
        }

        DB::beginTransaction();
        try {
            if ($request->status === 'refunded') {
                if ($order->hasRestoredStock()) {
                    return response()->json(['message' => 'Le stock a déjà été restauré pour cette commande'], 422);
                }

                foreach ($order->items as $item) {
                    $item->product->increment('stock', $item->quantity);
                }

                $order->update([
                    'status' => $order->status === 'livree' ? 'retournee' : 'annulee',
                    'returned_at' => $order->status === 'livree' ? now() : $order->returned_at,
                    'stock_restored_at' => now(),
                ]);
            }

            $returnRequest->update([
                'status' => $request->status,
                'processed_by' => $request->user()->id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Statut de la demande de retour mis à jour',
                'return_request' => $returnRequest,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la mise à jour du statut', 'error' => $e->getMessage()], 500);
        }
    }
}
