<?php

namespace App\Http\Controllers\Admin;

use App\Content\Publisher;
use App\Content\Registry;
use App\Content\SnapshotBuilder;
use App\Http\Controllers\Controller;
use App\Models\Entry;
use App\Models\Snapshot;
use Illuminate\Http\Request;

class PublishController extends Controller
{
    /** What would change if Owner pressed Publish now. */
    public function pending()
    {
        $types = Registry::all();
        $rows = Entry::withTrashed()->get()->filter(fn ($e) => $e->trashed() || $e->state() !== 'published');
        $items = $rows->map(fn (Entry $e) => [
            'id' => $e->id, 'type' => $e->type, 'type_label' => $types[$e->type]['label'] ?? null,
            'title' => self::title($e, $types[$e->type] ?? null),
            'change' => $e->trashed() ? 'deleted' : ($e->published_data === null ? 'new' : ($e->published_visible !== $e->visible && $e->published_data == $e->data ? ($e->visible ? 'shown' : 'hidden') : 'edited')),
            'before' => $e->published_data, 'after' => $e->trashed() ? null : $e->data,
            'updated_at' => $e->updated_at?->toIso8601String(),
        ])->values();
        $live = Snapshot::orderByDesc('version')->first();
        // SEO pages and redirects are not entries: compare them with the live snapshot.
        $now = SnapshotBuilder::build('data');
        $was = $live ? json_decode($live->content, true) : [];
        $seoNow = json_decode(json_encode($now['seo']), true); $seoWas = $was['seo'] ?? [];
        foreach (array_unique(array_merge(array_keys($seoNow), array_keys($seoWas))) as $path) {
            if (($seoNow[$path] ?? null) == ($seoWas[$path] ?? null)) continue;
            $items->push(['id' => 0, 'type' => 'seo', 'type_label' => ['bn' => 'SEO', 'en' => 'SEO'], 'title' => $path,
                'change' => !isset($seoWas[$path]) ? 'new' : (!isset($seoNow[$path]) ? 'deleted' : 'edited'),
                'before' => $seoWas[$path] ?? null, 'after' => $seoNow[$path] ?? null, 'updated_at' => null]);
        }
        if (($now['redirects'] ?? []) != ($was['redirects'] ?? [])) {
            $items->push(['id' => 0, 'type' => 'redirects', 'type_label' => ['bn' => 'রিডাইরেক্ট', 'en' => 'Redirects'], 'title' => count($now['redirects']) . ' redirects',
                'change' => 'edited', 'before' => ['list' => $was['redirects'] ?? []], 'after' => ['list' => $now['redirects']], 'updated_at' => null]);
        }
        return ['items' => $items->values(), 'live' => $live ? ['version' => $live->version, 'published_at' => $live->published_at->toIso8601String()] : null];
    }

    public function preview()
    {
        return SnapshotBuilder::build('data');
    }

    public function publish(Request $r)
    {
        $d = $r->validate(['note' => 'nullable|string|max:200']);
        $s = Publisher::publish($d['note'] ?? null, $r->user()->id);
        return response(['item' => self::out($s)], 201);
    }

    public function history()
    {
        return ['items' => Snapshot::with('publisher:id,name')->orderByDesc('version')->limit(100)->get()->map(fn ($s) => self::out($s))];
    }

    public function show(Snapshot $snapshot)
    {
        return ['item' => self::out($snapshot), 'content' => json_decode($snapshot->content, true)];
    }

    public function rollback(Request $r, Snapshot $snapshot)
    {
        return response(['item' => self::out(Publisher::rollback($snapshot, $r->user()->id))], 201);
    }

    private static function out(Snapshot $s): array
    {
        return ['id' => $s->id, 'version' => $s->version, 'note' => $s->note, 'rolled_back_from' => $s->rolled_back_from,
            'published_at' => $s->published_at->toIso8601String(), 'published_by' => $s->publisher?->name, 'build_status' => $s->build_status];
    }

    public static function title(Entry $e, ?array $t): string
    {
        $f = $t['titleField'] ?? null;
        $v = $f ? ($e->data[$f] ?? $e->published_data[$f] ?? null) : null;
        if (is_array($v)) $v = $v['en'] ?? $v['bn'] ?? null;
        return (string) ($v ?: ($t['label']['en'] ?? $e->type));
    }
}
