<template>
  <div>
    <header>
      <Link class="logo" href="/">
        <p class="l1">vis</p>
        <p class="l2">ket</p>
      </Link>
      <div v-if="authUser" class="menu-trigger" ref="menuTrigger" @click="toggleMenu">
        <img
          v-if="authUser.avatar && authUser.avatar.startsWith('http')"
          :src="authUser.avatar"
          alt="avatar"
          class="header-avatar"
        >
        <img
          v-else-if="authUser.avatar"
          :src="'/storage/' + authUser.avatar"
          alt="avatar"
          class="header-avatar"
        >
        <img
          v-else
          src="/images/User-avatar.png"
          alt="avatar"
          class="header-avatar"
        >
        <img
          class="burger-menu"
          src="/images/burger.svg"
          alt="burger-menu"
        >
        <div class="dropdown-menu" :class="{ 'dropdown-open': menuOpen }" @click.stop>
          <template v-if="authUser.is_admin">
            <Link href="/admin" @click="closeMenu">
              <img src="/images/database.svg" alt="" class="menu-icon">
              Админ панель
            </Link>
          </template>
          <Link href="/chats" @click="closeMenu">
            <img src="/images/speech-bubble.svg" alt="" class="menu-icon">
            Чаты
            <span v-if="authUser.unreadChatsCount" class="counter-badge">{{ authUser.unreadChatsCount }}</span>
          </Link>
          <Link :href="'/profile/' + authUser.id" @click="closeMenu">
            <img src="/images/person.svg" alt="" class="menu-icon">
            Профиль
          </Link>
          <Link href="/balance" @click="closeMenu">
            <img src="/images/wallet.svg" alt="" class="menu-icon">
            Баланс: {{ authUser.balance }} ₽
          </Link>
          <Link href="/notifications" @click="closeMenu">
            <img src="/images/bell.svg" alt="" class="menu-icon">           
            Уведомления
            <span v-if="authUser.unreadNotificationsCount" class="counter-badge">{{ authUser.unreadNotificationsCount }}</span>
          </Link>
          <Link href="/settings" @click="closeMenu">
            <img src="/images/settings.svg" alt="" class="menu-icon">
            Настройки
          </Link>
          <button type="button" @click="handleLogout">
            <img src="/images/exit.svg" alt="" class="menu-icon">
            Выйти
          </button>
        </div>
      </div>
      <Link v-else href="/login" class="login-link">Войти</Link>
    </header>

    <div class="overlay overlay-active-mobile" :class="{ 'overlay-active': menuOpen }" @click="closeMenu"></div>
    <div class="mobile-menu" :class="{ 'mobile-menu-open': menuOpen }">
      <button class="mobile-menu-close" @click="closeMenu">✕</button>
      <template v-if="authUser">
        <template v-if="authUser.is_admin">
          <Link href="/admin" @click="closeMenu">Админ панель</Link>
        </template>
        <Link href="/chats" @click="closeMenu">Чаты</Link>
        <Link :href="'/profile/' + authUser.id" @click="closeMenu">Профиль</Link>
        <Link href="/balance" @click="closeMenu">Баланс: {{ authUser.balance }} ₽</Link>
        <Link href="/notifications" @click="closeMenu">Уведомления</Link>
        <Link href="/settings" @click="closeMenu">Настройки</Link>
        <div class="mobile-menu-footer">
          <button type="button" @click="handleLogout">Выйти</button>
        </div>
      </template>
      <template v-else>
        <Link href="/login" @click="closeMenu">Войти</Link>
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
import { Link, usePage, router } from '@inertiajs/vue3'
import { computed, ref, onMounted, onUnmounted } from 'vue'

const page = usePage()
const authUser = computed(() => page.props.auth?.user || page.props.authUser || null)
const menuTrigger = ref(null)

const menuOpen = ref(false)
const toggleMenu = () => menuOpen.value = !menuOpen.value
const closeMenu = () => menuOpen.value = false

const handleLogout = () => {
  closeMenu()
  router.post('/logout')
}

const handleClickOutside = (event) => {
  if (menuTrigger.value && !menuTrigger.value.contains(event.target)) {
    closeMenu()
  }
}

onMounted(() => {
  menuOpen.value = false
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const mainClass = computed(() => {
  if (
    page.component === 'Home' ||
    page.component === 'Profile/Show' ||
    page.component === 'Profile/Edit' ||
    page.component === 'Chat/Chats' ||
    page.component === 'Posts/Show' ||
    page.component === 'Admin/Index' ||
    page.component === 'Admin/Comments' ||
    page.component === 'Admin/Posts' ||
    page.component === 'Admin/Users' ||
    page.component === 'Profile/LikedPosts'||
    page.component === 'Auth/Auth.vue' ||
    page.component === 'Settings/Index' ||
    page.component === 'Settings/Notifications'
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