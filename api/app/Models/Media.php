<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = ['path', 'original_name', 'mime', 'width', 'height', 'bytes', 'variants', 'alt', 'uploaded_by'];

    protected $casts = ['variants' => 'array', 'alt' => 'array'];
}
