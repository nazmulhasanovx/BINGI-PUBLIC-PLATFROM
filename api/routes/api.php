<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Public;
use Illuminate\Support\Facades\Route;

/*
| BinGi public-site API — v1. Full list with examples: docs/05-admin/API.md
| Roles: owner (everything) · editor (content + SEO + media) · sales (leads + visitors)
*/
Route::prefix('v1')->group(function () {
    // ---- Public (the website) ----
    Route::prefix('public')->group(function () {
        Route::get('content', Public\ContentController::class);
        Route::post('leads', Public\LeadSubmitController::class)->middleware('throttle:leads');
        Route::post('events', Public\EventController::class)->middleware('throttle:events');
    });

    // ---- Auth ----
    Route::post('auth/login', [Admin\AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('auth/forgot', [Admin\AuthController::class, 'forgot'])->middleware('throttle:5,1');
    Route::post('auth/reset', [Admin\AuthController::class, 'reset'])->middleware('throttle:5,1');

    // ---- Admin (Bearer token) ----
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [Admin\AuthController::class, 'logout']);
        Route::get('auth/me', [Admin\AuthController::class, 'show']);
        Route::post('auth/password', [Admin\AuthController::class, 'password']);
        Route::get('dashboard', Admin\DashboardController::class)->middleware('role:owner,editor,sales');

        Route::middleware('role:owner,sales')->group(function () {
            Route::get('leads', [Admin\LeadController::class, 'index']);
            Route::get('leads/export', [Admin\LeadController::class, 'export']);
            Route::get('leads/{lead}', [Admin\LeadController::class, 'show']);
            Route::patch('leads/{lead}', [Admin\LeadController::class, 'update']);
            Route::post('leads/{lead}/notes', [Admin\LeadController::class, 'note']);
            Route::get('analytics/overview', [Admin\AnalyticsController::class, 'overview']);
            Route::get('analytics/page', [Admin\AnalyticsController::class, 'page']);
        });

        Route::middleware('role:owner,editor')->group(function () {
            Route::get('types', [Admin\EntryController::class, 'types']);
            Route::get('entries/{type}', [Admin\EntryController::class, 'index']);
            Route::post('entries/{type}', [Admin\EntryController::class, 'store']);
            Route::post('entries/{type}/reorder', [Admin\EntryController::class, 'reorder']);
            Route::get('entries/{type}/{entry}', [Admin\EntryController::class, 'show']);
            Route::patch('entries/{type}/{entry}', [Admin\EntryController::class, 'update']);
            Route::delete('entries/{type}/{entry}', [Admin\EntryController::class, 'destroy']);

            Route::get('media', [Admin\MediaController::class, 'index']);
            Route::post('media', [Admin\MediaController::class, 'store']);
            Route::patch('media/{media}', [Admin\MediaController::class, 'update']);
            Route::delete('media/{media}', [Admin\MediaController::class, 'destroy']);

            Route::get('seo/pages', [Admin\SeoController::class, 'pages']);
            Route::post('seo/pages', [Admin\SeoController::class, 'savePage']);
            Route::patch('seo/pages/{page}', [Admin\SeoController::class, 'savePage']);
            Route::delete('seo/pages/{page}', [Admin\SeoController::class, 'deletePage']);
            Route::get('seo/redirects', [Admin\SeoController::class, 'redirects']);
            Route::post('seo/redirects', [Admin\SeoController::class, 'saveRedirect']);
            Route::patch('seo/redirects/{redirect}', [Admin\SeoController::class, 'saveRedirect']);
            Route::delete('seo/redirects/{redirect}', [Admin\SeoController::class, 'deleteRedirect']);

            Route::get('publish/pending', [Admin\PublishController::class, 'pending']);
            Route::get('publish/preview', [Admin\PublishController::class, 'preview']);
            Route::get('snapshots', [Admin\PublishController::class, 'history']);
            Route::get('snapshots/{snapshot}', [Admin\PublishController::class, 'show']);
        });

        Route::middleware('role:owner')->group(function () {
            Route::post('publish', [Admin\PublishController::class, 'publish']);
            Route::post('snapshots/{snapshot}/rollback', [Admin\PublishController::class, 'rollback']);
            Route::get('users', [Admin\UserController::class, 'index']);
            Route::post('users', [Admin\UserController::class, 'store']);
            Route::patch('users/{user}', [Admin\UserController::class, 'update']);
            Route::get('audit', [Admin\AuditController::class, 'index']);
        });
    });
});
