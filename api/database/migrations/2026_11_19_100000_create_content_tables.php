<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Content, SEO, media, publish history and audit. Shapes of `entries.data` live in packages/content/types.json.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entries', function (Blueprint $t) {
            $t->id();
            $t->string('type', 40)->index();          // a type from types.json
            $t->json('data');                          // working copy (what the admin edits)
            $t->json('published_data')->nullable();    // copy at the last publish (null = never published)
            $t->boolean('published_visible')->nullable(); // visibility at the last publish
            $t->boolean('visible')->default(true);
            $t->integer('sort')->default(0);
            $t->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->softDeletes();
            $t->index(['type', 'sort']);
        });

        Schema::create('seo_pages', function (Blueprint $t) {
            $t->id();
            $t->string('path')->unique();              // "/pricing"
            $t->string('title');
            $t->text('description');
            $t->string('og_image')->nullable();
            $t->boolean('noindex')->default(false);
            $t->timestamps();
        });

        Schema::create('redirects', function (Blueprint $t) {
            $t->id();
            $t->string('from_path')->unique();
            $t->string('to_path');
            $t->unsignedSmallInteger('code')->default(301);
            $t->unsignedInteger('hits')->default(0);
            $t->timestamps();
        });

        Schema::create('media', function (Blueprint $t) {
            $t->id();
            $t->string('path');                        // public URL path of the largest variant
            $t->string('original_name');
            $t->string('mime', 64);
            $t->unsignedInteger('width')->nullable();
            $t->unsignedInteger('height')->nullable();
            $t->unsignedInteger('bytes');
            $t->json('variants')->nullable();          // { "480": path, "960": path, "1600": path }
            $t->json('alt')->nullable();               // { bn, en }
            $t->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('snapshots', function (Blueprint $t) {
            $t->id();
            $t->unsignedInteger('version')->unique();
            $t->longText('content');                   // the full published JSON
            $t->string('note')->nullable();
            $t->unsignedInteger('rolled_back_from')->nullable();
            $t->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $t->string('build_status', 16)->default('none'); // none | triggered | failed
            $t->timestamp('published_at');
        });

        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('action', 40);                  // created | updated | deleted | published | login | export …
            $t->string('entity', 60);                  // "entry:team_member:12", "lead:5", "user:2"
            $t->json('before')->nullable();
            $t->json('after')->nullable();
            $t->string('ip', 45)->nullable();
            $t->timestamp('at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        foreach (['audit_logs', 'snapshots', 'media', 'redirects', 'seo_pages', 'entries'] as $t) Schema::dropIfExists($t);
    }
};
