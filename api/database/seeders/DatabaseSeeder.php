<?php

namespace Database\Seeders;

use App\Content\Publisher;
use App\Content\Registry;
use App\Content\Validator;
use App\Models\Entry;
use App\Models\SeoPage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Fills a new database with today's site content (packages/content/seed) and one owner,
 * then publishes it as version 1, so the site looks exactly the same as before the admin existed.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SEED_OWNER_EMAIL', 'owner@bingi.local');
        if (!User::where('email', $email)->exists()) {
            $pw = env('SEED_OWNER_PASSWORD') ?: Str::password(16, symbols: false);
            User::create(['name' => 'Owner', 'email' => $email, 'password' => $pw, 'role' => 'owner']);
            $this->command?->warn("Owner login: $email / $pw  — change this password after the first login.");
        }

        if (Entry::exists()) { $this->command?->info('Content already seeded — skipped.'); return; }
        $dir = config('content.seed_dir');
        $n = 0;
        foreach (Registry::all() as $type => $t) {
            $file = "$dir/$type.json";
            if (!is_file($file)) continue;
            foreach (json_decode(file_get_contents($file), true) as $i => $item) {
                $data = Validator::check($type, $item, true);
                Entry::create(['type' => $type, 'data' => $data, 'visible' => true, 'sort' => $i]);
                $n++;
            }
        }
        if (is_file("$dir/_seo.json")) {
            foreach (json_decode(file_get_contents("$dir/_seo.json"), true) as $p) {
                SeoPage::create(['path' => $p['path'], 'title' => $p['title'], 'description' => $p['description']]);
            }
        }
        Publisher::publish('Initial content from the website code', User::where('email', $email)->value('id'));
        $this->command?->info("Seeded $n entries and published version 1.");
    }
}
