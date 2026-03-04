<template>
    <AppLayout>
        <Head :title="`Рейтинг ${user.name}`"/>
        <div class="ratings-page">
            <div class="back">
                <Link :href="'/profile/' + user.id">← Вернуться в профиль</Link>
            </div>
            
            <div class="rating-header">
                <img 
                    :src="user.avatar ? '/storage/' + user.avatar : '/images/User-avatar.png'" 
                    class="author-avatar"
                    :alt="`Аватар ${user.name}`"
                >
                <div class="rating-info">
                    <h1>Рейтинг {{ user.name }}</h1>
                    <div class="average-rating">
                        <span class="stars">{{ '★'.repeat(Math.round(averageRating || 0)) }}</span>
                        <span class="rating-number">{{ averageRating || '0.00' }}</span>
                        <span class="reviews-count">({{ reviewsCount }} отзывов)</span>
                    </div>
                </div>
            </div>

            <div class="reviews-list">
                <h2>Отзывы</h2>
                <div v-if="reviews.length === 0" class="no-reviews">
                    <p>Пока нет отзывов</p>
                </div>
                <div v-for="review in reviews" :key="review.id" class="review">
                    <div class="review-header">
                        <Link :href="review.reviewer.profile_url">
                            <img 
                                :src="review.reviewer.avatar_url ? review.reviewer.avatar_url : '/images/User-avatar.png'" 
                                class="reviewer-avatar"
                                :alt="`Аватар ${review.reviewer.name}`"
                            >
                            <span class="reviewer-name">{{ review.reviewer.name }}</span>
                        </Link>
                        <span class="review-rating">{{ '★'.repeat(review.rating) }}</span>
                    </div>
                    <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
                    <span class="review-date">{{ new Date(review.created_at).toLocaleDateString('ru-RU') }}</span>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link } from '@inertiajs/vue3'

const props = defineProps({
    user: Object,
    reviews: Object,
    averageRating: [Number, String],
    reviewsCount: Number
})
</script>

<style scoped>
.ratings-page {
    width: 80vw;
    min-height: 80vh;
    margin: 0 auto;
    background: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    padding: 20px;
}

.back {
    margin-bottom: 20px;
}

.back a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
}

.back a:hover {
    color: rgb(255, 52, 52);
}

.rating-header {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    margin-bottom: 30px;
}

.author-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #f0f0f0;
}

.rating-info h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 10px;
}

.average-rating {
    display: flex;
    align-items: center;
    gap: 10px;
}

.stars {
    color: #ffc107;
    font-size: 24px;
}

.rating-number {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.reviews-count {
    color: #666;
    font-size: 16px;
}

.reviews-list h2 {
    font-size: 22px;
    color: #333;
    margin-bottom: 20px;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
}

.no-reviews {
    text-align: center;
    padding: 40px;
    color: #666;
}

.review {
    padding: 20px;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
}

.review:hover {
    background-color: #f9f9f9;
}

.review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.review-header a {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #333;
}

.reviewer-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.reviewer-name {
    font-weight: 500;
}

.review-rating {
    color: #ffc107;
    font-size: 18px;
}

.review-comment {
    color: #444;
    line-height: 1.5;
    margin-bottom: 10px;
}

.review-date {
    color: #999;
    font-size: 14px;
}

@media(max-width: 768px) {
    .rating-header {
        flex-direction: column;
        text-align: center;
    }
    
    .average-rating {
        justify-content: center;
    }
}
</style>
