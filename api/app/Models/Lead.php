<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    public const STATUSES = ['new', 'contacted', 'demo_done', 'won', 'lost'];

    protected $fillable = ['name', 'property', 'phone', 'property_type', 'rooms', 'preferred_time', 'source_page', 'utm', 'status', 'assigned_to', 'lang'];

    protected $casts = ['utm' => 'array', 'rooms' => 'integer'];

    public function notes()
    {
        return $this->hasMany(LeadNote::class)->latest();
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
