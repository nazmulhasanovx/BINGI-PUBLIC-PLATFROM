<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

pest()->extend(Tests\TestCase::class)->use(RefreshDatabase::class)->in('Feature');

beforeEach(function () {
    Storage::fake('public');
});

/** Acting as a user of the given role (Sanctum token auth). */
function actAs(string $role = 'owner'): User
{
    $u = User::factory()->create(['role' => $role]);
    Laravel\Sanctum\Sanctum::actingAs($u);
    App\Content\Permissions::flush();
    return $u;
}

function seedContent(): void
{
    test()->seed(Database\Seeders\DatabaseSeeder::class);
}

function teamItem(array $over = []): array
{
    return array_replace_recursive(['name' => 'Test Person', 'role' => ['bn' => 'ডেভেলপার', 'en' => 'Developer'], 'group' => ['bn' => 'টিম', 'en' => 'Team']], $over);
}
