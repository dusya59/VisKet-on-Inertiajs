<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GroqService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.groq.com/openai/v1';

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key');
    }

    /**
     * Генерирует текст поста
     * 
     * @param string $prompt Промпт для генерации (опционально)
     * @param string $postType Тип поста: vacancy, portfolio_case, review, etc. (опционально)
     * @return string
     */
    public function generatePostText(string $prompt = null, string $postType = 'portfolio_case'): string
    {
        // Если промпт не передан, генерируем базовый
        if (!$prompt) {
            $prompt = $this->getDefaultPrompt($postType);
        }

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->apiKey}",
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/chat/completions", [
            'model' => 'llama-3.3-70b-versatile', // Быстрая и качественная модель
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'temperature' => 0.8, // Больше креативности
            'max_tokens' => 300, // Увеличил для более подробных постов
        ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content');
        }

        throw new \Exception('Ошибка генерации текста: ' . $response->body());
    }

    /**
     * Получает промпт по умолчанию для типа поста
     */
    private function getDefaultPrompt(string $postType): string
    {
        $prompts = [
            'vacancy' => 'Создай пост-вакансию для фрилансера. Первая строка - короткий заголовок вакансии (до 10 слов). Дальше с новой строки - подробное описание: область работы, требования, условия и бюджет. Всего 3-5 предложений.',
            
            'portfolio_case' => 'Создай пост-кейс о выполненном проекте. Первая строка - название проекта/кейса (до 10 слов). Дальше с новой строки - описание: что сделали, технологии, результат. Профессионально. 3-5 предложений.',
            
            'review' => 'Создай отзыв о работе с фрилансером. Первая строка - короткий заголовок отзыва. Дальше с новой строки - описание: профессионализм, качество, сроки. 2-3 предложения.',
            
            'service_offer' => 'Создай пост где фрилансер предлагает услуги. Первая строка - название услуги. Дальше с новой строки - область экспертизы, опыт, преимущества. 3-4 предложения.',
            
            'collaboration' => 'Создай пост об успешной кооперации с партнером. Первая строка - название проекта. Дальше с новой строки - описание проекта и достижений. 3-4 предложения.',
            
            'quick_order' => 'Создай срочную вакансию. Первая строка - что нужно сделать (кратко). Дальше с новой строки - сжатые сроки и условия. 2-3 предложения.',
        ];

        return $prompts[$postType] ?? $prompts['portfolio_case'];
    }

    /**
     * Генерирует несколько постов за раз
     * 
     * @param int $count Количество постов
     * @param array $prompts Массив промптов (опционально)
     * @param string $postType Тип постов по умолчанию
     * @return array
     */
    public function generateMultiplePosts(int $count, array $prompts = [], string $postType = 'portfolio_case'): array
    {
        $posts = [];
        
        for ($i = 0; $i < $count; $i++) {
            $prompt = $prompts[$i] ?? null;
            $posts[] = $this->generatePostText($prompt, $postType);
            
            // Небольшая пауза чтобы не превысить rate limit
            usleep(100000); // 0.1 секунды
        }
        
        return $posts;
    }
}