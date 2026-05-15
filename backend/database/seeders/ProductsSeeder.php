<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        // On génère uniquement si on a déjà des categories
        $categories = Category::all();
        if ($categories->isEmpty()) {
            $this->command->warn('Aucune catégorie trouvée. Lance d’abord les migrations/seeders de base.');
            return;
        }

        // Ajoute de nouveaux produits (en plus de ceux existants dans DatabaseSeeder)
        Product::factory()
            ->count(30)
            ->create();
    }
}

