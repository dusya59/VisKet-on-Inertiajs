<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SimpleAIService
{
    /**
     * Генерирует текст поста используя доступные бесплатные API
     * 
     * @param string $prompt Промпт для генерации
     * @param string $postType Тип поста
     * @return string
     */
    public function generatePostText(string $prompt = null, string $postType = 'portfolio_case'): string
    {
        if (!$prompt) {
            $prompt = $this->getDefaultPrompt($postType);
        }

        // Вариант 1: Пробуем HuggingFace с простой моделью
        try {
            return $this->tryHuggingFace($prompt);
        } catch (\Exception $e) {
            // Если HF не работает, используем fallback
        }

        // Вариант 2: Генерируем локально на основе шаблонов
        return $this->generateFromTemplate($postType);
    }

    /**
     * Пытается использовать HuggingFace
     */
    private function tryHuggingFace(string $prompt): string
    {
        $token = config('services.huggingface.api_token');
        
        if (empty($token)) {
            throw new \Exception('No HuggingFace token');
        }

        // Используем простую text generation модель
        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => "Bearer {$token}",
            ])
            ->post('https://api-inference.huggingface.co/models/gpt2', [
                'inputs' => $prompt,
                'parameters' => [
                    'max_length' => 200,
                    'temperature' => 0.9,
                ],
            ]);

        if ($response->successful()) {
            $data = $response->json();
            if (isset($data[0]['generated_text'])) {
                return $data[0]['generated_text'];
            }
        }

        throw new \Exception('HuggingFace failed');
    }

    /**
     * Генерирует текст на основе шаблонов (fallback)
     */
    private function generateFromTemplate(string $postType): string
    {
        $templates = [
            'vacancy' => [
                "Требуется веб-разработчик\nИщем опытного специалиста для работы над проектом интернет-магазина. Требования: знание Laravel, Vue.js, опыт от 2 лет. Оплата по договоренности.",
                "Нужен дизайнер для брендинга\nСоздание фирменного стиля для кафе. Требуется портфолио с примерами работ в HoReCa сегменте. Бюджет: 50000-80000 руб.",
                "Frontend разработчик на React\nДоработка SaaS платформы. Необходим опыт с React, TypeScript, Redux. Удаленная работа, оплата 2500 руб/час.",
                "SMM специалист\nВедение социальных сетей для IT стартапа. Контент-план, аналитика, таргет. З/П от 40000 руб/мес.",
            ],
            
            'portfolio_case' => [
                "Брендинг для кофейни Sunrise\nРазработали полный фирменный стиль: логотип, упаковка, вывеска. Использовали теплую цветовую палитру и минималистичный дизайн. Клиент доволен результатом.",
                "Интернет-магазин электроники\nСоздали с нуля на Laravel + Vue.js. Интеграция с платежными системами, личный кабинет, фильтры товаров. Запустили за 4 недели.",
                "Мобильное приложение для доставки\nUI/UX дизайн и разработка под iOS и Android. Удобный интерфейс, быстрая работа, интеграция с картами. Более 10000 скачиваний за первый месяц.",
                "Рекламная кампания для застройщика\nЗапустили таргетированную рекламу в соцсетях. ROI 280% за 2 месяца, привлечено более 200 лидов. Продолжаем сотрудничество.",
            ],
            
            'review' => [
                "Отличная работа с разработчиком\nСделал все точно в срок, качественно и профессионально. Коммуникация на высшем уровне. Рекомендую!",
                "Благодарность дизайнеру\nКреативный подход, несколько вариантов на выбор, учел все пожелания. Результат превзошел ожидания.",
                "Супер специалист по маркетингу\nГрамотная стратегия, аналитика, результаты видны уже через месяц. Буду обращаться еще.",
            ],
            
            'service_offer' => [
                "Веб-разработка на Laravel\nСоздаю сайты и веб-приложения любой сложности. 5+ лет опыта, портфолио из 50+ проектов. Пишите в ЛС.",
                "Профессиональный дизайн\nЛоготипы, брендбуки, упаковка, веб-дизайн. Работаю с брендами в HoReCa, Fashion, IT. Посмотрите портфолио!",
                "SMM и таргетированная реклама\nВедение соцсетей, настройка рекламы ВК, Instagram. Гарантирую результат. Первая консультация бесплатно.",
            ],
            
            'collaboration' => [
                "Успешная коллаборация с дизайн-студией\nСовместно реализовали проект интернет-магазина премиум-класса. Отличная командная работа, клиент в восторге.",
                "Международный проект с командой из Германии\n3D печать деталей для автомобильной промышленности. Высокая точность, соблюдение всех стандартов.",
            ],
            
            'quick_order' => [
                "СРОЧНО: Нужен верстальщик\nВерстка лендинга за 2 дня. Макет готов. Оплата сразу после сдачи. Пишите!",
                "Горящий проект: контент для сайта\nНужно написать 10 статей по SEO требованиям. Дедлайн 3 дня. Хорошая оплата.",
            ],
        ];

        $options = $templates[$postType] ?? $templates['portfolio_case'];
        return $options[array_rand($options)];
    }

    /**
     * Получает промпт по умолчанию
     */
    private function getDefaultPrompt(string $postType): string
    {
        $prompts = [
            'vacancy' => 'Write a job vacancy post for a freelancer in Russian',
            'portfolio_case' => 'Write a portfolio case study in Russian',
            'review' => 'Write a positive review in Russian',
            'service_offer' => 'Write a service offering post in Russian',
            'collaboration' => 'Write about successful collaboration in Russian',
            'quick_order' => 'Write an urgent job post in Russian',
        ];

        return $prompts[$postType] ?? $prompts['portfolio_case'];
    }

    /**
     * Генерирует несколько постов
     */
    public function generateMultiplePosts(int $count, array $prompts = [], string $postType = 'portfolio_case'): array
    {
        $posts = [];
        
        for ($i = 0; $i < $count; $i++) {
            $prompt = $prompts[$i] ?? null;
            $posts[] = $this->generatePostText($prompt, $postType);
            usleep(100000); // 0.1 сек
        }
        
        return $posts;
    }
}