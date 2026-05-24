# 📋 Système d'Archivage des Utilisateurs Supprimés

## 🎯 Vue d'ensemble

Le système d'archivage permet de conserver une trace complète des utilisateurs supprimés sans perdre aucune donnée. Au lieu de supprimer directement un utilisateur de la base de données, le système crée une archive avec toutes ses informations avant la suppression.

## 🔧 Composants Implémentés

### 1. **Base de Données - Migration**
**Fichier:** `backend/database/migrations/2026_05_22_create_user_archives_table.php`

Table `user_archives` contenant:
- `original_user_id`: ID original de l'utilisateur
- `name`, `email`, `password`: Données personnelles
- `role`, `phone`, `address`, `avatar`: Informations additionnelles
- `is_blocked`: Statut de blocage
- `metadata`: JSON avec données contextuelles (nombre de commandes, avis, etc.)
- `archived_at`: Date d'archivage
- `archived_by`: Email de l'admin qui a archivé
- `reason`: Raison de l'archivage

### 2. **Modèle - UserArchive**
**Fichier:** `backend/app/Models/UserArchive.php`

Modèle Eloquent représentant une archive utilisateur avec les relations et casts appropriés.

### 3. **Service - UserArchiveService**
**Fichier:** `backend/app/Services/UserArchiveService.php`

Service centralisé avec les méthodes:
- `archive()`: Archive un utilisateur avant suppression
- `getArchives()`: Récupère la liste des archives (avec recherche)
- `getArchive()`: Récupère une archive spécifique
- `restore()`: Restaure un utilisateur depuis une archive
- `deleteArchive()`: Supprime une archive définitivement
- `deleteOldArchives()`: Supprime les archives de plus de X jours

### 4. **Contrôleur - UserController Amélioré**
**Fichier:** `backend/app/Http/Controllers/API/UserController.php`

Nouvelles actions:
- `destroy()`: Modifiée pour archiver avant suppression
- `listArchives()`: Liste les archives d'utilisateurs
- `showArchive()`: Affiche les détails d'une archive
- `restoreArchive()`: Restaure un utilisateur depuis une archive
- `deleteArchive()`: Supprime une archive définitivement

### 5. **Routes API**
**Fichier:** `backend/routes/api.php`

Nouvelles routes ajoutées:
```
GET  /admin/users-archives              - Liste les archives
GET  /admin/users-archives/{id}         - Affiche une archive
POST /admin/users-archives/{id}/restore - Restaure un utilisateur
DELETE /admin/users-archives/{id}       - Supprime une archive
```

### 6. **Interface Utilisateur - UserArchives Component**
**Fichier:** `frontend/src/pages/Admin/UserArchives.jsx`

Page admin complète avec:
- 🔍 Recherche par nom/email
- 📋 Liste des utilisateurs archivés
- 🔍 Affichage détaillé d'une archive
- ♻️ Bouton de restauration
- 🗑️ Suppression définitive
- 📊 Métadonnées (nombre de commandes, avis, etc.)

### 7. **Navigation - AdminLayout**
**Fichier:** `frontend/src/components/Layout/AdminLayout.jsx`

Lien ajouté dans la sidebar pour accéder à la page des archives.

### 8. **Routes Frontend**
**Fichier:** `frontend/src/App.jsx`

Route ajoutée: `/admin/utilisateurs-archives`

## 🚀 Utilisation

### Pour l'Admin

1. **Supprimer un utilisateur**
   - Accéder à "Gestion des utilisateurs"
   - Cliquer sur "Supprimer" (remplace l'action directe)
   - L'utilisateur est archivé automatiquement
   - Une notification confirme l'archivage

2. **Consulter les archives**
   - Aller à "Archives" dans la sidebar
   - Chercher par nom ou email
   - Cliquer sur un utilisateur pour voir les détails

3. **Restaurer un utilisateur**
   - Sélectionner l'archive
   - Cliquer "Restaurer"
   - L'utilisateur est recréé avec ses données originales

4. **Supprimer définitivement une archive**
   - Sélectionner l'archive
   - Cliquer "Supprimer définitivement"
   - Confirmation requise

### Pour le Développement

```php
// Archiver un utilisateur manuellement
use App\Services\UserArchiveService;
use App\Models\User;

$user = User::find($id);
UserArchiveService::archive($user, 'admin@example.com', 'Raison personnalisée');
$user->delete();

// Récupérer les archives
$archives = UserArchiveService::getArchives('search term', 15);

// Restaurer un utilisateur
$archive = UserArchiveService::getArchive($archiveId);
$restoredUser = UserArchiveService::restore($archive);

// Nettoyer les archives de plus de 90 jours
$deleted = UserArchiveService::deleteOldArchives(90);
```

## 📊 Métadonnées Conservées

Chaque archive conserve dans le champ `metadata`:
- Nombre de commandes effectuées
- Nombre d'avis postés
- Existence d'un panier
- Date de création du compte
- Date de dernière modification

## 🔐 Sécurité

- ✅ Les mots de passe sont conservés hashés
- ✅ Les emails archivés restent uniques pour éviter les conflits
- ✅ Validation avant restauration (email non existant)
- ✅ Logging de toutes les actions d'archivage/restauration
- ✅ Protection par AdminMiddleware sur les routes

## 📝 Logging

Toutes les opérations sont loggées dans `storage/logs/laravel.log`:
- Archivage réussi
- Restauration réussie
- Erreurs lors de l'archivage

## 🗑️ Maintenance

Pour nettoyer les archives anciennes (plus de 90 jours), créer un job planifié:

```php
// In a scheduler or command
UserArchiveService::deleteOldArchives(90); // 90 jours
```

## 🎨 Interface Admin

L'interface offre:
- Design moderne et responsive
- Affichage des dates formatées en français
- Icons pour l'identification rapide
- Confirmations de sécurité pour les actions critiques
- Notifications toast pour le retour utilisateur
- Mode sombre supporté

## ✨ Améliorations Futures

- [ ] Export des archives en CSV/PDF
- [ ] Audit trail complet (qui, quand, pourquoi)
- [ ] Blocage à la rétention de données
- [ ] Système de raison d'archivage prédéfinies
- [ ] Recherche avancée par date/raison
- [ ] Statistiques d'archivage
