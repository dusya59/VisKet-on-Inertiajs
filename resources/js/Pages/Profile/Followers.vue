<template>
    <AppLayout>
        <Head :title="`Подписчики ${user.name}`"/>
        <div class="following">
            <div class="back">
                <h1>Подписчики {{ user.name }}</h1>
                <Link :href="'/profile/' + user.id">← Вернуться в профиль</Link>
            </div>
            <div v-for="follower in followers.data" :key="follower.id" class="user">
                <Link :href="'/profile/' + follower.id">
                    <img 
                        :src="follower.avatar ? `/storage/${follower.avatar}` : '/images/User-avatar.png'" 
                        class="author-avatar"
                        :alt="`Аватар ${follower.name}`"
                    >
                    {{ follower.name }}
                </Link>
                
                <div v-if="auth.user && follower.id !== auth.user.id">
                    <Link v-if="follower.is_mutual" :href="`/chats/start/${follower.id}`">
                        <button type="button" class="btn-message">Написать сообщение</button>
                    </Link>
                    <form v-else-if="follower.is_subscribed" @submit.prevent="unsubscribe(follower.id)">
                        <button type="submit" class="btn-unsubscribe">Отписаться</button>
                    </form>
                    <form v-else @submit.prevent="subscribe(follower.id)">
                        <button type="submit" class="btn-subscribe">Подписаться</button>
                    </form>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link, router, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = defineProps({
    user: Object,
    followers: Object
})

const page = usePage()
const auth = computed(() => page.props.auth)

const subscribe = (userId) => {
    router.post(`/profile/${userId}/subscribe`, {}, {
        preserveScroll: true
    })
}
const unsubscribe = (userId) => {
    router.delete(route('unsubscribe', userId), {
        preserveScroll: true
    })
}
</script>

<style scoped>
.following {
    width: 80vw;
    min-height: 80vh;
    margin: 0 auto;
    background: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    overflow: scroll;
}

.back {
    padding: 20px;
    background-color: white;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.back h1 {
    font-size: 24px;
    color: #333;
}

.back a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
}

.back a:hover {
    color: rgb(255, 52, 52);
}

.user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
}

.user:hover {
    background-color: #f5f5f5;
}

.user > a {
    display: flex;
    align-items: center;
    gap: 15px;
    text-decoration: none;
    color: #333;
    flex: 1;
}

.author-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f0f0f0;
}

.btn-subscribe,
.btn-unsubscribe,
.btn-message {
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: white;
}

.btn-subscribe {
    background-color: rgb(255, 52, 52);
}

.btn-subscribe:hover {
    background-color: rgb(230, 45, 45);
}

.btn-subscribe:active {
    background-color: rgb(205, 45, 45);
}

.btn-unsubscribe {
    background-color: #666;
}

.btn-unsubscribe:hover {
    background-color: #555;
}

.btn-unsubscribe:active {
    background-color: #444;
}

.btn-message {
    background-color: #007bff;
}

.btn-message:hover {
    background-color: #0056b3;
}

.btn-message:active {
    background-color: #004494;
}

footer {
    justify-content: space-evenly;
    width: 100%;
    height: 200px;
    background-color: rgb(211, 211, 211);
    display: flex;
}

footer div {
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
}

footer div a {
    cursor: pointer;
}

@media(max-width: 1000px) {
    main {
        padding: 150px 20px 50px;
    }

    .following {
        width: 100%;
    }

    .back {
        padding: 15px;
    }

    .back h1 {
        font-size: 32px;
    }

    .back a {
        font-size: 24px;
    }

    .user {
        padding: 15px;
    }

    .user > a {
        font-size: 24px;
    }

    .author-avatar {
        width: 70px;
        height: 70px;
    }

    .btn-subscribe,
    .btn-unsubscribe,
    .btn-message {
        padding: 15px 30px;
        font-size: 20px;
    }
}
</style>