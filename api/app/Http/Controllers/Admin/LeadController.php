<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    public function index(Request $r)
    {
        $q = Lead::query()->with('assignee:id,name')->withCount('notes')->latest();
        if ($s = $r->query('status')) $q->where('status', $s);
        if ($t = trim((string) $r->query('q'))) $q->where(fn ($w) => $w->where('name', 'like', "%$t%")->orWhere('property', 'like', "%$t%")->orWhere('phone', 'like', "%$t%"));
        $counts = Lead::query()->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        return $q->paginate(30)->toArray() + ['counts' => $counts];
    }

    public function show(Lead $lead)
    {
        return ['item' => $lead->load(['notes.user:id,name', 'assignee:id,name'])];
    }

    public function update(Request $r, Lead $lead)
    {
        $d = $r->validate([
            'status' => ['sometimes', Rule::in(Lead::STATUSES)],
            'assigned_to' => 'sometimes|nullable|exists:users,id',
        ]);
        $before = $lead->only(array_keys($d));
        $lead->update($d);
        Audit::log('updated', "lead:{$lead->id}", $before, $d);
        return ['item' => $lead->fresh(['assignee:id,name'])];
    }

    public function note(Request $r, Lead $lead)
    {
        $d = $r->validate(['body' => 'required|string|max:2000']);
        $n = $lead->notes()->create(['user_id' => $r->user()->id, 'body' => $d['body']]);
        Audit::log('noted', "lead:{$lead->id}");
        return response(['item' => $n->load('user:id,name')], 201);
    }

    /** CSV of the current filter. Audited (phone numbers leave the system). */
    public function export(Request $r)
    {
        $q = Lead::query()->latest();
        if ($s = $r->query('status')) $q->where('status', $s);
        Audit::log('exported', 'leads', null, ['status' => $r->query('status'), 'count' => $q->count()]);
        $rows = $q->get();
        $out = fopen('php://temp', 'r+');
        fputs($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel shows Bangla
        fputcsv($out, ['Date', 'Name', 'Property', 'Phone', 'Type', 'Rooms', 'Preferred time', 'Status', 'From page']);
        foreach ($rows as $l) fputcsv($out, [$l->created_at->timezone('Asia/Dhaka')->format('Y-m-d H:i'), $l->name, $l->property, $l->phone, $l->property_type, $l->rooms, $l->preferred_time, $l->status, $l->source_page]);
        rewind($out);
        return response(stream_get_contents($out), 200, ['Content-Type' => 'text/csv; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="bingi-leads.csv"']);
    }
}
