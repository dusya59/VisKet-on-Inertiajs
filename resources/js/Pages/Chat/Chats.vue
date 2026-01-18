<template>
  <AppLayout>
    <Head title="Чаты" />

    <div class="chat-container">
      <div class="chat-list">
        <div class="chat-list-header">
          <h2>Чаты</h2>
        </div>

        <Link
          v-for="chat in chats"
          :key="chat.id"
          :href="`/chats/${chat.id}`" 
          class="chat-item"
          :class="{ active: activeChat && chat.id === activeChat.id }"
        >
          <div v-if="chat.other_user" class="chat-user-info">
            <img :src="chat.other_user.avatar_url" class="chat-avatar" />
            <div>
              <h3>{{ chat.other_user.name }}</h3>
              <p v-if="chat.latest_message" class="chat-preview">
                {{ truncate(chat.latest_message.content, 30) }}
              </p>
            </div>
          </div>

          <span class="chat-time">
            <span v-if="chat.latest_message">
              {{ chat.latest_message.created_at_human }}
            </span>
          </span>
        </Link>
      </div>

      <div class="chat-area" :class="{ active: !!activeChat }">
        <template v-if="activeChat">
          <div class="chat-header">
            <div
              v-for="user in otherUsers"
              :key="user.id"
              class="chat-header-user"
            >
              <img :src="user.avatar_url" class="chat-avatar" />
              <h2>{{ user.name }}</h2>
            </div>
          </div>

          <div class="chat-messages" ref="messagesRef">
            <div
              v-for="message in activeChat.messages"
              :key="message.id"
              class="message-container"
              :class="{ 'right-clicked': rightClickedMessage && rightClickedMessage.id === message.id }"
              @contextmenu.prevent="showContextMenu($event, message)"
            >
              <img :src="message.user.avatar_url" class="chat-avatar" />

              <div class="message" :class="{ 'my-message': message.is_mine }">
                <img
                  v-if="message.image_url"
                  :src="message.image_url"
                  alt="Изображение"
                  class="message-image"
                  @click="openImage(message.image_url)"
                />
                <video
                  v-if="message.video_url"
                  :src="message.video_url"
                  class="message-video"
                  controls
                  @click.stop="openVideo(message.video_url)"
                ></video>
                <div class="message-content">
                  <div v-if="message.content">{{ message.content }}</div>

                  <div v-if="message.file_url" class="file-attachment">
                    <button
                      type="button"
                      class="file-download-circle"
                      :title="isFileDownloaded(message) ? 'Скачано' : 'Скачать'"
                      @click="downloadFile(message)"
                    >
                      <span v-if="!isFileDownloaded(message)"><img src="../../../../public/images/download.svg" alt="Cкачать" /></span>
                      <span v-else><img src="../../../../public/images/document.svg" alt="Файл" /></span>
                    </button>
                    <div class="file-meta">
                      <div class="file-name">
                        {{ message.file_name || 'Файл' }}
                      </div>
                      <div class="file-size" v-if="message.file_size">
                        {{ formatSize(message.file_size) }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>
          </div>

          <form class="message-form" @submit.prevent="sendMessage" enctype="multipart/form-data">
            <div v-if="editingMessage" class="editing-indicator">
              <span>Редактирование сообщения</span>
              <button type="button" class="cancel-edit-btn" @click="cancelEdit">✕</button>
            </div>
            <div class="message-input-container">
              <div class="add" v-if="!editingMessage">
                <img src="../../../../public/images/1911563.svg" alt="Добавить вложение" />
                <div class="add-select">
                  <label>
                    Фото
                    <input type="file" name="photo" accept="image/*" @change="onPhotoChange">
                  </label>
                  <label>
                    Видео
                    <input type="file" name="video" accept="video/*" @change="onVideoChange">
                  </label>
                  <label>
                    Документ
                    <input type="file" name="document" @change="onDocumentChange">
                  </label>
                  <label>
                    Перевести сумму
                    <input type="file" name="document" @change="onDocumentChange">
                  </label>
                </div>
              </div>

              <textarea
                ref="textareaRef"
                v-model="form.content"
                :placeholder="editingMessage ? 'Редактируйте сообщение...' : 'Введите сообщение...'"
                @input="autoResize"
                @keydown.enter.exact.prevent="sendMessage"
              ></textarea>
              <button type="submit" :disabled="form.processing || !canSend">
                {{ editingMessage ? 'Сохранить' : 'Отправить' }}
              </button>
            </div>

            <div
              v-if="photoPreviewUrl || videoPreviewUrl || documentPreviewName || editingMessage"
              class="image-preview-container"
              style="display: flex"
            >
              <img
                v-if="photoPreviewUrl"
                :src="photoPreviewUrl"
                alt="Превью"
                class="image-preview"
              />
              <video
                v-if="videoPreviewUrl"
                :src="videoPreviewUrl"
                class="video-preview"
                controls
              ></video>
              <div v-if="documentPreviewName" class="file-preview">
                📎 {{ documentPreviewName }}
              </div>
              <div class="preview-actions">
                <button type="button" class="select-other-btn" @click="selectOtherFile">
                  Выбрать другое
                </button>
                <button v-if="!editingMessage" type="button" class="cancel-preview-btn" @click="cancelPreview">
                  Отмена
                </button>
              </div>
            </div>
          </form>
        </template>

        <div v-else class="chat-placeholder">
          <p>Выберите чат для начала общения</p>
        </div>
      </div>
    </div>

    <div
      v-if="modalOpen && modalImage"
      class="modal-overlay"
      @click.self="closeModal"
      style="display: flex"
    >
      <div class="modal-content">
        <button class="modal-close" type="button" @click="closeModal">
          &times;
        </button>
        <img :src="modalImage" alt="Предпросмотр" />
      </div>
    </div>

    <div
      v-if="modalOpen && modalVideo"
      class="modal-overlay"
      @click.self="closeModal"
      style="display: flex"
    >
      <div class="modal-content modal-video-content">
        <button class="modal-close" type="button" @click="closeModal">
          &times;
        </button>
        <video :src="modalVideo" controls autoplay class="modal-video"></video>
      </div>
    </div>

    <!-- Контекстное меню -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="context-menu-item" @click="editMessage(contextMenu.message)">
        Редактировать
      </div>
      <div class="context-menu-item delete" @click="deleteMessage(contextMenu.message)">
        Удалить
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import { computed, ref, computed as vueComputed, onMounted, watch } from 'vue'
import { router } from '@inertiajs/vue3'

const props = defineProps({
  chats: Array,
  activeChat: {
    type: Object,
    default: null
  }
})

const page = usePage()

const form = useForm({
  content: '',
  photo: null,
  video: null,
  document: null
})

const textareaRef = ref(null)
const messagesRef = ref(null)
const photoPreviewUrl = ref(null)
const videoPreviewUrl = ref(null)
const documentPreviewName = ref(null)
const modalOpen = ref(false)
const modalImage = ref(null)
const modalVideo = ref(null)
const downloadedFiles = ref(new Set())
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  message: null
})
const rightClickedMessage = ref(null)
const editingMessage = ref(null)

