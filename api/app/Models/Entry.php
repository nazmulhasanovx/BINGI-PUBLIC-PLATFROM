<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/** One content item. `type` names its shape in packages/content/types.json. */
class Entry extends Model
{
    use SoftDeletes;

    protected $fillable = ['type', 'data', 'published_data', 'published_visible', 'visible', 'sort', 'updated_by'];

    protected $casts = ['data' => 'array', 'published_data' => 'array', 'visible' => 'boolean', 'published_visible' => 'boolean', 'sort' => 'integer'];

    // NB: use getAttribute('visible') inside this class — $this->visible is Eloquent's own $visible property.
    /** draft = never published, changed = edited since publish, published = same as live */
    public function state(): string
    {
        if ($this->published_data === null) return 'draft';
        return $this->published_data == $this->data && $this->published_visible === $this->getAttribute('visible') ? 'published' : 'changed';
    }
}
