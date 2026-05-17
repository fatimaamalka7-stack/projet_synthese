<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $locale = $request->header('X-Locale') ?: $request->header('Accept-Language');

        if ($locale) {
            $locale = strtolower(substr($locale, 0, 2));
        }

        if (!in_array($locale, ['fr', 'en'])) {
            $locale = 'fr';
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
