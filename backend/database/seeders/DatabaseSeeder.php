<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Utilisateurs ──────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@vetemode.com'],
            [
                'name'     => 'Administrateur',
                'password' => Hash::make('password'),
                'role'     => 'admin',
                'phone'    => '+212 6 00 00 00 00',
            ]
        );

        User::firstOrCreate(
            ['email' => 'client@vetemode.com'],
            [
                'name'     => 'Client Test',
                'password' => Hash::make('password'),
                'role'     => 'client',
                'phone'    => '+212 6 11 22 33 44',
                'address'  => '12 Rue Mohammed V, Casablanca',
            ]
        );

        // ── Catégories ────────────────────────────────────────────────────────
        $vetements   = Category::firstOrCreate(
            ['name' => 'Vêtements'],
            ['slug' => 'vetements', 'description' => 'Tous nos vêtements tendance']
        );
        $chaussures  = Category::firstOrCreate(
            ['name' => 'Chaussures'],
            ['slug' => 'chaussures', 'description' => 'Nos chaussures pour homme et femme']
        );
        $accessoires = Category::firstOrCreate(
            ['name' => 'Accessoires'],
            ['slug' => 'accessoires', 'description' => 'Sacs, ceintures, écharpes…']
        );

        // ── Produits ──────────────────────────────────────────────────────────
        $products = [
            // Vêtements
            [
                'name'        => 'T-Shirt Premium Coton',
                'slug'        => 't-shirt-premium-coton',
                'description' => 'T-shirt en coton premium, coupe moderne et confortable. Idéal pour toutes les occasions du quotidien.',
                'price'       => 199.00,
                'stock'       => 50,
                'category_id' => $vetements->id,
                'matiere'     => '100% Coton',
                'tailles'     => 'S,M,L,XL,XXL',
                'couleurs'    => 'Blanc,Noir,Bleu,Rouge',
                'image'       => 'https://placehold.co/600x800?text=T-Shirt+Premium+Coton',
            ],
            [
                'name'        => 'Jean Slim Stretch',
                'slug'        => 'jean-slim-stretch',
                'description' => 'Jean slim stretch, idéal pour toutes les occasions. Coupe élancée qui s\'adapte parfaitement à votre silhouette.',
                'price'       => 349.00,
                'stock'       => 30,
                'category_id' => $vetements->id,
                'matiere'     => '98% Coton, 2% Élasthanne',
                'tailles'     => '36,38,40,42,44',
                'couleurs'    => 'Bleu foncé,Noir,Gris',
                'image'       => 'https://placehold.co/600x800?text=Jean+Slim+Stretch',
            ],
            [
                'name'        => 'Veste en Lin',
                'slug'        => 'veste-en-lin',
                'description' => 'Veste légère en lin, parfaite pour l\'été. Respirante et élégante, elle s\'associe facilement à toute tenue.',
                'price'       => 499.00,
                'stock'       => 20,
                'category_id' => $vetements->id,
                'matiere'     => '100% Lin',
                'tailles'     => 'S,M,L,XL',
                'couleurs'    => 'Beige,Blanc,Kaki',
                'image'       => 'https://placehold.co/600x800?text=Veste+en+Lin',
            ],
            [
                'name'        => 'Robe Fleurie Élégante',
                'slug'        => 'robe-fleurie-elegante',
                'description' => 'Robe légère à motifs fleuris, élégante et féminine. Parfaite pour les sorties estivales.',
                'price'       => 279.00,
                'stock'       => 25,
                'category_id' => $vetements->id,
                'matiere'     => 'Viscose',
                'tailles'     => 'XS,S,M,L',
                'couleurs'    => 'Rose,Bleu,Vert',
                'image'       => 'https://placehold.co/600x800?text=Robe+Fleurie+Élégante',
            ],
            [
                'name'        => 'Pull Cachemire Doux',
                'slug'        => 'pull-cachemire-doux',
                'description' => 'Pull en cachemire d\'une douceur exceptionnelle. Chaud en hiver, léger en mi-saison.',
                'price'       => 599.00,
                'stock'       => 15,
                'category_id' => $vetements->id,
                'matiere'     => '100% Cachemire',
                'tailles'     => 'S,M,L,XL',
                'couleurs'    => 'Gris,Beige,Noir,Bordeaux',
                'image'       => 'https://placehold.co/600x800?text=Pull+Cachemire+Doux',
            ],
            [
                'name'        => 'Chemise Oxford Classic',
                'slug'        => 'chemise-oxford-classic',
                'description' => 'Chemise Oxford intemporelle, coupe droite. Parfaite pour le bureau ou les occasions formelles.',
                'price'       => 299.00,
                'stock'       => 35,
                'category_id' => $vetements->id,
                'matiere'     => '100% Coton Oxford',
                'tailles'     => 'S,M,L,XL,XXL',
                'couleurs'    => 'Blanc,Bleu clair,Rayé',
                'image'       => 'https://placehold.co/600x800?text=Chemise+Oxford+Classic',
            ],
            // Chaussures
            [
                'name'        => 'Sneakers Urban Style',
                'slug'        => 'sneakers-urban-style',
                'description' => 'Sneakers modernes pour un look urbain tendance. Semelle confortable pour une utilisation quotidienne.',
                'price'       => 599.00,
                'stock'       => 40,
                'category_id' => $chaussures->id,
                'matiere'     => 'Cuir synthétique',
                'tailles'     => '38,39,40,41,42,43,44,45',
                'couleurs'    => 'Blanc,Noir,Gris',
                'image'       => 'https://placehold.co/600x800?text=Sneakers+Urban+Style',
            ],
            [
                'name'        => 'Boots Cuir Véritable',
                'slug'        => 'boots-cuir-veritable',
                'description' => 'Boots en cuir véritable, confortables et durables. Un classique intemporel pour homme et femme.',
                'price'       => 899.00,
                'stock'       => 15,
                'category_id' => $chaussures->id,
                'matiere'     => 'Cuir véritable',
                'tailles'     => '37,38,39,40,41,42,43',
                'couleurs'    => 'Marron,Noir',
                'image'       => 'https://placehold.co/600x800?text=Boots+Cuir+Véritable',
            ],
            [
                'name'        => 'Mocassins Classiques',
                'slug'        => 'mocassins-classiques',
                'description' => 'Mocassins classiques en cuir, parfaits pour le bureau. Élégants et confortables toute la journée.',
                'price'       => 449.00,
                'stock'       => 22,
                'category_id' => $chaussures->id,
                'matiere'     => 'Cuir pleine fleur',
                'tailles'     => '38,39,40,41,42,43,44',
                'couleurs'    => 'Marron,Noir,Bleu marine',
                'image'       => 'https://placehold.co/600x800?text=Mocassins+Classiques',
            ],
            [
                'name'        => 'Sandales Confort Été',
                'slug'        => 'sandales-confort-ete',
                'description' => 'Sandales légères et confortables, idéales pour les journées d\'été. Semelle anatomique.',
                'price'       => 249.00,
                'stock'       => 35,
                'category_id' => $chaussures->id,
                'matiere'     => 'Cuir synthétique',
                'tailles'     => '36,37,38,39,40,41',
                'couleurs'    => 'Beige,Marron,Noir',
                'image'       => 'https://placehold.co/600x800?text=Sandales+Confort+Été',
            ],
            // Accessoires
            [
                'name'        => 'Sac à Main Élégant',
                'slug'        => 'sac-a-main-elegant',
                'description' => 'Sac à main en cuir synthétique de qualité, grande capacité avec plusieurs compartiments.',
                'price'       => 299.00,
                'stock'       => 35,
                'category_id' => $accessoires->id,
                'matiere'     => 'Cuir synthétique',
                'tailles'     => 'Unique',
                'couleurs'    => 'Noir,Marron,Beige,Rouge',
                'image'       => 'https://placehold.co/600x800?text=Sac+à+Main+Élégant',
            ],
            [
                'name'        => 'Ceinture en Cuir',
                'slug'        => 'ceinture-en-cuir',
                'description' => 'Ceinture en cuir véritable avec boucle dorée. Accessoire indispensable pour compléter votre tenue.',
                'price'       => 149.00,
                'stock'       => 60,
                'category_id' => $accessoires->id,
                'matiere'     => 'Cuir véritable',
                'tailles'     => '80,85,90,95,100',
                'couleurs'    => 'Noir,Marron',
                'image'       => 'https://placehold.co/600x800?text=Ceinture+en+Cuir',
            ],
            [
                'name'        => 'Écharpe Cachemire Douce',
                'slug'        => 'echarpe-cachemire-douce',
                'description' => 'Écharpe en pur cachemire, incroyablement douce et chaude. Un luxe abordable pour les saisons froides.',
                'price'       => 249.00,
                'stock'       => 45,
                'category_id' => $accessoires->id,
                'matiere'     => '100% Cachemire',
                'tailles'     => 'Unique',
                'couleurs'    => 'Gris,Beige,Rouge,Bleu,Noir',
                'image'       => 'https://placehold.co/600x800?text=Écharpe+Cachemire+Douce',
            ],
        ];

        foreach ($products as $data) {
            Product::firstOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }

        // ── Produits supplémentaires via factory ───────────────────────────────
        $this->call(ProductsSeeder::class);

        // ── Coupon de démonstration ───────────────────────────────────────────
        \App\Models\Coupon::firstOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type'             => 'percent',
                'value'            => 10,
                'min_order_amount' => 200,
                'max_uses'         => 100,
                'is_active'        => true,
                'expires_at'       => now()->addYear(),
            ]
        );

        \App\Models\Coupon::firstOrCreate(
            ['code' => 'REDUCTION50'],
            [
                'type'             => 'fixed',
                'value'            => 50,
                'min_order_amount' => 500,
                'is_active'        => true,
                'expires_at'       => now()->addMonths(6),
            ]
        );

        \App\Models\LoyaltySetting::firstOrCreate(
            ['id' => 1],
            [
                'points_per_currency' => 1.00,
                'point_value' => 0.10,
            ]
        );
    }
}
