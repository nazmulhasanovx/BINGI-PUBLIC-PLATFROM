<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $r)
    {
        $q = AuditLog::with('user:id,name')->orderByDesc('at');
        if ($e = $r->query('entity')) $q->where('entity', 'like', "$e%");
        if ($u = $r->query('user')) $q->where('user_id', $u);
        return $q->paginate(50);
    }
}
