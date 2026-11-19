<?php

namespace App\Content;

use App\Support\ApiError;

/**
 * Checks entry data against its type's fields (types.json) and the truth guards.
 * Returns the cleaned data (unknown keys dropped). Throws ApiError with per-field messages.
 */
class Validator
{
    private array $errors = [];

    public static function check(string $type, mixed $data, bool $visible = true): array
    {
        $v = new self();
        $t = Registry::get($type);
        if (!is_array($data) || array_is_list($data) && $data !== []) throw ApiError::fields(['data' => 'Must be an object.']);
        $clean = $v->object($t['fields'], $data, '');
        $v->guards($t, $clean, $visible);
        if ($v->errors) throw ApiError::fields($v->errors);
        return $clean;
    }

    private function object(array $fields, array $data, string $at): array
    {
        $out = [];
        foreach ($fields as $f) {
            $name = $f['name'];
            $path = $at === '' ? $name : "$at.$name";
            $val = $data[$name] ?? null;
            if ($this->empty($val)) {
                if (!empty($f['required'])) $this->errors[$path] = 'Required.';
                continue;
            }
            $ok = $this->value($f, $val, $path);
            if ($ok !== null) $out[$name] = $ok;
        }
        return $out;
    }

    private function empty(mixed $v): bool
    {
        if ($v === null || $v === '' || $v === []) return true;
        if (is_array($v) && array_key_exists('bn', $v) && array_key_exists('en', $v) && trim((string) $v['bn']) === '' && trim((string) $v['en']) === '') return true;
        return false;
    }

    private function value(array $f, mixed $v, string $path): mixed
    {
        $fail = function (string $m) use ($path) { $this->errors[$path] = $m; return null; };
        switch ($f['type']) {
            case 'string': case 'text': case 'image':
                if (!is_string($v)) return $fail('Must be text.');
                if ($f['type'] === 'string' && mb_strlen($v) > 500) return $fail('Too long (max 500).');
                return trim($v);
            case 'url':
                if (!is_string($v) || !preg_match('#^(https?://|/|mailto:|tel:)#', $v)) return $fail('Must be a link starting with https:// or /.');
                return trim($v);
            case 'date':
                if (!is_string($v) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) return $fail('Use YYYY-MM-DD.');
                return $v;
            case 'number':
                if (!is_int($v) && !is_float($v) && !(is_string($v) && is_numeric($v))) return $fail('Must be a number.');
                return $v + 0;
            case 'bool':
                return (bool) $v;
            case 'enum':
                if (!in_array($v, $f['options'], true)) return $fail('Choose one of: ' . implode(', ', $f['options']) . '.');
                return $v;
            case 'l': case 'lt':
                if (!is_array($v) || !array_key_exists('bn', $v) || !array_key_exists('en', $v)) return $fail('Needs Bangla and English.');
                $v = ['bn' => (string) ($v['bn'] ?? ''), 'en' => (string) ($v['en'] ?? '')]; // empty strings arrive as null
                if (!empty($f['required']) && (trim($v['bn']) === '' || trim($v['en']) === '')) return $fail('Write both Bangla and English.');
                return ['bn' => $v['bn'], 'en' => $v['en']];
            case 'llist':
                if (!is_array($v) || !array_is_list($v)) return $fail('Must be a list.');
                $out = [];
                foreach ($v as $i => $x) $out[] = $this->value(['type' => 'l', 'required' => true], $x, "$path.$i");
                return $out;
            case 'strlist':
                if (!is_array($v) || !array_is_list($v)) return $fail('Must be a list.');
                foreach ($v as $i => $x) if (!is_string($x)) return $fail("Item $i must be text.");
                return array_values($v);
            case 'list':
                if (!is_array($v) || !array_is_list($v)) return $fail('Must be a list.');
                return array_map(fn ($x, $i) => is_array($x) ? $this->object($f['fields'], $x, "$path.$i") : $fail("Item $i must be an object."), $v, array_keys($v));
            case 'object':
                if (!is_array($v)) return $fail('Must be an object.');
                return $this->object($f['fields'], $v, $path);
            case 'blocks':
                if (!is_array($v) || !array_is_list($v)) return $fail('Must be a list of blocks.');
                $out = [];
                foreach ($v as $i => $b) {
                    if (isset($b['h'])) $out[] = ['h' => $this->value(['type' => 'l', 'required' => true], $b['h'], "$path.$i.h")];
                    elseif (isset($b['p'])) $out[] = ['p' => $this->value(['type' => 'l', 'required' => true], $b['p'], "$path.$i.p")];
                    elseif (isset($b['list'])) $out[] = ['list' => $this->value(['type' => 'llist'], $b['list'], "$path.$i.list")];
                    else $fail("Block $i must be a heading (h), paragraph (p) or list.");
                }
                return $out;
            case 'json':
                return $v; // stored as given; the site's type checks it at build time
        }
        return $fail('Unknown field type ' . $f['type']);
    }

    /** Truth rules (CLAUDE.md / plan): enforced here so no UI can skip them. */
    private function guards(array $t, array $d, bool $visible): void
    {
        $g = $t['guards'] ?? [];
        $verified = !empty($d['verified_by']) && !empty($d['verified_at']);
        if (in_array('verified_live', $g) && ($d['status'] ?? null) === 'live' && !$verified) {
            $this->errors['verified_by'] = 'Live needs who verified it and when.';
        }
        if (in_array('verified_live_single', $g) && in_array('live', array_intersect_key($d, array_flip(['web', 'mobile', 'guest'])), true) && !$verified) {
            $this->errors['verified_by'] = 'A Live platform needs who verified it and when.';
        }
        if (in_array('ai_not_live', $g) && ($d['id'] ?? null) === 'ai' && ($d['status'] ?? null) === 'live') {
            $this->errors['status'] = 'BinGi AI can only be Beta or Coming Soon.';
        }
        if (in_array('permission', $g) && $visible && empty($d['permission_file'])) {
            $this->errors['permission_file'] = 'Upload the written permission before showing this.';
        }
        if (in_array('no_sample_visible', $g) && $visible && !empty($d['sample'])) {
            $this->errors['sample'] = 'A sample story can never be shown. Replace it with a real story and switch "sample" off.';
        }
        if (in_array('result_sources', $g)) {
            foreach ($d['results'] ?? [] as $i => $res) {
                if (empty($res['source'])) $this->errors["results.$i.source"] = 'Say where this number comes from.';
            }
        }
        if (in_array('source', $g) && empty($d['source'])) {
            $this->errors['source'] = 'Say where this fact comes from.';
        }
    }
}
