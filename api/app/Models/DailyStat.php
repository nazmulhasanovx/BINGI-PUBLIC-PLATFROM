<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyStat extends Model
{
    public $timestamps = false;

    protected $fillable = ['date', 'path', 'visitors', 'views', 'leads', 'demo_opens', 'whatsapp'];
}
