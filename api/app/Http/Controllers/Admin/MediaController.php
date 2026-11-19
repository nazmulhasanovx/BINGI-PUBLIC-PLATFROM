<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Support\ApiError;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** Images → WebP at 480 / 960 / 1600 px wide (never upscaled). Other files (PDF permissions) kept as is. */
class MediaController extends Controller
{
    private const WIDTHS = [480, 960, 1600];

    public function index(Request $r)
    {
        $q = Media::query()->latest();
        if ($s = $r->query('q')) $q->where('original_name', 'like', "%$s%");
        return $q->paginate(48);
    }

    public function store(Request $r)
    {
        $r->validate(['file' => ['required', 'file', 'max:15360', 'mimes:jpg,jpeg,png,webp,gif,pdf']], ['file.mimes' => 'Upload a JPG, PNG, WebP, GIF or PDF (SVG is not accepted — it can carry scripts).']);
        $f = $r->file('file');
        $mime = $f->getMimeType();
        $base = 'media/' . now()->format('Y/m') . '/' . Str::lower(Str::random(10)) . '-' . Str::slug(pathinfo($f->getClientOriginalName(), PATHINFO_FILENAME));
        $disk = Storage::disk('public');
        $w = $h = null; $variants = null;
        if (in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])) {
            $img = @imagecreatefromstring(file_get_contents($f->getRealPath()));
            if (!$img) throw new ApiError('bad_image', 'This image could not be read.', 422);
            [$w, $h] = [imagesx($img), imagesy($img)];
            $variants = [];
            $sizes = array_values(array_unique(array_merge(array_filter(self::WIDTHS, fn ($x) => $x < $w), [min($w, self::WIDTHS[count(self::WIDTHS) - 1])])));
            sort($sizes);
            foreach ($sizes as $tw) {
                $th = (int) round($h * $tw / $w);
                $dst = imagecreatetruecolor($tw, $th);
                imagealphablending($dst, false); imagesavealpha($dst, true);
                imagecopyresampled($dst, $img, 0, 0, 0, 0, $tw, $th, $w, $h);
                ob_start(); imagewebp($dst, null, 80); $bytes = ob_get_clean();
                imagedestroy($dst);
                $disk->put("$base-$tw.webp", $bytes);
                $variants[(string) $tw] = $disk->url("$base-$tw.webp");
            }
            imagedestroy($img);
            $path = end($variants);
            $mime = 'image/webp';
        } else {
            $ext = $f->getClientOriginalExtension();
            $disk->putFileAs(dirname($base), $f, basename($base) . ".$ext");
            $path = $disk->url("$base.$ext");
        }
        $m = Media::create(['path' => $path, 'original_name' => $f->getClientOriginalName(), 'mime' => $mime,
            'width' => $w, 'height' => $h, 'bytes' => $f->getSize(), 'variants' => $variants,
            'alt' => $r->input('alt'), 'uploaded_by' => $r->user()->id]);
        Audit::log('uploaded', "media:{$m->id}", null, ['name' => $m->original_name]);
        return response($m, 201);
    }

    public function update(Request $r, Media $media)
    {
        $d = $r->validate(['alt' => 'nullable|array', 'alt.bn' => 'nullable|string', 'alt.en' => 'nullable|string']);
        $media->update($d);
        return $media;
    }

    public function destroy(Media $media)
    {
        $disk = Storage::disk('public');
        foreach (array_merge([$media->path], array_values($media->variants ?? [])) as $url) {
            $disk->delete(ltrim(Str::after($url, '/storage/'), '/'));
        }
        Audit::log('deleted', "media:{$media->id}", ['name' => $media->original_name]);
        $media->delete();
        return ['ok' => true];
    }
}
