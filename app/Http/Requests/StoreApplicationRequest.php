<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'cover_letter' => 'required|string|min:10|max:5000',
            'proposed_price' => 'nullable|numeric|min:0|max:9999999999',
        ];
    }
}
