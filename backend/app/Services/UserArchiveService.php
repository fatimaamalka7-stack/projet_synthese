<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserArchive;
use Illuminate\Support\Facades\Log;

class UserArchiveService
{
    /**
     * Archive un utilisateur avant sa suppression
     * Conserve toutes les données importantes dans la table user_archives
     */
    public static function archive(User $user, ?string $archivedBy = null, ?string $reason = null): UserArchive
    {
        try {
            $archive = UserArchive::create([
                'original_user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'password' => $user->password,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'avatar' => $user->avatar,
                'is_blocked' => $user->is_blocked,
                'metadata' => [
                    'orders_count' => $user->orders()->count(),
                    'reviews_count' => $user->reviews()->count(),
                    'has_cart' => $user->cart()->exists(),
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ],
                'archived_by' => $archivedBy,
                'reason' => $reason,
            ]);

            Log::info("User archived successfully", [
                'user_id' => $user->id,
                'email' => $user->email,
                'archived_by' => $archivedBy,
                'reason' => $reason,
            ]);

            return $archive;
        } catch (\Exception $e) {
            Log::error("Failed to archive user", [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Récupère les archives d'utilisateurs
     */
    public static function getArchives($search = null, $limit = 15)
    {
        $query = UserArchive::query();

        if ($search) {
            $query->where('name', 'like', '%'.$search.'%')
                  ->orWhere('email', 'like', '%'.$search.'%');
        }

        return $query->orderBy('archived_at', 'desc')->paginate($limit);
    }

    /**
     * Récupère une archive spécifique
     */
    public static function getArchive($id)
    {
        return UserArchive::findOrFail($id);
    }

    /**
     * Restaure un utilisateur depuis l'archive
     * (Optionnel - utile pour un système de "undelete")
     */
    public static function restore(UserArchive $archive): User
    {
        $user = User::create([
            'name' => $archive->name,
            'email' => $archive->email,
            'password' => $archive->password,
            'role' => $archive->role,
            'phone' => $archive->phone,
            'address' => $archive->address,
            'avatar' => $archive->avatar,
            'is_blocked' => $archive->is_blocked,
        ]);

        Log::info("User restored from archive", [
            'archive_id' => $archive->id,
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return $user;
    }

    /**
     * Supprime définitivement une archive (après X jours par exemple)
     */
    public static function deleteArchive(UserArchive $archive): bool
    {
        return $archive->delete();
    }

    /**
     * Supprime les archives de plus de X jours
     */
    public static function deleteOldArchives($days = 90): int
    {
        $deleted = UserArchive::where('archived_at', '<', now()->subDays($days))->delete();
        Log::info("Old user archives deleted", ['count' => $deleted, 'days' => $days]);
        return $deleted;
    }
}
