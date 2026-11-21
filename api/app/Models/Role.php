<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['key', 'name', 'permissions', 'system'];

    protected $casts = ['name' => 'array', 'permissions' => 'array', 'system' => 'boolean'];
}
