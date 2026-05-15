<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Hash;
use App\Models\User;

// Supprimer l'ancien admin s'il existe
User::where('email', 'admin@vetemode.com')->delete();

// Créer un nouvel admin avec mot de passe simple
$user = User::create([
    'name'     => 'Administrateur',
    'email'    => 'admin@vetemode.com',
    'password' => Hash::make('password'),
    'role'     => 'admin',
    'phone'    => '+212 6 00 00 00 00',
    'is_blocked' => false,
]);

echo "Admin user recreated successfully!\n";
echo "Email: admin@vetemode.com\n";
echo "Password: password\n";
echo "Role: " . $user->role . "\n";
echo "Blocked: " . ($user->is_blocked ? 'Yes' : 'No') . "\n";

// Vérifier que le mot de passe fonctionne
$checkPassword = Hash::check('password', $user->password);
echo "Password verification: " . ($checkPassword ? 'SUCCESS' : 'FAILED') . "\n";
