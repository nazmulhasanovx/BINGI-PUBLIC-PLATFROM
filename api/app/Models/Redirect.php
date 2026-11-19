<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    protected $fillable = ['from_path', 'to_path', 'code'];

    protected $casts = ['code' => 'integer', 'hits' => 'integer'];
}
