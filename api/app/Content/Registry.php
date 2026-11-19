<?php

namespace App\Content;

use App\Support\ApiError;

/** Reads packages/content/types.json — the one definition of every content type. */
class Registry
{
    private static ?array $types = null;

    public static function path(): string
    {
        return config('content.registry');
    }

    /** @return array<string, array> keyed by type name */
    public static function all(): array
    {
        if (self::$types === null) {
            $json = json_decode(file_get_contents(self::path()), true, flags: JSON_THROW_ON_ERROR);
            self::$types = [];
            foreach ($json['types'] as $t) self::$types[$t['type']] = $t;
        }
        return self::$types;
    }

    public static function get(string $type): array
    {
        return self::all()[$type] ?? throw new ApiError('unknown_type', "Unknown content type: $type", 404);
    }

    public static function raw(): array
    {
        return json_decode(file_get_contents(self::path()), true);
    }
}
