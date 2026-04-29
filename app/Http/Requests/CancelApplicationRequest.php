<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'reason' => 'required|string|min:5|max:5000',
        ];
    }
}
