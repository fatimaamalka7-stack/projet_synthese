<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $categoryIds = Category::pluck('id')->all();
        $categoryId = $categoryIds ? $this->faker->randomElement($categoryIds) : null;

        $materials = ['Coton', 'Lin', 'Laine', 'Cachemire', 'Polyester', 'Cuir synthétique', 'Cuir véritable', 'Viscose'];
        $sizes = ['XS,S,M,L', 'S,M,L,XL', '36,38,40,42,44', '37,38,39,40,41,42,43,44,45', 'Unique', '80,85,90,95,100'];
        $colors = ['Marron,Noir,Blanc,Gris', 'Noir,Gris', 'Blanc,Noir', 'Marron,Beige,Noir', 'Gris,Blanc', 'Noir,Marron', 'Blanc,Gris'];

        $name = $this->faker->words(3, true);

        return [
            'name' => ucfirst($name),
            'slug' => $this->faker->unique()->slug(3),
            'description' => $this->faker->sentence(18),
            'price' => $this->faker->numberBetween(99, 999) + ($this->faker->numberBetween(0, 99) / 100),
            'stock' => $this->faker->numberBetween(0, 100),
            'category_id' => $categoryId,
            'image' => null,
            'matiere' => $this->faker->randomElement($materials),
            'tailles' => $this->faker->randomElement($sizes),
            'couleurs' => $this->faker->randomElement($colors),
        ];
    }
}

