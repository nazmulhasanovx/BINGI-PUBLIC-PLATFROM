<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Snapshot extends Model
{
    public $timestamps = false;

    protected $fillable = ['version', 'content', 'note', 'rolled_back_from', 'published_by', 'build_status', 'published_at'];

    protected $casts = ['published_at' => 'datetime'];

    protected $hidden = ['content'];

    public function publisher()
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
