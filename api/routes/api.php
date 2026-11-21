<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Public;
use Illuminate\Support\Facades\Route;

/*
| BinGi public-site API — v1. Full list with examples: docs/05-admin/API.md
| Access: per module (none / view / edit) from the user's role — owner has everything; roles are built in the admin
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
        Route::get('dashboard', Admin\DashboardController::class);
        Route::get('modules', [Admin\RoleController::class, 'modules']);

        // Access per module comes from the user's role (Users & roles → Roles). Module ids: packages/content/modules.json
        Route::get('leads', [Admin\LeadController::class, 'index'])->middleware('perm:M03,view');
        Route::get('leads/export', [Admin\LeadController::class, 'export'])->middleware('perm:M03,edit');
        Route::get('leads/{lead}', [Admin\LeadController::class, 'show'])->middleware('perm:M03,view');
        Route::patch('leads/{lead}', [Admin\LeadController::class, 'update'])->middleware('perm:M03,edit');
        Route::post('leads/{lead}/notes', [Admin\LeadController::class, 'note'])->middleware('perm:M03,edit');
        Route::get('analytics/overview', [Admin\AnalyticsController::class, 'overview'])->middleware('perm:M04,view');
        Route::get('analytics/page', [Admin\AnalyticsController::class, 'page'])->middleware('perm:M04,view');

        // Content: the module of each type (types.json) decides view / edit — checked inside EntryController
        Route::get('types', [Admin\EntryController::class, 'types']);
        Route::get('entries/{type}', [Admin\EntryController::class, 'index']);
        Route::post('entries/{type}', [Admin\EntryController::class, 'store']);
        Route::post('entries/{type}/reorder', [Admin\EntryController::class, 'reorder']);
        Route::get('entries/{type}/{entry}', [Admin\EntryController::class, 'show']);
        Route::patch('entries/{type}/{entry}', [Admin\EntryController::class, 'update']);
        Route::delete('entries/{type}/{entry}', [Admin\EntryController::class, 'destroy']);

        // Media: anyone who edits any content can pick/upload images; the library screen is M19
        Route::get('media', [Admin\MediaController::class, 'index']);
        Route::post('media', [Admin\MediaController::class, 'store']);
        Route::patch('media/{media}', [Admin\MediaController::class, 'update'])->middleware('perm:M19,edit');
        Route::delete('media/{media}', [Admin\MediaController::class, 'destroy'])->middleware('perm:M19,edit');

        Route::get('seo/pages', [Admin\SeoController::class, 'pages'])->middleware('perm:M05,view');
        Route::post('seo/pages', [Admin\SeoController::class, 'savePage'])->middleware('perm:M05,edit');
        Route::patch('seo/pages/{page}', [Admin\SeoController::class, 'savePage'])->middleware('perm:M05,edit');
        Route::delete('seo/pages/{page}', [Admin\SeoController::class, 'deletePage'])->middleware('perm:M05,edit');
        Route::get('seo/redirects', [Admin\SeoController::class, 'redirects'])->middleware('perm:M05,view');
        Route::post('seo/redirects', [Admin\SeoController::class, 'saveRedirect'])->middleware('perm:M05,edit');
        Route::patch('seo/redirects/{redirect}', [Admin\SeoController::class, 'saveRedirect'])->middleware('perm:M05,edit');
        Route::delete('seo/redirects/{redirect}', [Admin\SeoController::class, 'deleteRedirect'])->middleware('perm:M05,edit');

        Route::get('publish/pending', [Admin\PublishController::class, 'pending'])->middleware('perm:M20,view');
        Route::get('publish/preview', [Admin\PublishController::class, 'preview'])->middleware('perm:M20,view');
        Route::get('snapshots', [Admin\PublishController::class, 'history'])->middleware('perm:M20,view');
        Route::get('snapshots/{snapshot}', [Admin\PublishController::class, 'show'])->middleware('perm:M20,view');
        Route::post('publish', [Admin\PublishController::class, 'publish'])->middleware('perm:M20,edit');
        Route::post('snapshots/{snapshot}/rollback', [Admin\PublishController::class, 'rollback'])->middleware('perm:M20,edit');

        Route::get('users', [Admin\UserController::class, 'index'])->middleware('perm:M21,view');
        Route::post('users', [Admin\UserController::class, 'store'])->middleware('perm:M21,edit');
        Route::patch('users/{user}', [Admin\UserController::class, 'update'])->middleware('perm:M21,edit');
        Route::get('roles', [Admin\RoleController::class, 'index'])->middleware('perm:M21,view');
        Route::post('roles', [Admin\RoleController::class, 'store'])->middleware('perm:M21,edit');
        Route::patch('roles/{role}', [Admin\RoleController::class, 'update'])->middleware('perm:M21,edit');
        Route::delete('roles/{role}', [Admin\RoleController::class, 'destroy'])->middleware('perm:M21,edit');
        Route::get('audit', [Admin\AuditController::class, 'index'])->middleware('perm:M22,view');
    });
});
