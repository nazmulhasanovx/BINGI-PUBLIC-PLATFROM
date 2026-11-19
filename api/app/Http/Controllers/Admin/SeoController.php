<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Redirect;
use App\Models\SeoPage;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Per-page SEO + 301/302 redirects. Both go into the next published snapshot. */
class SeoController extends Controller
{
    public function pages()
    {
        return ['items' => SeoPage::orderBy('path')->get()->map(fn ($p) => $p->toArray() + [
            'checks' => self::checks($p),
        ])];
    }

    public function savePage(Request $r, ?SeoPage $page = null)
    {
        $d = $r->validate([
            'path' => ['required', 'string', 'regex:#^/[a-z0-9/_\-]*$#', Rule::unique('seo_pages', 'path')->ignore($page?->id)],
            'title' => 'required|string|max:120',
            'description' => 'required|string|max:320',
            'og_image' => 'nullable|string|max:500',
            'noindex' => 'boolean',
        ]);
        $before = $page?->toArray();
        $page ? $page->update($d) : $page = SeoPage::create($d);
        Audit::log($before ? 'updated' : 'created', "seo:{$page->path}", $before, $d);
        return ['item' => $page->toArray() + ['checks' => self::checks($page)]];
    }

    public function deletePage(SeoPage $page)
    {
        Audit::log('deleted', "seo:{$page->path}", $page->toArray());
        $page->delete();
        return ['ok' => true];
    }

    public function redirects()
    {
        return ['items' => Redirect::orderBy('from_path')->get()];
    }

    public function saveRedirect(Request $r, ?Redirect $redirect = null)
    {
        $d = $r->validate([
            'from_path' => ['required', 'string', 'regex:#^/#', Rule::unique('redirects', 'from_path')->ignore($redirect?->id)],
            'to_path' => 'required|string|different:from_path',
            'code' => 'required|in:301,302',
        ]);
        $before = $redirect?->toArray();
        $redirect ? $redirect->update($d) : $redirect = Redirect::create($d);
        Audit::log($before ? 'updated' : 'created', "redirect:{$redirect->from_path}", $before, $d);
        return ['item' => $redirect];
    }

    public function deleteRedirect(Redirect $redirect)
    {
        Audit::log('deleted', "redirect:{$redirect->from_path}", $redirect->toArray());
        $redirect->delete();
        return ['ok' => true];
    }

    /** Simple, honest checks shown next to each page (Google shows ~60 / ~155 characters). */
    public static function checks(SeoPage $p): array
    {
        $c = [];
        $tl = mb_strlen($p->title); $dl = mb_strlen($p->description);
        if ($tl < 25) $c[] = ['level' => 'warn', 'msg' => 'Title is short (under 25 characters).'];
        if ($tl > 60) $c[] = ['level' => 'warn', 'msg' => 'Title may be cut in Google (over 60 characters).'];
        if ($dl < 70) $c[] = ['level' => 'warn', 'msg' => 'Description is short (under 70 characters).'];
        if ($dl > 160) $c[] = ['level' => 'warn', 'msg' => 'Description may be cut (over 160 characters).'];
        if (!$p->og_image) $c[] = ['level' => 'info', 'msg' => 'No share image — the default one is used.'];
        if ($p->noindex) $c[] = ['level' => 'info', 'msg' => 'Hidden from search engines (noindex).'];
        return $c;
    }
}
