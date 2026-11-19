<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoPage extends Model
{
    protected $fillable = ['path', 'title', 'description', 'og_image', 'noindex'];

    protected $casts = ['noindex' => 'boolean'];
}
