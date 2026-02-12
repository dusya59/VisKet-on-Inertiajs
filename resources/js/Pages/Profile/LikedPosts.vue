<template>
    <AppLayout>
        <Head :title="`Понравившиеся посты ${user.name}`"/>
        <div class="likeshead">
            <h2>Лайки {{ user.name }}</h2>
            <Link :href="'/profile/' + user.id">← Вернуться в профиль</Link>
        </div>
        <h1 v-if="likedPosts.length === 0" class="noposts">
            У {{ user.name }} пока что нет понравившихся постов...
        </h1>
        <div v-else class="posts">
            <Post
                v-for="like in likedPosts"
                :key="like.id"
                :post="like.post"
                :url="`/posts/${like.post.id}`"
            />
        </div>
    </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link } from '@inertiajs/vue3'
import Post from '@/Components/Post.vue'

defineProps({
    user: Object,
    likedPosts: Array
})
</script>

<style scoped>
.likeshead{
    width: 80%;
    display: flex;
    justify-content: space-between;
}


.likeshead a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
}

.likeshead a:hover {
    color: rgb(255, 52, 52);
}
</style>