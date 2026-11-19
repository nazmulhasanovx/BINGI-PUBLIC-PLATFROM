<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A cookie-less visitor event. Table `events`. */
class VisitEvent extends Model
{
    public const TYPES = ['pageview', 'demo_open', 'lead', 'whatsapp', 'theme_demo', 'price_slider'];

    protected $table = 'events';

    public $timestamps = false;

    protected $fillable = ['at', 'type', 'path', 'referrer_host', 'utm', 'country', 'device', 'lang', 'visitor_hash'];

    protected $casts = ['utm' => 'array', 'at' => 'datetime'];
}
