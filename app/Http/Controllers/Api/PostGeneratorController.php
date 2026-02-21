<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GroqService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class PostGeneratorController extends Controller
{
    private GroqService $groqService;

    public function __construct(GroqService $groqService)
    {
        $this->groqService = $groqService;
    }

    /**
     * Генерирует один пост с текстом и изображением
     */
    public function generateSingle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'prompt' => 'nullable|string|max:500',
            'post_type' => 'nullable|string|in:vacancy,portfolio_case,review,service_offer,collaboration,quick_order',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $text = $this->groqService->generatePostText(
                $request->prompt,
                $request->post_type ?? 'portfolio_case'
            );
            $imageUrl = $this->getRandomImage();

            return response()->json([
                'success' => true,
                'post' => [
                    'text' => $text,
                    'image_url' => $imageUrl,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Генерирует несколько постов
     */
    public function generateBatch(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'count' => 'required|integer|min:1|max:50',
            'prompts' => 'nullable|array',
            'prompts.*' => 'string|max:500',
            'post_type' => 'nullable|string|in:vacancy,portfolio_case,review,service_offer,collaboration,quick_order',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $count = $request->count;
            $prompts = $request->prompts ?? [];
            $postType = $request->post_type ?? 'portfolio_case';

            $texts = $this->groqService->generateMultiplePosts($count, $prompts, $postType);
            
            $posts = [];
            foreach ($texts as $text) {
                $posts[] = [
                    'text' => $text,
                    'image_url' => $this->getRandomImage(),
                ];
            }

            return response()->json([
                'success' => true,
                'posts' => $posts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получает случайное изображение
     * Можете заменить на Unsplash API если нужны реальные фото
     */
    private function getRandomImage(): string
    {
        // Вариант 1: Lorem Picsum (бесплатно, без регистрации)
        $width = rand(400, 800);
        $height = rand(400, 800);
        return "https://picsum.photos/{$width}/{$height}";

        // Вариант 2: Unsplash (нужен API ключ, лучше качество)
        // $accessKey = config('services.unsplash.access_key');
        // if ($accessKey) {
        //     $response = Http::withHeaders([
        //         'Authorization' => "Client-ID {$accessKey}"
        //     ])->get('https://api.unsplash.com/photos/random');
        //     
        //     if ($response->successful()) {
        //         return $response->json('urls.regular');
        //     }
        // }
        // 
        // return "https://picsum.photos/800/600";
    }
}