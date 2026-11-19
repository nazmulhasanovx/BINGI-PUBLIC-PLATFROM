<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Leads (demo requests) and visitor analytics (cookie-less events + daily totals).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('property');
            $t->string('phone', 32);
            $t->string('property_type', 24)->nullable();
            $t->unsignedInteger('rooms')->nullable();
            $t->string('preferred_time')->nullable();
            $t->string('source_page')->nullable();     // path the form was sent from
            $t->json('utm')->nullable();
            $t->string('status', 16)->default('new');  // new | contacted | demo_done | won | lost
            $t->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $t->string('lang', 2)->default('bn');
            $t->timestamps();
            $t->index(['status', 'created_at']);
        });

        Schema::create('lead_notes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->text('body');
            $t->timestamps();
        });

        // Raw events, kept 90 days (php artisan analytics:prune). No names, no phone, no raw IP.
        Schema::create('events', function (Blueprint $t) {
            $t->id();
            $t->timestamp('at')->index();
            $t->string('type', 24);                    // pageview | demo_open | lead | whatsapp | theme_demo | price_slider
            $t->string('path');
            $t->string('referrer_host')->nullable();
            $t->json('utm')->nullable();
            $t->string('country', 2)->nullable();
            $t->string('device', 8)->nullable();       // mobile | tablet | desktop
            $t->string('lang', 2)->nullable();
            $t->char('visitor_hash', 16);              // sha256(daily salt + ip + user agent), cut to 16 — changes every day
            $t->index(['type', 'at']);
        });

        // One row per day + path, kept forever (php artisan analytics:rollup).
        Schema::create('daily_stats', function (Blueprint $t) {
            $t->id();
            $t->date('date');
            $t->string('path');
            $t->unsignedInteger('visitors')->default(0);
            $t->unsignedInteger('views')->default(0);
            $t->unsignedInteger('leads')->default(0);
            $t->unsignedInteger('demo_opens')->default(0);
            $t->unsignedInteger('whatsapp')->default(0);
            $t->unique(['date', 'path']);
        });
    }

    public function down(): void
    {
        foreach (['daily_stats', 'events', 'lead_notes', 'leads'] as $t) Schema::dropIfExists($t);
    }
};
