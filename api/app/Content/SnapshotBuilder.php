<?php

namespace App\Content;

use App\Models\Entry;
use App\Models\Redirect;
use App\Models\SeoPage;

/**
 * Turns entries into the one JSON the website builds from (website/src/data/content.ts → pick()).
 * Keys = each type's "key" in types.json. Internal fields are never published.
 */
class SnapshotBuilder
{
    /** @param 'data'|'published_data' $column which copy to read (draft preview vs live) */
    public static function build(string $column = 'data'): array
    {
        $out = [];
        $rows = Entry::query()->where('visible', true)->orderBy('type')->orderBy('sort')->orderBy('id')->get()->groupBy('type');
        foreach (Registry::all() as $type => $t) {
            $items = ($rows[$type] ?? collect())->map(fn (Entry $e) => $e->{$column})->filter()->map(fn ($d) => self::strip($t['fields'], $d))->values()->all();
            if (!$items && $t['kind'] === 'single') continue; // nothing set → website keeps its code value
            if ($t['kind'] === 'single') {
                $one = $items[0];
                if (!empty($t['spread'])) { foreach ($one as $k => $v) $out[$k] = $v; } else $out[$t['key']] = $one;
                continue;
            }
            $shape = $t['shape'] ?? 'list';
            if (!$items && in_array($shape, ['map', 'values'])) continue;
            $out[$t['key']] = match ($shape) {
                'map' => (object) collect($items)->mapWithKeys(fn ($i) => [$i[$t['mapKey']] => $i[$t['mapValue']]])->all(),
                'values' => collect($items)->pluck($t['valueField'])->values()->all(),
                default => $items,
            };
        }
        $out['seo'] = (object) SeoPage::query()->orderBy('path')->get()->mapWithKeys(fn (SeoPage $p) => [$p->path => array_filter([
            'title' => $p->title, 'description' => $p->description, 'ogImage' => $p->og_image, 'noindex' => $p->noindex ?: null,
        ], fn ($v) => $v !== null)])->all();
        $out['redirects'] = Redirect::query()->orderBy('from_path')->get(['from_path', 'to_path', 'code'])
            ->map(fn ($r) => ['from' => $r->from_path, 'to' => $r->to_path, 'code' => $r->code])->all();
        return $out;
    }

    private static function strip(array $fields, array $data): array
    {
        foreach ($fields as $f) {
            if (!empty($f['internal'])) { unset($data[$f['name']]); continue; }
            if (($f['type'] === 'list') && isset($data[$f['name']]) && is_array($data[$f['name']])) {
                $data[$f['name']] = array_map(fn ($x) => is_array($x) ? self::strip($f['fields'], $x) : $x, $data[$f['name']]);
            }
        }
        return $data;
    }
}
