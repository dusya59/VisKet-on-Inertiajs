<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'application_id' => 'required|exists:applications,id',
            'reason' => 'required|string|min:10|max:5000',
        ];
    }
}