const otherUsers = computed(() => {
  if (!props.activeChat) return []
  const currentId = page.props.auth?.user?.id
  return props.activeChat.users.filter((u) => u.id !== currentId)
})

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '…' : text
}

const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const scrollToBottom = () => {
  const el = messagesRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const onPhotoChange = (event) => {
  const file = event.target.files[0]
  form.photo = file || null

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreviewUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
    closeFileSelectMenu()
  } else {
    photoPreviewUrl.value = null
  }
}

const onVideoChange = (event) => {
  const file = event.target.files[0]
  form.video = file || null

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      videoPreviewUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
    closeFileSelectMenu()
  } else {
    videoPreviewUrl.value = null
  }
}

const onDocumentChange = (event) => {
  const file = event.target.files[0]
  form.document = file || null
  documentPreviewName.value = file ? file.name : null
  if (file) {
    closeFileSelectMenu()
  }
}

const canSend = vueComputed(() => {
  if (editingMessage.value) {
    // При редактировании можно сохранить даже без контента и файлов
    // (чтобы можно было очистить сообщение или просто отменить редактирование)
    return true
  }

  return (
    (form.content && form.content.trim().length > 0) ||
    !!form.photo ||
    !!form.video ||
    !!form.document
  )
})

const openImage = (url) => {
  modalImage.value = url
  modalVideo.value = null
  modalOpen.value = true
}

