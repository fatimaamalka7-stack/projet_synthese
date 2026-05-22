<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\AdminNotificationService;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::withCount('products')->get());
    }

    public function products($id)
    {
        $category = Category::with(['products' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        return response()->json($category);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:100|unique:categories']);
        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(6),
        ]);

        AdminNotificationService::create(
            'category_created',
            'Categorie ajoutee',
            "{$request->user()->name} a ajoute la categorie {$category->name}.",
            $category,
            $request->user()
        );
        return response()->json(['message' => 'Catégorie créée', 'category' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $request->validate(['name' => 'required|string|max:100|unique:categories,name,'.$id]);
        $category->update(['name' => $request->name]);
        return response()->json(['message' => 'Catégorie mise à jour', 'category' => $category]);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Catégorie supprimée']);
    }
}
