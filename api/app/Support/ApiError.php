<?php

namespace App\Support;

use RuntimeException;

/** Every API error leaves as { code, message, fields } (see bootstrap/app.php). */
class ApiError extends RuntimeException
{
    public function __construct(public string $errorCode, string $message, public int $status = 422, public array $fields = [])
    {
        parent::__construct($message);
    }

    public static function fields(array $fields, string $message = 'Some fields need attention.'): self
    {
        return new self('validation_failed', $message, 422, $fields);
    }
}
