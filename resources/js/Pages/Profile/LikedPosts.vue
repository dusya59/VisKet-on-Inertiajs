<template>
    <AppLayout>
        <Head :title="`Понравившиеся посты ${user.name}`"/>
        <div class="likes-wrapper">
            <div class="likeshead">
                <h1>Лайки {{ user.name }}</h1>
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
        </div>
    </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link } from '@inertiajs/vue3'
import Post from '@/Components/Post.vue'
import { useDarkMode } from '@/composables/useDarkMode'

defineProps({
    user: Object,
    likedPosts: Array
})

useDarkMode()
</script>

<style scoped>
.likes-wrapper {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
}

.likeshead{
    width: 80%;
    margin: 0 auto;
    padding: 30px;
    height: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.likeshead a {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
}

.likeshead a:hover {
    color: rgb(255, 52, 52);
}

.noposts {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

html.dark .likeshead a {
    color: #94a3b8;
}
</style>
