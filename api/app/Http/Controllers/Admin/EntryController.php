<?php

namespace App\Http\Controllers\Admin;

use App\Content\Permissions;
use App\Content\Registry;
use App\Content\Validator;
use App\Http\Controllers\Controller;
use App\Models\Entry;
use App\Support\ApiError;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntryController extends Controller
{
    /** GET /types — the registry, for building forms. */
    public function types(Request $r)
    {
        $raw = Registry::raw();
        $raw['types'] = array_values(array_filter($raw['types'], fn ($t) => Permissions::can($r->user(), $t['module'], 'view')));
        $counts = Entry::query()->select('type', DB::raw('count(*) as n'))->groupBy('type')->pluck('n', 'type');
        $changed = Entry::withTrashed()->get()->filter(fn ($e) => $e->trashed() || $e->state() !== 'published')->countBy('type');
        foreach ($raw['types'] as &$t) { $t['count'] = $counts[$t['type']] ?? 0; $t['unpublished'] = $changed[$t['type']] ?? 0; }
        return $raw;
    }

    public function index(Request $r, string $type)
    {
        self::gate($r, $type, 'view');
        return ['items' => Entry::where('type', $type)->orderBy('sort')->orderBy('id')->get()->map(fn ($e) => self::out($e))];
    }

    public function show(Request $r, string $type, Entry $entry)
    {
        self::gate($r, $type, 'view');
        abort_unless($entry->type === $type, 404);
        return ['item' => self::out($entry)];
    }

    public function store(Request $r, string $type)
    {
        self::gate($r, $type, 'edit');
        $t = Registry::get($type);
        if ($t['kind'] === 'single' && Entry::where('type', $type)->exists()) {
            throw new ApiError('single_exists', 'This type has one item only — edit it instead.', 409);
        }
        $visible = $r->boolean('visible', true);
        $data = Validator::check($type, $r->input('data'), $visible);
        $e = Entry::create(['type' => $type, 'data' => $data, 'visible' => $visible,
            'sort' => (int) Entry::where('type', $type)->max('sort') + 1, 'updated_by' => $r->user()->id]);
        Audit::log('created', "entry:$type:{$e->id}", null, $data);
        return response(['item' => self::out($e)], 201);
    }

    public function update(Request $r, string $type, Entry $entry)
    {
        self::gate($r, $type, 'edit');
        abort_unless($entry->type === $type, 404);
        $visible = $r->has('visible') ? $r->boolean('visible') : $entry->visible;
        $data = $r->has('data') ? Validator::check($type, $r->input('data'), $visible) : Validator::check($type, $entry->data, $visible);
        $before = $entry->data;
        $entry->update(['data' => $data, 'visible' => $visible, 'updated_by' => $r->user()->id]);
        Audit::log('updated', "entry:$type:{$entry->id}", $before, $data);
        return ['item' => self::out($entry->fresh())];
    }

    public function destroy(Request $r, string $type, Entry $entry)
    {
        self::gate($r, $type, 'edit');
        abort_unless($entry->type === $type, 404);
        if (Registry::get($type)['kind'] === 'single') throw new ApiError('single_required', 'This item cannot be deleted, only edited.', 409);
        Audit::log('deleted', "entry:$type:{$entry->id}", $entry->data);
        $entry->delete(); // soft: gone from the site at the next publish
        return ['ok' => true];
    }

    public function reorder(Request $r, string $type)
    {
        self::gate($r, $type, 'edit');
        $ids = $r->validate(['ids' => 'required|array', 'ids.*' => 'integer'])['ids'];
        DB::transaction(function () use ($ids, $type) {
            foreach (array_values($ids) as $i => $id) Entry::where('type', $type)->whereKey($id)->update(['sort' => $i]);
        });
        Audit::log('reordered', "entry:$type", null, $ids);
        return ['ok' => true];
    }

    /** Each content type belongs to an admin module (types.json "module"); the role's level for it decides. */
    private static function gate(Request $r, string $type, string $need): void
    {
        $module = Registry::get($type)['module'];
        if (!Permissions::can($r->user(), $module, $need)) {
            throw new ApiError('forbidden', $need === 'edit' ? 'Your role cannot change this.' : 'Your role cannot open this.', 403);
        }
    }

    public static function out(Entry $e): array
    {
        return ['id' => $e->id, 'type' => $e->type, 'data' => $e->data, 'visible' => $e->visible, 'sort' => $e->sort,
            'state' => $e->state(), 'updated_at' => $e->updated_at?->toIso8601String(), 'updated_by' => $e->updated_by];
    }
}
