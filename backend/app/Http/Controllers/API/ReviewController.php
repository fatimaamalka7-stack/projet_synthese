<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use App\Services\AdminNotificationService;

class ReviewController extends Controller
{
    public function index($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->with('user:id,name,avatar')
            ->where('is_validated', true)
            ->orderBy('created_at', 'desc')
            ->get();

        $avg = $reviews->avg('rating');

        return response()->json(['reviews' => $reviews, 'average' => round($avg, 1)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'required|string|max:1000',
        ]);

        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà laissé un avis pour ce produit'], 422);
        }

        $review = Review::create([
            'user_id'      => $request->user()->id,
            'product_id'   => $request->product_id,
            'rating'       => $request->rating,
            'comment'      => $request->comment,
            'is_validated' => false,
        ]);

        $review->load('product:id,name');

        AdminNotificationService::create(
            'review_created',
            'Nouvel avis client',
            "{$request->user()->name} a ajoute un avis {$review->rating}/5 sur {$review->product?->name}.",
            $review,
            $request->user()
        );

        return response()->json(['message' => 'Avis soumis, en attente de validation', 'review' => $review], 201);
    }

    public function destroy(Request $request, $id)
    {
        $review = Review::findOrFail($id);

        $isOwner = $review->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';

        if (!$isOwner && !$isAdmin) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $review->delete();
        return response()->json(['message' => 'Avis supprimé']);
    }

    public function adminIndex()
    {
        $reviews = Review::with(['user:id,name', 'product:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reviews);
    }

    public function validate($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_validated' => !$review->is_validated]);
        return response()->json(['message' => 'Statut mis à jour', 'review' => $review]);
    }
}
