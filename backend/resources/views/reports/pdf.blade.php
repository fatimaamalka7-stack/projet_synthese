<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Rapport financier</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; margin: 0; color: #333; background: #fff; }
        .page { padding: 32px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .brand { color: #7C4A32; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
        .tagline { font-size: 12px; color: #8B7A6A; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { color: #7C4A32; font-size: 16px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: .08em; }
        .small-text { font-size: 11px; color: #7d7d7d; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .card { background: #faf7f3; border: 1px solid #eee5df; border-radius: 18px; padding: 16px; }
        .card strong { display: block; font-size: 18px; margin-bottom: 6px; color: #212121; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { padding: 10px 12px; border-bottom: 1px solid #e8e3de; font-size: 11px; }
        .table th { text-align: left; color: #7c4a32; text-transform: uppercase; letter-spacing: .08em; }
        .table td { color: #4b4b4b; }
        .bar { height: 10px; border-radius: 999px; background: #7C4A32; }
        .bar-bg { background: #e7e0da; border-radius: 999px; overflow: hidden; }
        .footer { margin-top: 28px; font-size: 11px; color: #7d7d7d; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div>
                <div class="brand">VêteMode</div>
                <div class="tagline">Rapport financier professionnel</div>
            </div>
            <div class="small-text">Généré le {{ $dateGenerated->format('d/m/Y H:i') }}</div>
        </div>

        <div class="section">
            <div class="section-title">Résumé du rapport</div>
            <div class="grid">
                <div class="card">
                    <strong>{{ number_format($summary['total_revenue'], 2, ',', ' ') }} DH</strong>
                    Chiffre d’affaires total
                </div>
                <div class="card">
                    <strong>{{ $summary['total_orders'] }}</strong>
                    Commandes totales
                </div>
                <div class="card">
                    <strong>{{ $summary['total_products_sold'] }}</strong>
                    Produits vendus
                </div>
                <div class="card">
                    <strong>{{ $summary['total_users'] }}</strong>
                    Utilisateurs inscrits
                </div>
                <div class="card">
                    <strong>{{ number_format($summary['recent_revenue'], 2, ',', ' ') }} DH</strong>
                    Revenus récents (30 jours)
                </div>
                <div class="card">
                    <strong>{{ $summary['revenue_evolution'] !== null ? $summary['revenue_evolution'].'%' : 'N/A' }}</strong>
                    Évolution des revenus
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Période</div>
            <p>{{ $periodLabel }}</p>
        </div>

        <div class="section">
            <div class="section-title">Chiffre d’affaires par mois</div>
            @php $maxRevenue = max(array_column($monthly, 'revenue') ?: [1]); @endphp
            <table class="table">
                <thead>
                    <tr>
                        <th>Mois</th>
                        <th>Revenus</th>
                        <th>Commandes</th>
                        <th>Évolution</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($monthly as $item)
                    <tr>
                        <td>{{ $item['label'] }}</td>
                        <td>{{ number_format($item['revenue'], 2, ',', ' ') }} DH</td>
                        <td>{{ $item['orders'] }}</td>
                        <td>
                            <div class="bar-bg">
                                <div class="bar" style="width: {{ $maxRevenue > 0 ? min(100, intval(($item['revenue'] / $maxRevenue) * 100)) : 0 }}%;"></div>
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Produits les plus vendus</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Revenus</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($topProducts as $product)
                    <tr>
                        <td>{{ $product['name'] }}</td>
                        <td>{{ $product['total_sold'] }}</td>
                        <td>{{ number_format($product['revenue'], 2, ',', ' ') }} DH</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Catégories les plus vendues</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Catégorie</th>
                        <th>Quantité</th>
                        <th>Revenus</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($topCategories as $category)
                    <tr>
                        <td>{{ $category['name'] }}</td>
                        <td>{{ $category['total_sold'] }}</td>
                        <td>{{ number_format($category['revenue'], 2, ',', ' ') }} DH</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="footer">
            Rapport généré automatiquement par VêteMode. Les données sont basées sur les commandes confirmées et les paiements valides.
        </div>
    </div>
</body>
</html>
