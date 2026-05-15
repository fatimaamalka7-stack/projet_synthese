<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Hash;
use App\Models\User;

$user = User::firstOrCreate(
    ['email' => 'admin@vetemode.com'],
    [
        'name'     => 'Administrateur',
        'password' => Hash::make('password'),
        'role'     => 'admin',
        'phone'    => '+212 6 00 00 00 00',
    ]
);

echo "Admin user created or already exists.\n";
echo "Email: admin@vetemode.com\n";
echo "Password: password\n";
echo "Role: " . $user->role . "\n";
