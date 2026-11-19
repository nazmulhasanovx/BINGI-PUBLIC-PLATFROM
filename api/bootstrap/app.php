<?php

use App\Http\Middleware\Role;
use App\Support\ApiError;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['role' => Role::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // One error shape for the admin and the site: { code, message, fields }
        $json = fn (string $code, string $message, int $status, array $fields = []) => response()->json(['code' => $code, 'message' => $message, 'fields' => (object) $fields], $status);
        $exceptions->render(function (ApiError $e) use ($json) { return $json($e->errorCode, $e->getMessage(), $e->status, $e->fields); });
        $exceptions->render(function (ValidationException $e, Request $r) use ($json) {
            return $json('validation_failed', 'Some fields need attention.', 422, collect($e->errors())->map(fn ($m) => $m[0])->all());
        });
        $exceptions->render(function (AuthenticationException $e) use ($json) { return $json('unauthenticated', 'Please sign in.', 401); });
        $exceptions->render(function (ThrottleRequestsException $e) use ($json) { return $json('too_many_requests', 'Too many requests. Try again in a minute.', 429); });
        $exceptions->render(function (NotFoundHttpException $e, Request $r) use ($json) {
            if ($r->is('api/*')) return $json('not_found', 'Not found.', 404);
        });
        $exceptions->render(function (HttpExceptionInterface $e, Request $r) use ($json) {
            if ($r->is('api/*')) return $json('http_' . $e->getStatusCode(), $e->getMessage() ?: 'Request failed.', $e->getStatusCode());
        });
        $exceptions->shouldRenderJsonWhen(fn (Request $r) => $r->is('api/*'));
    })->create();
