<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();
        if ($request->search) {
            $query->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('email', 'like', '%'.$request->search.'%');
        }
        return response()->json($query->orderBy('created_at','desc')->paginate(15));
    }

    public function show($id)
    {
        return response()->json(User::with(['orders'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$id,
            'role'  => 'sometimes|in:client,admin',
        ]);
        $user->update($request->only(['name','email','role','phone','address']));
        return response()->json(['message' => 'Utilisateur mis à jour', 'user' => $user]);
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    public function block($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_blocked' => !$user->is_blocked]);
        $status = $user->is_blocked ? 'bloqué' : 'débloqué';
        return response()->json(['message' => "Utilisateur $status"]);
    }
}
