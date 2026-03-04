<template>
  <Head><link rel="stylesheet" href="../../css/app.css"></Head>
  <div>
  <header>
  <Link class="logo" href="/">
  <p class="l1">vis</p>
  <p class="l2">ket</p>
  </Link>
  <nav>
    <template v-if="authUser">
    <template v-if="authUser.is_admin">
    <Link href="/admin">Админ панель</Link>
    </template>
    <Link href="/chats">Список чатов</Link>
    <Link :href="'/profile/' + authUser.id">Мой профиль</Link>
    <button type="button" @click="handleLogout">Выйти</button>
    </template>
    <template v-else>
    <Link href="/login">Войти</Link>
    <Link href="/register">Регистрация</Link>
    </template>
  </nav>
<img 
  class="burger-menu" 
  src="../../../public/build/assets/burger-menu-svgrepo-com.svg" 
  alt="burger-menu"
  @click="toggleMenu"
>
</header>
<div class="overlay" :class="{ 'overlay-active': menuOpen }" @click="closeMenu"></div>
<div class="mobile-menu" :class="{ 'mobile-menu-open': menuOpen }">
  <button class="mobile-menu-close" @click="closeMenu">✕</button>

  <template v-if="authUser">
    <template v-if="authUser.is_admin">
      <Link href="/admin" @click="closeMenu">Админ панель</Link>
    </template>
    <Link href="/chats" @click="closeMenu">Чаты</Link>
    <Link :href="'/profile/' + authUser.id" @click="closeMenu">Профиль</Link>
    <div class="mobile-menu-footer">
      <button type="button" @click="handleLogout">Выйти</button>
    </div>
  </template>
  <template v-else>
    <Link href="/login" @click="closeMenu">Войти</Link>
    <Link href="/register" @click="closeMenu">Регистрация</Link>
  </template>
</div>

<main :class="mainClass">
<slot></slot>
</main>
<footer :class="footerClass">
<div>
<a>Адрес компании</a>
<a>Телефонный номер</a>
<a>Электронная почта</a>
</div>
<div>
<a>О нас</a>
<a>Услуги или продукты</a>
<a>Часто задаваемые вопросы (FAQ)</a>
</div>
<div>
<a>Политика конфиденциальности</a>
<a>Условия использования</a>
<a>© 2025 Все права защищены.</a>
</div>
</footer>
</div>
</template>

<script setup>
import { Head, Link, usePage, router } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

const page = usePage()
const authUser = computed(() => page.props.auth?.user || page.props.user || null)

const menuOpen = ref(false)
const toggleMenu = () => menuOpen.value = !menuOpen.value
const closeMenu = () => menuOpen.value = false

const handleLogout = () => {
  closeMenu()
  router.post('/logout')
}

const mainClass = computed(() => {
  if (
    page.component === 'Home' ||
    page.component === 'Profile/Show' ||
    page.component === 'Profile/Edit' ||
    page.component === 'Chat/Chats' ||
    page.component === 'Posts/Show'
  ) {
    return 'main-home'
  }
  return 'main-padded'
})

const footerClass = computed(() => {
  if (page.component === 'Chat/Chats') {
    return 'footer-hidden'
  }
  return ''
})
</script>

<style>
.main-home {
  padding: 0;
}
.main-padded {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 100px;
  min-height: 95vh;
  height: fit-content;
  flex-direction: column;
}
.footer-hidden {
  display: none;
}

</style>