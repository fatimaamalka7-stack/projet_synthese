<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Services\AdminNotificationService;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'reviews']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($request->sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // If a per_page is provided, return a paginated response (frontend expects pagination format)
        if ($request->filled('per_page')) {
            $perPage = intval($request->per_page) ?: 12;
            $products = $query->paginate($perPage);
            return response()->json($products);
        }

        // Otherwise return all products wrapped in a `data` key so frontend using `r.data.data` works
        $products = $query->get();
        return response()->json(['data' => $products]);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'reviews.user'])
            ->findOrFail($id);

        $similar = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $id)
            ->limit(4)
            ->get();

        return response()->json([
            'product' => $product,
            'similar' => $similar,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'matiere'     => 'nullable|string|max:255',
            'tailles'     => 'nullable|string',
            'couleurs'    => 'nullable|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name) . '-' . Str::random(6),
            'description' => $request->description,
            'price'       => $request->price,
            'stock'       => $request->stock,
            'category_id' => $request->category_id,
            'matiere'     => $request->matiere,
            'tailles'     => $request->tailles,
            'couleurs'    => $request->couleurs,
            'image'       => $imagePath,
        ]);

        AdminNotificationService::create(
            'product_created',
            'Produit ajoute',
            "{$request->user()->name} a ajoute le produit {$product->name}.",
            $product,
            $request->user()
        );

        return response()->json(['message' => 'Produit créé', 'product' => $product], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'matiere'     => 'nullable|string|max:255',
            'tailles'     => 'nullable|string',
            'couleurs'    => 'nullable|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $product->image = $request->file('image')->store('products', 'public');
        }

        $product->fill($request->except('image'));
        $product->save();

        return response()->json(['message' => 'Produit mis à jour', 'product' => $product]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Produit supprimé']);
    }
}
