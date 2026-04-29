<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResolveDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->is_admin;
    }

    public function rules(): array
    {
        return [
            'resolution' => 'required|string|min:10|max:5000',
            'outcome' => 'required|in:completed,cancelled',
            'refund_amount' => 'nullable|numeric|min:0',
        ];
    }
}
