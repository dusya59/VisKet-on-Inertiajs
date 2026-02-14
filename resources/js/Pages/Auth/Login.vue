<template>
  <div class="Authblock">
    <Head title="Вход" />
    <div class="container">
      <h1>С возвращением</h1>
      <p>Зачем вы вообще разлогинились?</p>
    </div>
    <form @submit.prevent="submit">
      <h1>Вход</h1>
      <input type="email" v-model="form.email" placeholder="Email" required>
      <input type="password" v-model="form.password" placeholder="Пароль" required>
      
      <div v-if="errors" class="alert">
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      
      <button type="submit" :disabled="form.processing">Войти</button>
      <Link href="/register">Нет аккаунта? Зарегистрироваться</Link>
    </form>
  </div>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link, useForm } from '@inertiajs/vue3'

const form = useForm({
  email: '',
  password: '',
})

const props = defineProps({
  errors: Object
})

const submit = () => {
  form.post('/login')
}
</script>

<style scoped>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Neucha&family=Rubik+Spray+Paint&display=swap');
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Montserrat", serif;;
}
@font-face {
    font-family: 'Krasnodar';
    src: url('Krasnodar.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'cakra';
    src: url('../Cakra-Normal.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
}
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
form input[type="password"] {
  font-size: 10px;
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

a{
    text-decoration: none;
    color: black;
}
a:hover{
    text-decoration: underline;
}

.Authblock{
    display: flex;
    border:1px solid rgb(182, 182, 182);
    border-radius: 10px;
    overflow: hidden;
}
footer{
    justify-content: space-evenly;
    width: 100%;
    height: 200px;
    background-color: rgb(211, 211, 211);
    display: flex;

}
footer div{
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
}
footer div a{
    cursor: pointer;
}
.alert{
    position: absolute;
    margin: 165px 0;
}
.alert li{
    margin: 30px 20px;
    height: 27.6px;
}

@media(max-width:1000px){
    header{
        height: 100px;
        font-size: 32px;
        z-index: 10;
    }
    header button{
        width: 150px;
        height: 60px;
        font-size: 26px;
    }
    header div{
        gap: 40px;
        font-size:38px ;
    }
    header div a{
        width: min-content;
    }
    a.logo{
        font-size: 68px;
    }
    footer{
        font-size: 28px;
        height:300px;
    }
    footer div{
        width: 33vw;
        height:300px;
        display: flex;
        align-items: center;
        text-align: center;
    }
    footer div a{
        height: 70px;
    }
    .block{
        width: 800px;
        height: 1250px;
        flex-direction: column;
    }

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
    .register .alert{
        font-size: 28px;
        margin: 620px 0 0 40px;
    }
}
</style>
<script>
export default {
  layout: AppLayout
}
</script>