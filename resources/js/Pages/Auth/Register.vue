<template>
  <div class="Authblock register">
    <Head title="Регистрация" />
    <form @submit.prevent="submit">
      <h1>Регистрация</h1>
      <input type="text" v-model="form.name" placeholder="Имя" required>
      <input type="email" v-model="form.email" placeholder="Email" required>
      <input type="password" v-model="form.password" placeholder="Пароль" required>
      <input type="password" v-model="form.password_confirmation" placeholder="Подтвердите пароль" required>
        <div v-if="errors" class="alert">
            <ul>
                <li v-for="error in errors" :key="error">{{ error }}</li>
            </ul>
        </div>
      <button type="submit" :disabled="form.processing">Зарегистрироваться</button>
      <Link href="/login">Уже есть аккаунт? Войти</Link>
    </form>
    <div class="container">
      <h1>Добро пожаловать</h1>
      <p>Готовы себя показать?</p>
    </div>
  </div>
</template>

<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3'
import AppLayout from '@/Layouts/AppLayout.vue'
const form = useForm({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const props = defineProps({
  errors: Object
})

const submit = () => {
  form.post('/register')
}
</script>

<style scoped>
.container{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 500px;
    height: 600px;
    background-color: rgb(255, 52, 52);
}
.container h1{
    font-size: 48px;
    font-family: 'cakra';
    color: white;
}
.container p{
    font-size: 26px;
    font-family: 'cakra';
    color: white;
}
form{
    width: 500px;
    height: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px;
}
form input{
    margin-top: 30px;
    width: 300px;
    height: 30px;
    padding: 5px;
    border: solid black 1px;
    border-radius: 5px;
    font-size: 14px;
}
form button{
    margin: 100px 0 20px 0;
    width: 300px;
    height: 50px;
    background-color: rgb(255, 52, 52);
    border: none;
    border-radius: 5px;
    padding: 10px;
}
form button:hover{
    background-color: rgb(230, 45, 45);
}

form button:active{
    background-color: rgb(205, 45, 45);
}

.Authblock{
    display: flex;
    border:1px solid rgb(182, 182, 182);
    border-radius: 10px;
    overflow: hidden;
}
.alert{
    position: absolute;
    margin: 165px 0;
}
.register .alert{
    margin: 290px 0 0 0;
}

.alert li{
    margin: 10px;
}
@media(max-width:1000px){
    .container{
        height: 250px;
        width: 800px;
        justify-content: flex-start;
        padding-top:50px ;
    }
    .container h1{
        font-size: 68px;
    }
    .container p{
        font-size: 36px;
    }
    .block>form{
        font-size: 32px;
        height: 1300px;
        width: 800px;
    }
    .block>form input{
        width: 600px;
        height: 100px;
        border-radius: 20px;
        font-size: 32px;
    }
    .block>form button{
        width: 600px;
        height: 100px;
        font-size: 30px;
        border-radius: 20px;
    }
    .alert{
        margin: 355px 0 0 0px;
    }
    .register .container{
        height: 200px;
    }
    .register{
        flex-direction: column-reverse;
    }
    .register>form{
        height: 1050px;
        padding-bottom: 20px;
        padding-top: 50px;
    }
    .register>form button{
        margin-top: 190px;
    }
}
</style>
<script>
export default {
  layout: AppLayout
}
</script>