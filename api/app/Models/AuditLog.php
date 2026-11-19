<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'action', 'entity', 'before', 'after', 'ip', 'at'];

    protected $casts = ['before' => 'array', 'after' => 'array', 'at' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