const openVideo = (url) => {
  modalVideo.value = url
  modalImage.value = null
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  modalImage.value = null
  modalVideo.value = null
}

const cancelPreview = () => {
  form.reset('photo', 'video', 'document')
  photoPreviewUrl.value = null
  videoPreviewUrl.value = null
  documentPreviewName.value = null
}

const selectOtherFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '*/*'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      form.photo = null
      form.video = null
      form.document = null

      if (file.type.startsWith('image/')) {
        form.photo = file
        const reader = new FileReader()
        reader.onload = (e) => {
          photoPreviewUrl.value = e.target.result
          videoPreviewUrl.value = null
          documentPreviewName.value = null
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        form.video = file
        const reader = new FileReader()
        reader.onload = (e) => {
          videoPreviewUrl.value = e.target.result
          photoPreviewUrl.value = null
          documentPreviewName.value = null
        }
        reader.readAsDataURL(file)
      } else {
        form.document = file
        documentPreviewName.value = file.name
        photoPreviewUrl.value = null
        videoPreviewUrl.value = null
      }
    }
  }
  input.click()
}

const persistDownloaded = () => {
  try {
    const arr = Array.from(downloadedFiles.value)
    window.localStorage.setItem('visket_downloaded_files', JSON.stringify(arr))
  } catch (e) {
    console.error('Не удалось сохранить состояние скачанных файлов', e)
  }
}

const isFileDownloaded = (message) => {
  if (!message.file_name) return false
  return downloadedFiles.value.has(message.file_name)
}

const downloadFile = (message) => {
  if (!message.file_url) return

  const link = document.createElement('a')
  link.href = message.file_url
  link.download = message.file_name || ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  if (message.file_name) {
    downloadedFiles.value.add(message.file_name)
    persistDownloaded()
  }
}

const sendMessage = () => {
  if (!props.activeChat) return

  if (!canSend.value) return

  console.log('Sending message:', {
    editing: !!editingMessage.value,
    content: form.content,
    hasPhoto: !!form.photo,
    hasVideo: !!form.video,
    hasDocument: !!form.document,
    photoType: form.photo?.type,
    videoType: form.video?.type,
    documentType: form.document?.type
  })

  const url = editingMessage.value
    ? `/chats/${props.activeChat.id}/messages/${editingMessage.value.id}`
    : `/chats/${props.activeChat.id}/messages`

  const method = editingMessage.value ? 'put' : 'post'

  const options = {
    preserveScroll: true,
    onSuccess: () => {
      const wasEditing = editingMessage.value
      form.reset('content', 'photo', 'video', 'document', '_method')
      photoPreviewUrl.value = null
      videoPreviewUrl.value = null
      documentPreviewName.value = null
      editingMessage.value = null
      if (!wasEditing) {
        scrollToBottom()
      }
    }
  }
  if (form.photo || form.video || form.document) {
    const formData = new FormData()

    if (form.content) {
      formData.append('content', form.content)
    }

    if (form.photo) {
      formData.append('photo', form.photo)
    }
    if (form.video) {
      formData.append('video', form.video)
    }
    if (form.document) {
      formData.append('document', form.document)
    }

    // Добавляем CSRF токен
    let csrfToken = null
    const tokenMeta = document.querySelector('meta[name="csrf-token"]')
    if (tokenMeta) {
      csrfToken = tokenMeta.getAttribute('content')
    } else {
      // Альтернативный способ - из cookie
      const csrfCookie = document.cookie.split(';').find(c => c.trim().startsWith('XSRF-TOKEN='))
      if (csrfCookie) {
        csrfToken = decodeURIComponent(csrfCookie.split('=')[1])
      }
    }

    console.log('Sending FormData manually, CSRF token found:', !!csrfToken, csrfToken?.substring(0, 10) + '...')

    const method = 'POST'
    if (editingMessage.value) {
      formData.append('_method', 'PUT')
    }

    fetch(url, {
      method: method,
      body: formData,
      credentials: 'same-origin',
      headers: {
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => {
      console.log('Response status:', response.status, response.statusText)

      if (response.redirected) {
        console.log('Redirected to:', response.url)
        window.location.href = response.url
      } else if (response.ok) {
        console.log('Request successful')
        const wasEditing = editingMessage.value
        form.reset('content', 'photo', 'video', 'document', '_method')
        photoPreviewUrl.value = null
        videoPreviewUrl.value = null
        documentPreviewName.value = null
        editingMessage.value = null
        // Не прокручиваем при редактировании сообщения
        if (!wasEditing) {
          scrollToBottom()
        }
      } else {
        console.error('Request failed with status:', response.status)
        return response.text().then(text => {
          console.error('Response body:', text)
        })
      }
    })
    .catch(error => {
      console.error('Ошибка при отправке:', error)
    })

    return
  }

  form[method](url, {
    ...options,
    onError: (errors) => {
      console.error('Ошибка при отправке сообщения:', errors)
    }
  })
}

onMounted(() => {
  try {
    const raw = window.localStorage.getItem('visket_downloaded_files')
    if (raw) {
      const arr = JSON.parse(raw)
      downloadedFiles.value = new Set(Array.isArray(arr) ? arr : [])
    }
  } catch (e) {
    console.error('Не удалось прочитать состояние скачанных файлов', e)
  }

  document.addEventListener('click', hideContextMenu)

  scrollToBottom()
})

watch(
  () => props.activeChat && props.activeChat.messages.length,
  () => {
    scrollToBottom()
  }
)

const formatSize = (bytes) => {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) {
    return kb.toFixed(1) + ' КБ'
  }
  const mb = kb / 1024
  return mb.toFixed(2) + ' МБ'
}

const showContextMenu = (event, message) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    message: message
  }
  rightClickedMessage.value = message
}

