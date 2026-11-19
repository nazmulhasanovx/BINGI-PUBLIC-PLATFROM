<?php

namespace App\Content;

use App\Models\Entry;
use App\Models\Snapshot;
use App\Support\ApiError;
use App\Support\Audit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class Publisher
{
    /** Publish the current working copy as a new version. */
    public static function publish(?string $note, ?int $userId): Snapshot
    {
        return DB::transaction(function () use ($note, $userId) {
            $content = SnapshotBuilder::build('data');
            $snap = self::store($content, $note, $userId);
            Entry::query()->update(['published_data' => DB::raw('data'), 'published_visible' => DB::raw('visible')]);
            Entry::onlyTrashed()->forceDelete(); // deletions are final once published
            Audit::log('published', "snapshot:{$snap->version}", null, ['note' => $note]);
            return $snap;
        });
    }

    /** Publish an older snapshot's content again (as a new version). The admin's working copy is not touched. */
    public static function rollback(Snapshot $old, ?int $userId): Snapshot
    {
        $content = json_decode($old->content, true);
        $snap = self::store($content, "Rollback to v{$old->version}", $userId, $old->version);
        Audit::log('rolled_back', "snapshot:{$snap->version}", null, ['to' => $old->version]);
        return $snap;
    }

    private static function store(array $content, ?string $note, ?int $userId, ?int $from = null): Snapshot
    {
        $version = (int) Snapshot::max('version') + 1;
        $now = now();
        $content['meta'] = ['version' => $version, 'publishedAt' => $now->toIso8601String()];
        $json = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $snap = Snapshot::create([
            'version' => $version, 'content' => $json, 'note' => $note, 'rolled_back_from' => $from,
            'published_by' => $userId, 'published_at' => $now,
        ]);
        Storage::disk('public')->put('content/latest.json', $json);
        Storage::disk('public')->put("content/v{$version}.json", $json);
        $snap->build_status = self::triggerBuild($version);
        $snap->save();
        return $snap;
    }

    /** Ask GitHub Actions to rebuild the site (repository_dispatch). Off when BUILD_HOOK_URL is empty. */
    private static function triggerBuild(int $version): string
    {
        $url = config('content.build_hook_url');
        if (!$url) return 'none';
        try {
            $r = Http::withToken((string) config('content.build_hook_token'))->acceptJson()->timeout(10)
                ->post($url, ['event_type' => 'content-published', 'client_payload' => ['version' => $version]]);
            return $r->successful() ? 'triggered' : 'failed';
        } catch (\Throwable $e) {
            Log::warning('build hook failed', ['e' => $e->getMessage()]);
            return 'failed';
        }
    }

    public static function latestOrFail(): Snapshot
    {
        return Snapshot::query()->orderByDesc('version')->first() ?? throw new ApiError('not_published', 'Nothing has been published yet.', 404);
    }
}
