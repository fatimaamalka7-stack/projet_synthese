<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserArchive;
use Illuminate\Http\Request;
use App\Services\AdminNotificationService;
use App\Services\UserArchiveService;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount('orders');
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
        $oldRole = $user->role;
        $user->update($request->only(['name','email','role','phone','address']));

        if ($oldRole !== 'admin' && $user->role === 'admin') {
            AdminNotificationService::create(
                'admin_created',
                'Nouvel administrateur',
                "{$request->user()->name} a donne le role administrateur a {$user->name}.",
                $user,
                $request->user()
            );
        }
        return response()->json(['message' => 'Utilisateur mis à jour', 'user' => $user]);
    }

    public function destroy($id, Request $request)
    {
        $user = User::withCount('orders')->findOrFail($id);
        if ($user->orders_count > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer cet utilisateur car il possède des commandes.'
            ], 422);
        }

        // Archive l'utilisateur avant suppression
        UserArchiveService::archive(
            $user,
            $request->user()?->email,
            $request->input('reason', 'Suppression standard')
        );

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé et archivé']);
    }

    public function block($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_blocked' => !$user->is_blocked]);
        $status = $user->is_blocked ? 'bloqué' : 'débloqué';
        return response()->json(['message' => "Utilisateur $status"]);
    }

    /**
     * Récupère les archives d'utilisateurs supprimés
     */
    public function listArchives(Request $request)
    {
        $search = $request->input('search');
        $archives = UserArchiveService::getArchives($search, 15);
        return response()->json($archives);
    }

    /**
     * Récupère une archive spécifique
     */
    public function showArchive($id)
    {
        $archive = UserArchiveService::getArchive($id);
        return response()->json($archive);
    }

    /**
     * Restaure un utilisateur depuis une archive
     */
    public function restoreArchive($id, Request $request)
    {
        $archive = UserArchiveService::getArchive($id);
        
        // Vérifie que l'email n'existe pas déjà
        if (User::where('email', $archive->email)->exists()) {
            return response()->json([
                'message' => 'Un utilisateur avec cet email existe déjà.'
            ], 422);
        }

        $user = UserArchiveService::restore($archive);
        
        return response()->json([
            'message' => 'Utilisateur restauré avec succès',
            'user' => $user
        ]);
    }

    /**
     * Supprime définitivement une archive
     */
    public function deleteArchive($id)
    {
        $archive = UserArchiveService::getArchive($id);
        UserArchiveService::deleteArchive($archive);
        
        return response()->json(['message' => 'Archive supprimée définitivement']);
    }
}
