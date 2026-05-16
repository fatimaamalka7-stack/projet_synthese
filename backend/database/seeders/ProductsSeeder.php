<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $vetements = Category::firstOrCreate(
            ['slug' => 'vetements'],
            [
                'name' => 'Vetements',
                'description' => 'Tous nos vetements tendance',
            ]
        );

        $chaussures = Category::firstOrCreate(
            ['slug' => 'chaussures'],
            [
                'name' => 'Chaussures',
                'description' => 'Chaussures confortables et elegantes pour chaque style',
            ]
        );

        $products = [
            [
                'name' => 'T-Shirt Premium Coton',
                'slug' => 't-shirt-premium-coton',
                'description' => 'T-shirt en coton premium, coupe moderne et confortable pour le quotidien.',
                'price' => 199.00,
                'stock' => 50,
                'matiere' => '100% coton',
                'tailles' => 'S,M,L,XL,XXL',
                'couleurs' => 'Blanc,Noir,Bleu,Rouge',
                'image' => 'https://placehold.co/600x800/f8fafc/111827?text=T-Shirt+Premium',
            ],
            [
                'name' => 'Jean Slim Stretch',
                'slug' => 'jean-slim-stretch',
                'description' => 'Jean slim stretch avec une coupe ajustee et confortable.',
                'price' => 349.00,
                'stock' => 30,
                'matiere' => '98% coton, 2% elasthanne',
                'tailles' => '36,38,40,42,44',
                'couleurs' => 'Bleu fonce,Noir,Gris',
                'image' => 'https://placehold.co/600x800/dbeafe/1e3a8a?text=Jean+Slim',
            ],
            [
                'name' => 'Veste en Lin',
                'slug' => 'veste-en-lin',
                'description' => 'Veste legere en lin, respirante et elegante pour la mi-saison.',
                'price' => 499.00,
                'stock' => 20,
                'matiere' => '100% lin',
                'tailles' => 'S,M,L,XL',
                'couleurs' => 'Beige,Blanc,Kaki',
                'image' => 'https://placehold.co/600x800/ecfccb/365314?text=Veste+Lin',
            ],
            [
                'name' => 'Robe Fleurie Elegante',
                'slug' => 'robe-fleurie-elegante',
                'description' => 'Robe legere a motifs fleuris, parfaite pour les sorties estivales.',
                'price' => 279.00,
                'stock' => 25,
                'matiere' => 'Viscose',
                'tailles' => 'XS,S,M,L',
                'couleurs' => 'Rose,Bleu,Vert',
                'image' => 'https://placehold.co/600x800/fce7f3/9d174d?text=Robe+Fleurie',
            ],
            [
                'name' => 'Pull Cachemire Doux',
                'slug' => 'pull-cachemire-doux',
                'description' => 'Pull doux et chaud, ideal pour les journees fraiches.',
                'price' => 599.00,
                'stock' => 15,
                'matiere' => 'Cachemire',
                'tailles' => 'S,M,L,XL',
                'couleurs' => 'Gris,Beige,Noir,Bordeaux',
                'image' => 'https://placehold.co/600x800/e5e7eb/374151?text=Pull+Cachemire',
            ],
            [
                'name' => 'Chemise Oxford Classic',
                'slug' => 'chemise-oxford-classic',
                'description' => 'Chemise Oxford intemporelle, adaptee au bureau et aux occasions formelles.',
                'price' => 299.00,
                'stock' => 35,
                'matiere' => '100% coton Oxford',
                'tailles' => 'S,M,L,XL,XXL',
                'couleurs' => 'Blanc,Bleu clair,Raye',
                'image' => 'https://placehold.co/600x800/e0f2fe/075985?text=Chemise+Oxford',
            ],
            [
                'name' => 'Pantalon Tailleur',
                'slug' => 'pantalon-tailleur',
                'description' => 'Pantalon tailleur chic avec une coupe droite et fluide.',
                'price' => 389.00,
                'stock' => 28,
                'matiere' => 'Polyester et viscose',
                'tailles' => '36,38,40,42,44',
                'couleurs' => 'Noir,Gris,Beige',
                'image' => 'https://placehold.co/600x800/f3f4f6/111827?text=Pantalon+Tailleur',
            ],
            [
                'name' => 'Blazer Moderne',
                'slug' => 'blazer-moderne',
                'description' => 'Blazer structure pour composer une tenue elegante en quelques secondes.',
                'price' => 549.00,
                'stock' => 18,
                'matiere' => 'Polyester recycle',
                'tailles' => 'S,M,L,XL',
                'couleurs' => 'Noir,Marine,Creme',
                'image' => 'https://placehold.co/600x800/e0e7ff/312e81?text=Blazer+Moderne',
            ],
            [
                'name' => 'Sweat Oversize',
                'slug' => 'sweat-oversize',
                'description' => 'Sweat confortable avec coupe oversize et interieur doux.',
                'price' => 259.00,
                'stock' => 42,
                'matiere' => 'Coton molletonne',
                'tailles' => 'S,M,L,XL',
                'couleurs' => 'Gris,Noir,Vert sauge',
                'image' => 'https://placehold.co/600x800/d1fae5/065f46?text=Sweat+Oversize',
            ],
            [
                'name' => 'Jupe Midi Plissee',
                'slug' => 'jupe-midi-plissee',
                'description' => 'Jupe midi plissee, elegante et facile a porter au quotidien.',
                'price' => 229.00,
                'stock' => 24,
                'matiere' => 'Polyester fluide',
                'tailles' => 'XS,S,M,L',
                'couleurs' => 'Noir,Beige,Vert',
                'image' => 'https://placehold.co/600x800/fef3c7/92400e?text=Jupe+Midi',
            ],
            [
                'name' => 'Manteau Long Laine',
                'slug' => 'manteau-long-laine',
                'description' => 'Manteau long en melange laine, chaud et raffine.',
                'price' => 799.00,
                'stock' => 12,
                'matiere' => 'Laine melangee',
                'tailles' => 'S,M,L,XL',
                'couleurs' => 'Camel,Noir,Gris',
                'image' => 'https://placehold.co/600x800/ede9fe/4c1d95?text=Manteau+Laine',
            ],
            [
                'name' => 'Short Chino',
                'slug' => 'short-chino',
                'description' => 'Short chino leger, parfait pour les looks de printemps et ete.',
                'price' => 189.00,
                'stock' => 36,
                'matiere' => 'Coton twill',
                'tailles' => '36,38,40,42,44',
                'couleurs' => 'Beige,Marine,Kaki',
                'image' => 'https://placehold.co/600x800/ccfbf1/115e59?text=Short+Chino',
            ],
        ];

        foreach ($products as $data) {
            Product::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, ['category_id' => $vetements->id])
            );
        }

        $shoes = [
            [
                'name' => 'Sneakers Urban White',
                'slug' => 'sneakers-urban-white',
                'description' => 'Sneakers blanches modernes avec semelle confortable pour un usage quotidien.',
                'price' => 449.00,
                'stock' => 45,
                'matiere' => 'Cuir synthetique',
                'tailles' => '36,37,38,39,40,41,42,43,44',
                'couleurs' => 'Blanc,Noir,Gris',
                'image' => 'https://placehold.co/600x800/f8fafc/111827?text=Sneakers+Urban',
            ],
            [
                'name' => 'Baskets Running Air',
                'slug' => 'baskets-running-air',
                'description' => 'Baskets legeres avec amorti souple, parfaites pour la marche et le sport.',
                'price' => 529.00,
                'stock' => 38,
                'matiere' => 'Mesh respirant',
                'tailles' => '37,38,39,40,41,42,43,44,45',
                'couleurs' => 'Noir,Bleu,Blanc',
                'image' => 'https://placehold.co/600x800/dbeafe/1e3a8a?text=Running+Air',
            ],
            [
                'name' => 'Mocassins Classic Cuir',
                'slug' => 'mocassins-classic-cuir',
                'description' => 'Mocassins elegants en cuir, adaptes au bureau et aux sorties habillees.',
                'price' => 499.00,
                'stock' => 26,
                'matiere' => 'Cuir veritable',
                'tailles' => '38,39,40,41,42,43,44',
                'couleurs' => 'Noir,Marron,Bleu marine',
                'image' => 'https://placehold.co/600x800/e5e7eb/374151?text=Mocassins+Cuir',
            ],
            [
                'name' => 'Boots Chelsea',
                'slug' => 'boots-chelsea',
                'description' => 'Boots Chelsea avec elastiques lateraux, faciles a porter et tres solides.',
                'price' => 679.00,
                'stock' => 20,
                'matiere' => 'Cuir',
                'tailles' => '37,38,39,40,41,42,43,44',
                'couleurs' => 'Noir,Camel,Marron',
                'image' => 'https://placehold.co/600x800/fef3c7/92400e?text=Boots+Chelsea',
            ],
            [
                'name' => 'Sandales Confort Ete',
                'slug' => 'sandales-confort-ete',
                'description' => 'Sandales legeres avec semelle anatomique pour les journees chaudes.',
                'price' => 249.00,
                'stock' => 34,
                'matiere' => 'Cuir synthetique',
                'tailles' => '36,37,38,39,40,41,42',
                'couleurs' => 'Beige,Noir,Marron',
                'image' => 'https://placehold.co/600x800/ecfccb/365314?text=Sandales+Ete',
            ],
            [
                'name' => 'Escarpins Elegance',
                'slug' => 'escarpins-elegance',
                'description' => 'Escarpins chics avec talon stable, parfaits pour les occasions speciales.',
                'price' => 399.00,
                'stock' => 22,
                'matiere' => 'Suede synthetique',
                'tailles' => '36,37,38,39,40,41',
                'couleurs' => 'Noir,Nude,Rouge',
                'image' => 'https://placehold.co/600x800/fce7f3/9d174d?text=Escarpins',
            ],
            [
                'name' => 'Derbies Business',
                'slug' => 'derbies-business',
                'description' => 'Derbies formelles avec finition soignee pour un look professionnel.',
                'price' => 589.00,
                'stock' => 18,
                'matiere' => 'Cuir pleine fleur',
                'tailles' => '39,40,41,42,43,44,45',
                'couleurs' => 'Noir,Marron',
                'image' => 'https://placehold.co/600x800/e0f2fe/075985?text=Derbies+Business',
            ],
            [
                'name' => 'Bottines Suede',
                'slug' => 'bottines-suede',
                'description' => 'Bottines en effet suede, confortables et faciles a assortir.',
                'price' => 469.00,
                'stock' => 24,
                'matiere' => 'Suede synthetique',
                'tailles' => '36,37,38,39,40,41',
                'couleurs' => 'Beige,Noir,Kaki',
                'image' => 'https://placehold.co/600x800/ede9fe/4c1d95?text=Bottines+Suede',
            ],
            [
                'name' => 'Espadrilles Toile',
                'slug' => 'espadrilles-toile',
                'description' => 'Espadrilles legeres en toile, ideales pour les looks de vacances.',
                'price' => 179.00,
                'stock' => 40,
                'matiere' => 'Toile et jute',
                'tailles' => '36,37,38,39,40,41,42,43',
                'couleurs' => 'Ecru,Marine,Rouge',
                'image' => 'https://placehold.co/600x800/ccfbf1/115e59?text=Espadrilles',
            ],
            [
                'name' => 'Tennis Casual',
                'slug' => 'tennis-casual',
                'description' => 'Tennis basses minimalistes, parfaites avec un jean ou un chino.',
                'price' => 329.00,
                'stock' => 50,
                'matiere' => 'Toile renforcee',
                'tailles' => '36,37,38,39,40,41,42,43,44',
                'couleurs' => 'Blanc,Noir,Vert',
                'image' => 'https://placehold.co/600x800/d1fae5/065f46?text=Tennis+Casual',
            ],
            [
                'name' => 'Mules Minimalistes',
                'slug' => 'mules-minimalistes',
                'description' => 'Mules simples et elegantes avec une bride confortable.',
                'price' => 219.00,
                'stock' => 31,
                'matiere' => 'Cuir synthetique',
                'tailles' => '36,37,38,39,40,41',
                'couleurs' => 'Noir,Beige,Blanc',
                'image' => 'https://placehold.co/600x800/ffe4e6/9f1239?text=Mules',
            ],
            [
                'name' => 'Chaussures Randonnee Light',
                'slug' => 'chaussures-randonnee-light',
                'description' => 'Chaussures de marche robustes avec semelle antiderapante.',
                'price' => 649.00,
                'stock' => 16,
                'matiere' => 'Textile technique',
                'tailles' => '38,39,40,41,42,43,44,45',
                'couleurs' => 'Noir,Kaki,Gris',
                'image' => 'https://placehold.co/600x800/f3f4f6/111827?text=Randonnee+Light',
            ],
        ];

        foreach ($shoes as $data) {
            Product::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, ['category_id' => $chaussures->id])
            );
        }
    }
}
