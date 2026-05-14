<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

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
        $category = Category::create(['name' => $request->name]);
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
