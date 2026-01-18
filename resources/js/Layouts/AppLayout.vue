<template>
  <Head><link rel="stylesheet" href="../../css/app.css"></Head>
  <div>
    <header :class="mainHeader">
      <Link class="logo" href="/">
        <p class="l1">vis</p>
        <p class="l2">ket</p>
      </Link>

      <nav>
        <template v-if="authUser">
          <template v-if="authUser.is_admin">
            <Link href="/admin.index">Админ панель</Link>
          </template>

          <Link href="/chats">Список чатов</Link>
          <Link v-if="auth.user":href="'/profile/' + auth.user.id">Мой профиль</Link>

          <button type="button" @click="handleLogout">Выйти</button>

        </template>

        <template v-else>
          <Link href="/login">Войти</Link>
          <Link href="/register">Регистрация</Link>
        </template>
      </nav>
    </header>

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
import { Head, Link, usePage, router} from '@inertiajs/vue3'
import { computed, onMounted, ref } from 'vue'
const auth = computed(() => page.props.auth);
const page = usePage()
const authUser = computed(() => {
  return page.props.auth?.user || 
         page.props.user || null
})

const handleLogout = () => {
    router.post('/logout');
};
const mainClass = computed(() => {
  if (
    page.component === 'Home' ||
    page.component === 'Profile/Show' ||
    page.component === 'Chat/Chats'
  ) {
    return 'main-home';
  }
  return 'main-padded';
});

const footerClass = computed(() => {
  // Скрываем футер на странице чатов
  if (page.component === 'Chat/Chats') {
    return 'footer-hidden';
  }
  return '';
});

const mainHeader = computed(() => {
  if (page.component === 'Home') {
    return 'header-white';
  }

    return 'header-grey';
});
</script>



<style>
  .header-white {
  background-color: none; 
}

.header-grey {
  background-color: rgb(211, 211, 211); 
}
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