const hideContextMenu = () => {
  contextMenu.value.show = false
  rightClickedMessage.value = null
}

const deleteMessage = (message) => {
  if (confirm('Вы уверены, что хотите удалить это сообщение?')) {
    router.delete(`/chats/${props.activeChat.id}/messages/${message.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        hideContextMenu()
      }
    })
  } else {
    hideContextMenu()
  }
}

const editMessage = (message) => {
  editingMessage.value = message
  form.content = message.content

  console.log('Editing message:', {
    id: message.id,
    content: message.content,
    hasImage: !!message.image_url,
    hasVideo: !!message.video_url,
    hasFile: !!message.file_url,
    image_url: message.image_url,
    video_url: message.video_url,
    file_url: message.file_url
  })

  // Загружаем файлы сообщения в preview для редактирования
  // Показываем все файлы, которые есть у сообщения
  photoPreviewUrl.value = message.image_url || null
  videoPreviewUrl.value = message.video_url || null
  documentPreviewName.value = message.file_url ? message.file_name : null

  hideContextMenu()
}

const cancelEdit = () => {
  editingMessage.value = null
  form.content = ''
  // Очищаем preview при отмене редактирования
  photoPreviewUrl.value = null
  videoPreviewUrl.value = null
  documentPreviewName.value = null
  form.reset('photo', 'video', 'document')
}

</script>
<style scoped>

.chat-container {
    display: flex;
    height: 100vh;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    padding: 70px 0 0 0 ;
}

.chat-list {
    width: 350px;
    border-right: 1px solid #eee;
    overflow-y: auto;
    background-color: white;
}
.chat-list h2{
    padding:10px ;
}
.chat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
    color: #333;
    text-decoration: none;
    transition: background 0.2s;
}

.chat-item:hover {
    background: #f9f9f9;
}

.chat-item.active {
    background-color: #c8c8c8;
}

.chat-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.chat-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
}

.chat-preview {
    color: #666;
    font-size: 0.9em;
    margin-top: 4px;
}

.chat-time {
    font-size: 0.8em;
    color: #999;
}

.chat-area {
    max-width: 81%;
    flex: 1;
    display: flex;
    flex-direction: column;
    
}

.chat-header {
    padding: 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 15px;
}
.chat-area.active{
    height: 90vh;
}
.chat-messages {
    flex: 1;
    overflow-y: auto;
}

.message {
    max-width: 60%;
    width: max-content;
    word-wrap: break-word;
    padding: 10px 15px;
    border-radius: 15px;
    background: #eaeaea;
    position: relative;
}

.my-message {

    background: #dcf8c6;
}

.message-time {
    font-size: 0.75em;
    color: #666;
    text-align: right;
    margin-top: 5px;
}

.message-form {
    flex-direction: column;
    padding: 15px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
}

.message-form textarea {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    resize: none;
    height: 45px;
}

.message-form button {
    padding: 15px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

.chat-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 1.2em;
}
.back{
    display: none;
}

.add {

    position: relative;
    cursor: pointer;
}
.add img{
    width: 50px;
    height: 50px;
}
.add-select {
    display: none;
    flex-direction: column;
    position: absolute;
    bottom: 100%;
    left: 0;
    background: white;
    border: 1px solid #ddd;

    z-index: 1000;
    min-width: 150px;
}

.add:hover .add-select {
    display: flex;
}

.add-select label {
    width: 100%;
    display: block;
    padding: 15px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.add-select label:hover {
    background-color: #c8c8c8;
}

.add-select input[type="file"] {
    display: none;
}

.message img {
    max-width: 300px;
    height: auto;
    border-radius: 4px;
    margin-bottom: 5px;
}
.message-video {
    max-width: 300px;
    max-height: 300px;
    border-radius: 4px;
    margin-bottom: 5px;
    cursor: pointer;
}
.video-preview {
    max-width: 200px;
    max-height: 200px;
    border-radius: 4px;
}
.modal-video-content {
    max-width: 90%;
    max-height: 90vh;
}
.modal-video {
    width: 100%;
    max-height: 90vh;
    border-radius: 8px;
}
.message-container{
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 10px;
    transition: background-color 0.2s;
}

.message-container.right-clicked {
    background-color: rgba(0, 0, 0, 0.05);
}
.file-attachment{
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
}
.file-attachment img{
    margin-top: 5px;
    width: 25px;
    height: 25px;
}
.file-attachment span{
    width: 30px;
    height: 30px;
    display: flex;
    align-items:center;
    justify-content: center;
}
.file-download-circle{
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: #007bff;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: background-color 0.2s;

}
.file-download-circle:hover{
    background: #005fcc;
}
.file-meta{
    display: flex;
    flex-direction: column;
}
.file-name{
    font-size: 0.9em;
}
.file-size{
    font-size: 0.8em;
    color: #666;
}
.modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 1000;
    justify-content: center;
    align-items: center;
}

.modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90vh;
}

.modal-content img {
    width: 600px;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-close {
    position: absolute;
    top: -40px;
    right: 0;
    color: white;
    font-size: 24px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 5px;
}

.modal-close:hover {
    color: #ddd;
}
.image-preview-container{
    gap: 10px;
    align-items: flex-start;
}
.message-input-container{
    display: flex;  
    align-items: center;
    width: 100%;
    gap: 10px;
}
.image-preview{
    width: 100px;
    height: auto;
    overflow: hidden;
    border-radius: 5px;
    margin-left: 10px;
}
.context-menu {
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    min-width: 150px;
    padding: 5px 0;
}
.context-menu-item {
    padding: 10px 15px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}
.context-menu-item:hover {
    background-color: #f8f9fa;
}
.context-menu-item.delete:hover {
    background-color: #ffe6e6;
    color: #dc3545;
}
.cancel-preview-btn {
    border-radius: 20px;
    border: none;
    background: #dc3545;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}
.cancel-preview-btn:hover {
    background: #c82333;
}
.preview-actions {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-left: 10px;
}
.select-other-btn {
    padding: 8px 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}
.select-other-btn:hover {
    background: #0056b3;
}
.file-select-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    min-width: 150px;
}
.file-select-menu label {
    display: block;
    padding: 8px 0;
    cursor: pointer;
    font-size: 14px;
}
.file-select-menu label:hover {
    background-color: #f8f9fa;
}
.file-select-menu input[type="file"] {
    display: none;
}
.editing-indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 15px;
    background-color: #fff3cd;
    border-bottom: 1px solid #ffeaa7;
    font-size: 14px;
    color: #856404;
}
.cancel-edit-btn {
    background: none;
    border: none;
    color: #856404;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.cancel-edit-btn:hover {
    color: #533f00;
}
</style>