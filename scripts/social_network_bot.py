#!/usr/bin/env python3
"""
Скрипт для автоматического создания постов в Laravel соцсети фрилансеров
Использует API для генерации контента через Groq
"""

import requests
import time
import random
from typing import List, Dict
from post_topics import (
    generate_vacancy_prompt, 
    generate_case_prompt,
    generate_post_prompt,
    SERVICE_CATEGORIES,
    POST_TEMPLATES
)

class FreelancerNetworkBot:
    def __init__(self, base_url: str):
        """
        base_url: URL вашего Laravel приложения, например http://localhost:8000
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
    
    def register_user(self, username: str, email: str, password: str, user_type: str = 'freelancer') -> Dict:
        """
        Регистрация нового пользователя
        user_type: 'freelancer' или 'employer'
        """
        response = self.session.post(
            f"{self.base_url}/api/register",
            json={
                "name": username,
                "email": email,
                "password": password,
                "password_confirmation": password,
                "user_type": user_type  # если у вас есть такое поле
            }
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✓ Пользователь {username} ({user_type}) зарегистрирован")
            
            # Сохраняем токен
            if 'token' in data:
                self.session.headers.update({
                    'Authorization': f"Bearer {data['token']}"
                })
            return data
        else:
            # Если email уже занят - пробуем залогиниться
            print(f"⚠ Email {email} уже занят, пробую войти...")
            return self.login_user(email, password)
    
    def login_user(self, email: str, password: str) -> Dict:
        """Вход существующего пользователя"""
        response = self.session.post(
            f"{self.base_url}/api/login",
            json={
                "email": email,
                "password": password
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Вход выполнен для {email}")
            
            # Сохраняем токен
            if 'token' in data:
                self.session.headers.update({
                    'Authorization': f"Bearer {data['token']}"
                })
            return data
        else:
            print(f"✗ Ошибка входа: {response.text}")
            return None
    
    def generate_post_content(self, post_type: str = 'portfolio_case', prompt: str = None) -> Dict:
        """
        Генерирует контент для поста через API
        
        post_type: vacancy, portfolio_case, review, service_offer, collaboration, quick_order
        prompt: кастомный промпт (опционально)
        """
        data = {"post_type": post_type}
        if prompt:
            data["prompt"] = prompt
        
        response = self.session.post(
            f"{self.base_url}/api/generator/post",
            json=data
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data['post']
        
        print(f"✗ Ошибка генерации: {response.text}")
        return None
    
    def create_post(self, title: str, description: str, image: str, post_type: str = 'regular') -> Dict:
        """
        Создает пост в соцсети
        
        post_type: тип поста в вашей системе ('regular', 'vacancy')
        """
        # ВАЖНО: Замените этот эндпоинт на ваш реальный API endpoint для создания постов
        response = self.session.post(
            f"{self.base_url}/api/posts",
            json={
                "title": title,
                "description": description,
                "image": image,
                "type": post_type
            }
        )
        
        if response.status_code == 201:
            print(f"✓ Пост создан: {title[:50]}...")
            return response.json()
        else:
            print(f"✗ Ошибка создания поста: {response.text}")
            return None
    
    def create_multiple_posts(
        self, 
        count: int, 
        post_types: List[str] = None,
        prompts: List[str] = None,
        delay: float = 1.0
    ):
        """
        Создает несколько постов
        
        count: количество постов
        post_types: список типов постов (опционально)
        prompts: список кастомных промптов (опционально)
        delay: задержка между постами в секундах
        """
        print(f"\n🚀 Создаю {count} постов...")
        
        # Типы постов по умолчанию
        if not post_types:
            available_types = ['vacancy', 'portfolio_case', 'review', 'service_offer', 'collaboration']
            post_types = [random.choice(available_types) for _ in range(count)]
        
        for i in range(count):
            post_type = post_types[i] if i < len(post_types) else 'portfolio_case'
            prompt = prompts[i] if prompts and i < len(prompts) else None
            
            # Генерируем контент
            print(f"\n[{i+1}/{count}] Генерирую пост ({post_type})...", end=' ')
            content = self.generate_post_content(post_type, prompt)
            
            if content:
                # Определяем тип для базы данных
                db_type = 'vacancy' if post_type == 'vacancy' else 'regular'
                
                # Создаем пост
                self.create_post(
                    title=content['title'],
                    description=content['description'],
                    image=content['image'],
                    post_type=db_type
                )
            
            # Задержка между запросами
            if i < count - 1:
                time.sleep(delay)
        
        print(f"\n✅ Завершено! Создано {count} постов")
    
    def create_realistic_scenario(self):
        """
        Создает реалистичный сценарий с разными типами пользователей и постов
        """
        import random
        scenario_id = random.randint(1000, 9999)
        
        print(f"\n🎬 Запуск реалистичного сценария (ID: {scenario_id})...\n")
        
        # Создаем работодателей
        employers = []
        for i in range(3):
            employer = {
                'username': f'employer_{scenario_id}_{i+1}',
                'email': f'employer{scenario_id}_{i+1}@example.com',
                'password': 'password123'
            }
            self.register_user(employer['username'], employer['email'], employer['password'], 'employer')
            employers.append(employer)
            time.sleep(0.5)
        
        # Создаем фрилансеров
        freelancers = []
        for i in range(5):
            freelancer = {
                'username': f'freelancer_{scenario_id}_{i+1}',
                'email': f'freelancer{scenario_id}_{i+1}@example.com',
                'password': 'password123'
            }
            self.register_user(freelancer['username'], freelancer['email'], freelancer['password'], 'freelancer')
            freelancers.append(freelancer)
            time.sleep(0.5)
        
        print("\n📝 Создаем вакансии от работодателей...")
        for employer in employers:
            # Логинимся как работодатель
            self.login_user(employer['email'], employer['password'])
            
            # Создаем 2 вакансии
            for _ in range(2):
                prompt = generate_vacancy_prompt()
                content = self.generate_post_content('vacancy', prompt)
                if content:
                    self.create_post(content['title'], content['description'], content['image'], 'vacancy')
                time.sleep(1)
        
        print("\n💼 Создаем портфолио от фрилансеров...")
        for freelancer in freelancers:
            # Логинимся как фрилансер
            self.login_user(freelancer['email'], freelancer['password'])
            
            # Создаем 3 кейса
            for _ in range(3):
                prompt = generate_case_prompt()
                content = self.generate_post_content('portfolio_case', prompt)
                if content:
                    self.create_post(content['title'], content['description'], content['image'], 'regular')
                time.sleep(1)
            
            # Создаем предложение услуг
            content = self.generate_post_content('service_offer')
            if content:
                self.create_post(content['title'], content['description'], content['image'], 'regular')
            time.sleep(1)
        
        print("\n⭐ Создаем отзывы...")
        # Некоторые работодатели оставляют отзывы
        for employer in employers[:2]:
            self.login_user(employer['email'], employer['password'])
            
            content = self.generate_post_content('review')
            if content:
                self.create_post(content['title'], content['description'], content['image'], 'regular')
            time.sleep(1)
        
        print("\n🎉 Реалистичный сценарий завершен!")


# ===== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ =====

if __name__ == "__main__":
    # Настройки
    BASE_URL = "http://localhost:8000"  # Ваш Laravel URL
    
    # Создаем бота
    bot = FreelancerNetworkBot(BASE_URL)
    
    print("Выберите режим:")
    print("1. Быстрый тест (5 случайных постов)")
    print("2. Реалистичный сценарий (много пользователей и постов)")
    print("3. Только вакансии (10 постов)")
    print("4. Только кейсы (10 постов)")
    
    # Для автоматического запуска раскомментируйте нужный вариант:
    
    # Вариант 1: Быстрый тест (используем уникальный email)
    import random
    random_id = random.randint(1000, 9999)
    bot.register_user(f"test_user_{random_id}", f"test{random_id}@example.com", "password123", "freelancer")
    bot.create_multiple_posts(count=5, delay=0.5)
    
    # Вариант 2: Реалистичный сценарий
    # bot.create_realistic_scenario()
    
    # Вариант 3: Только вакансии
    # random_id = random.randint(1000, 9999)
    # bot.register_user(f"employer_{random_id}", f"employer{random_id}@example.com", "password123", "employer")
    # prompts = [generate_vacancy_prompt() for _ in range(10)]
    # bot.create_multiple_posts(count=10, post_types=['vacancy']*10, prompts=prompts, delay=0.5)
    
    # Вариант 4: Только кейсы
    # random_id = random.randint(1000, 9999)
    # bot.register_user(f"freelancer_{random_id}", f"freelancer{random_id}@example.com", "password123", "freelancer")
    # prompts = [generate_case_prompt() for _ in range(10)]
    # bot.create_multiple_posts(count=10, post_types=['portfolio_case']*10, prompts=prompts, delay=0.5)
    
    # Вариант 5: Микс разных типов
    # random_id = random.randint(1000, 9999)
    # bot.register_user(f"mixed_{random_id}", f"mixed{random_id}@example.com", "password123")
    # post_types = ['vacancy', 'portfolio_case', 'review', 'service_offer', 'collaboration'] * 2
    # bot.create_multiple_posts(count=10, post_types=post_types, delay=0.5)