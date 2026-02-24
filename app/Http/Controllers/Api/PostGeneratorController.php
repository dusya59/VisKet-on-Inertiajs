<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SimpleAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class PostGeneratorController extends Controller
{
    private SimpleAIService $aiService;

    public function __construct(SimpleAIService $aiService)
    {
        $this->aiService = $aiService;
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
            $fullText = $this->aiService->generatePostText(
                $request->prompt,
                $request->post_type ?? 'portfolio_case'
            );
            
            // Парсим текст на title и description
            $parsed = $this->parsePostText($fullText);
            $imageUrl = $this->getRandomImage();

            return response()->json([
                'success' => true,
                'post' => [
                    'title' => $parsed['title'],
                    'description' => $parsed['description'],
                    'image' => $imageUrl,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Парсит сгенерированный текст на заголовок и описание
     */
    private function parsePostText(string $text): array
    {
        $lines = explode("\n", trim($text));
        
        // Первая строка - заголовок, остальное - описание
        $title = isset($lines[0]) ? trim($lines[0]) : 'Без заголовка';
        $description = count($lines) > 1 ? trim(implode("\n", array_slice($lines, 1))) : $text;
        
        // Ограничиваем длину заголовка
        if (strlen($title) > 255) {
            $title = substr($title, 0, 252) . '...';
        }
        
        // Если заголовок слишком длинный или нет, берем первые слова из текста
        if (strlen($title) > 100 || empty(trim($title))) {
            $words = explode(' ', $text);
            $title = implode(' ', array_slice($words, 0, 8));
            if (strlen($title) > 255) {
                $title = substr($title, 0, 252) . '...';
            }
            $description = $text;
        }
        
        return [
            'title' => $title,
            'description' => $description
        ];
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

            $texts = $this->aiService->generateMultiplePosts($count, $prompts, $postType);
            
            $posts = [];
            foreach ($texts as $text) {
                $parsed = $this->parsePostText($text);
                $posts[] = [
                    'title' => $parsed['title'],
                    'description' => $parsed['description'],
                    'image' => $this->getRandomImage(),
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
     * Использует несколько источников с fallback
     */
    private function getRandomImage(): string
    {
        // Вариант 1: Unsplash API (если есть ключ - лучшее качество)
        $unsplashKey = config('services.unsplash.access_key');
        if ($unsplashKey) {
            try {
                $response = Http::timeout(5)->get('https://api.unsplash.com/photos/random', [
                    'client_id' => $unsplashKey,
                    'orientation' => 'landscape',
                    'query' => 'business,office,workspace',
                ]);
                
                if ($response->successful() && isset($response->json()['urls']['regular'])) {
                    return $response->json()['urls']['regular'];
                }
            } catch (\Exception $e) {
                // Продолжаем к следующему варианту
            }
        }
        
        // Вариант 2: PlaceHolder.co (работает везде)
        $width = rand(600, 800);
        $height = rand(400, 600);
        $colors = ['3498db', '2ecc71', 'e74c3c', 'f39c12', '9b59b6', '1abc9c'];
        $color = $colors[array_rand($colors)];
        return "https://via.placeholder.com/{$width}x{$height}/{$color}/ffffff?text=Image";
        
        // Вариант 3: DummyImage (альтернатива)
        // return "https://dummyimage.com/{$width}x{$height}/4a90e2/ffffff&text=Post+Image";
        
        // Вариант 4: Можно вернуть NULL если хотите добавлять фото вручную
        // return null;
    }
}