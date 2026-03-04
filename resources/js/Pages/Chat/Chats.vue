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

      <div class="chat-area" :class="{ active: !!activeChat, sliding: isSliding }" ref="chatArea" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <template v-if="activeChat">
          <div class="chat-header">
            <Link class="back" @click="handleBackClick"> 
              <img src="/images/arrow-left.svg" alt="назад">
            </Link>
            <div class="chat-header-mid">
              <Link v-if="otherUsers.length > 0" :href="`/profile/${otherUsers[0].id}`" class="chat-header-user">
                  <img :src="otherUsers[0].avatar_url" class="chat-avatar" />
                  <h2>{{ otherUsers[0].name }}</h2>
              </Link>
              <span v-if="vacancyPostId" class="vacancy-link">
                  откликнулся на 
              </span>
              <Link :href="`/posts/${vacancyPostId}`"><h2>{{ vacancyPosition }}</h2></Link>
            </div>
            <img class="chat-options" src="/images/dots.svg" alt="опции" @click.stop="toggleOptionsMenu">
          </div>

          <div
            v-if="optionsMenu.show"
            class="options-menu"
            :style="{ right: optionsMenu.x + 'px', top: optionsMenu.y + 'px' }"
          >
            <div class="options-menu-item" @click="handleChatFiles">Файлы чата</div>
            <div class="options-menu-item" @click="handleAddParticipant">Добавить участника в чат</div>
            <div class="options-menu-item" @click="handleSearchChat">Поиск по чату</div>
            <div class="options-menu-item delete" @click="handleDeleteChat">Удалить чат</div>
          </div>

          <div 
            v-if="showApplicationBlock" 
            class="application-block"
            :class="{ closed: isApplicationBlockClosed }"
          >
            <div class="application-toggle">
              <button 
                type="button" 
                class="application-toggle-btn" 
                @click="toggleApplicationBlock"
              >
            
                <img 
                  src="/images/arrow-up.svg" 
                  alt="Toggle" 
                  class="toggle-arrow"
                  :class="{ flipped: isApplicationBlockClosed }"
                />
              </button>
            </div>
            <div class="application-card" v-show="!isApplicationBlockClosed">
              <img 
                :src="activeChat.application.user.avatar_url" 
                class="application-avatar"
              />
              <h3>{{ activeChat.application.user.name }}</h3>
              <p class="account-age">Аккаунт создан {{ formatAccountAge(activeChat.application.user.created_at) }}</p>
              
              <div v-if="activeChat.application.user.rating" class="application-rating">
                <span>Рейтинг: {{ activeChat.application.user.rating }}</span>
              </div>
              
              <div class="application-cover-letter">
                <h4>Сопроводительное письмо:</h4>
                <p>{{ activeChat.application.cover_letter }}</p>
              </div>
              
              <div v-if="activeChat.application.proposed_price" class="application-price">
                <span class="label">Предложенная цена:</span>
                <span class="value">{{ activeChat.application.proposed_price }} ₽</span>
              </div>
              
              <div v-if="isVacancyAuthor" class="application-actions">
                <form @submit.prevent="acceptApplication">
                  <button type="submit" class="accept-btn">Принять отклик</button>
                </form>
                <form @submit.prevent="rejectApplication">
                  <button type="submit" class="reject-btn">Отклонить</button>
                </form>
              </div>
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
                      <span v-if="!isFileDownloaded(message)"><img src="/images/download.svg" alt="Скачать" /></span>
                      <span v-else><img src="/images/document.svg" alt="Файл" /></span>
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
                <img src="/images/1911563.svg" alt="Добавить вложение" />
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
              v-if="photoPreviewUrl || videoPreviewUrl || documentPreviewName"
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
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { router } from '@inertiajs/vue3'
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

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
const chatArea = ref(null)
const photoPreviewUrl = ref(null)
const isApplicationBlockClosed = ref(false)
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
const optionsMenu = ref({
  show: false,
  x: 15,
  y: 60
})
const isSliding = ref(false)
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)

const isMobile = () => window.innerWidth <= 1000

const otherUsers = computed(() => {
  if (!props.activeChat) return []
  const currentId = page.props.auth?.user?.id
  return props.activeChat.users.filter((u) => u.id !== currentId)
})

const showApplicationBlock = computed(() => {
  if (!props.activeChat) return false
  if (!props.activeChat.application) return false
  if (props.activeChat.application.status !== 'pending') return false
  return true
})

const isVacancyAuthor = computed(() => {
  if (!props.activeChat || !props.activeChat.application) return false
  const currentUserId = page.props.auth?.user?.id
  const applicantId = props.activeChat.application.user.id
  return currentUserId !== applicantId
})

const vacancyPosition = computed(() => {
  if (!props.activeChat || !props.activeChat.application?.vacancy) return null
  return props.activeChat.application.vacancy.position
})

const vacancyPostId = computed(() => {
  if (!props.activeChat || !props.activeChat.application?.vacancy) return null
  return props.activeChat.application.vacancy.post_id
})

const applicationUserName = computed(() => {
  if (!props.activeChat || !props.activeChat.application?.user) return ''
  return props.activeChat.application.user.name
})

const formatAccountAge = (createdAt) => {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now - created
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays} дней назад`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`
  return `${Math.floor(diffDays / 365)} лет назад`
}

const acceptApplication = () => {
  router.post(`/applications/${props.activeChat.application.id}/accept`, {}, {
    preserveScroll: true,
  })
}

const rejectApplication = () => {
  router.post(`/applications/${props.activeChat.application.id}/reject`, {}, {
    preserveScroll: true,
  })
}

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
  nextTick(() => {
    const el = messagesRef.value
    if (!el) return
    el.scrollTop = el.scrollHeight
  })
}

const resetForm = () => {
  form.reset('content', 'photo', 'video', 'document')
  photoPreviewUrl.value = null
  videoPreviewUrl.value = null
  documentPreviewName.value = null
  editingMessage.value = null
}

const onPhotoChange = (event) => {
  const file = event.target.files[0]
  form.photo = file || null

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreviewUrl.value = e.target.result
      videoPreviewUrl.value = null
      documentPreviewName.value = null
    }
    reader.readAsDataURL(file)
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
      photoPreviewUrl.value = null
      documentPreviewName.value = null
    }
    reader.readAsDataURL(file)
  } else {
    videoPreviewUrl.value = null
  }
}

const onDocumentChange = (event) => {
  const file = event.target.files[0]
  form.document = file || null
  documentPreviewName.value = file ? file.name : null
  
  if (file) {
    photoPreviewUrl.value = null
    videoPreviewUrl.value = null
  }
}

const canSend = computed(() => {
  if (editingMessage.value) {
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

const getCsrfToken = () => {
  const tokenMeta = document.querySelector('meta[name="csrf-token"]')
  if (tokenMeta) {
    return tokenMeta.getAttribute('content')
  }
  
  const csrfCookie = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('XSRF-TOKEN='))
  
  if (csrfCookie) {
    return decodeURIComponent(csrfCookie.split('=')[1])
  }
  
  return null
}

const sendMessage = () => {
  if (!props.activeChat || !canSend.value) return

  const url = editingMessage.value
    ? `/chats/${props.activeChat.id}/messages/${editingMessage.value.id}`
    : `/chats/${props.activeChat.id}/messages`

  const wasEditing = !!editingMessage.value

  if (form.photo || form.video || form.document) {
    const formData = new FormData()

    formData.append('content', form.content ?? '')

    if (form.photo) {
      formData.append('photo', form.photo)
    }
    if (form.video) {
      formData.append('video', form.video)
    }
    if (form.document) {
      formData.append('document', form.document)
    }

    if (wasEditing) {
      formData.append('_method', 'PUT')
    }

    const csrfToken = getCsrfToken()

    fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers: {
        'X-CSRF-TOKEN': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => {
      if (response.redirected) {
        window.location.href = response.url
      } else if (response.ok) {
        resetForm()
        if (!wasEditing) {
          scrollToBottom()
        }
        router.reload({ only: ['activeChat'] })
      } else {
        return response.text().then(text => {
          console.error('Request failed:', response.status, text)
          alert('Ошибка при отправке сообщения')
        })
      }
    })
    .catch(error => {
      console.error('Ошибка при отправке:', error)
      alert('Ошибка при отправке сообщения')
    })

    return
  }

  const method = wasEditing ? 'put' : 'post'

  form[method](url, {
    preserveScroll: true,
    onSuccess: () => {
      resetForm()
      if (!wasEditing) {
        scrollToBottom()
      }
    },
    onError: (errors) => {
      console.error('Ошибка при отправке сообщения:', errors)
    }
  })
}

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
  if (!message.is_mine) return
  
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
  form.content = message.content || ''

  photoPreviewUrl.value = message.image_url || null
  videoPreviewUrl.value = message.video_url || null
  documentPreviewName.value = message.file_url ? message.file_name : null

  hideContextMenu()
  
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
      autoResize()
    }
  })
}

const cancelEdit = () => {
  resetForm()
}

const toggleOptionsMenu = () => {
  optionsMenu.value.show = !optionsMenu.value.show
}

const hideOptionsMenu = () => {
  optionsMenu.value.show = false
}

const handleChatFiles = () => {
  console.log('Файлы чата')
  hideOptionsMenu()
}

const handleAddParticipant = () => {
  console.log('Добавить участника')
  hideOptionsMenu()
}

const handleSearchChat = () => {
  console.log('Поиск по чату')
  hideOptionsMenu()
}

const handleDeleteChat = () => {
  if (confirm('Вы уверены, что хотите удалить этот чат?')) {
    console.log('Удалить чат')
  }
  hideOptionsMenu()
}

const handleBackClick = () => {
  if (isMobile()) {
    isSliding.value = true
    setTimeout(() => {
      router.visit('/chats')
    }, 300)
  } else {
    router.visit('/chats')
  }
}

const toggleApplicationBlock = () => {
  isApplicationBlockClosed.value = !isApplicationBlockClosed.value
  try {
    localStorage.setItem('visket_application_block_closed', isApplicationBlockClosed.value ? '1' : '0')
  } catch (e) {
    console.error('Не удалось сохранить состояние', e)
  }
}

const onTouchStart = (e) => {
  if (!isMobile()) return
  touchStartX.value = e.touches[0].clientX
  touchCurrentX.value = e.touches[0].clientX
  isSwiping.value = touchStartX.value < 50
}

const onTouchMove = (e) => {
  if (!isMobile() || !isSwiping.value) return
  touchCurrentX.value = e.touches[0].clientX
  const deltaX = touchCurrentX.value - touchStartX.value
  
  if (deltaX > 0 && chatArea.value) {
    chatArea.value.style.transform = `translateX(${deltaX}px)`
  }
}

const onTouchEnd = () => {
  if (!isMobile() || !isSwiping.value) return
  
  const deltaX = touchCurrentX.value - touchStartX.value
  
  if (deltaX > 100) {
    isSliding.value = true
    if (chatArea.value) {
      chatArea.value.style.transform = 'translateX(100%)'
    }
    setTimeout(() => {
      router.visit('/chats')
    }, 300)
  } else {
    if (chatArea.value) {
      chatArea.value.style.transform = ''
    }
  }
  
  isSwiping.value = false
}

const syncBodyClass = (hasActiveChat) => {
  if (hasActiveChat) {
    document.body.classList.add('mobile-chat-open')
  } else {
    document.body.classList.remove('mobile-chat-open')
  }
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

  try {
    const closed = localStorage.getItem('visket_application_block_closed')
    if (closed === '1') {
      isApplicationBlockClosed.value = true
    }
  } catch (e) {
    console.error('Не удалось прочитать состояние блока', e)
  }

  document.addEventListener('click', hideContextMenu)
  document.addEventListener('click', hideOptionsMenu)

  syncBodyClass(!!props.activeChat)
  scrollToBottom()

  window.Pusher = Pusher;

  window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'false',
    enabledTransports: ['ws', 'wss'],
  });

  if (props.activeChat) {
    window.Echo.private(`chat.${props.activeChat.id}`)
      .listen('.message.sent', (e) => {
        router.reload({ only: ['activeChat'] })
      })
      .listen('.message.updated', (e) => {
        router.reload({ only: ['activeChat'] })
      })
      .listen('.message.deleted', (e) => {
        router.reload({ only: ['activeChat'] })
      });
  }
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
  document.removeEventListener('click', hideOptionsMenu)
  document.body.classList.remove('mobile-chat-open')

  if (props.activeChat && window.Echo) {
    window.Echo.leave(`chat.${props.activeChat.id}`)
  }
})

watch(
  () => props.activeChat,
  (newVal) => {
    syncBodyClass(!!newVal)
  }
)

watch(
  () => props.activeChat?.id,
  (newChatId, oldChatId) => {
    if (!window.Echo) return;
    
    if (oldChatId) {
      window.Echo.leave(`chat.${oldChatId}`)
    }
    
    if (newChatId) {
      window.Echo.private(`chat.${newChatId}`)
        .listen('.message.sent', (e) => {
          router.reload({ only: ['activeChat'] })
        })
        .listen('.message.updated', (e) => {
          router.reload({ only: ['activeChat'] })
        })
        .listen('.message.deleted', (e) => {
          router.reload({ only: ['activeChat'] })
        });
    }
  }
)

watch(
  () => props.activeChat?.messages?.length,
  (newLength, oldLength) => {
    if (newLength && newLength > (oldLength || 0)) {
      scrollToBottom()
    }
  }
)
</script>

<style scoped>

.chat-container {
    display: flex;
    height: 93vh;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

.chat-list {
    width: 350px;
    border-right: 1px solid #eee;
    overflow-y: auto;
    background-color: white;
}

.chat-list h2 {
    padding: 10px;
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
    transition: transform 0.3s ease;
    position: relative;
}

.chat-area.sliding {
    transform: translateX(100%);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.chat-options{
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.back{
  background: none;
  border: none;
}

.back img{
  width: 30px;
  height: 30px;
  cursor: pointer;
}
.chat-header-mid{
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
}
.chat-header-user{
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 15px;
}
.vacancy-link{
  height: 25px;
  display: flex;
  align-items: end;
}
.chat-header a{
  text-decoration: none;
  color: black;
}

.vacancy-link {
  font-size: 14px;
  color: #666;
}

.vacancy-link a {
  color: #007bff;
  text-decoration: none;
}

.vacancy-link a:hover {
  text-decoration: underline;
}

.chat-area.active {
    height: 93vh;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

.message-container {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 10px;
    transition: background-color 0.2s;
    margin-bottom: 10px;
}

.message-container.right-clicked {
    background-color: rgba(0, 0, 0, 0.05);
}
.message-container .chat-avatar{
    position: sticky;
    bottom: 0;
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
  justify-self: flex-end;
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

.message-input-container {
    display: flex;  
    align-items: center;
    width: 100%;
    gap: 10px;
}

.message-form textarea {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    resize: none;
    min-height: 45px;
    max-height: 150px;
}

.message-form button {
    padding: 15px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
}

.message-form button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.chat-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 1.2em;
}

.add {
    position: relative;
    cursor: pointer;
}

.add img {
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
    border-radius: 8px;
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

.message-image {
    max-width: 300px;
    height: auto;
    border-radius: 4px;
    margin-bottom: 5px;
    cursor: pointer;
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

.modal-video-content {
    max-width: 90%;
    max-height: 90vh;
}

.modal-video {
    width: 100%;
    max-height: 90vh;
    border-radius: 8px;
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

.image-preview-container {
    gap: 10px;
    align-items: flex-start;
}

.image-preview {
    width: 100px;
    height: auto;
    overflow: hidden;
    border-radius: 5px;
    margin-left: 10px;
}

.file-attachment {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
}

.file-attachment img {
    margin-top: 5px;
    width: 25px;
    height: 25px;
}

.file-download-circle {
    min-width: 48px;
    min-height: 48px;
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

.file-download-circle:hover {
    background: #005fcc;
}

.file-meta {
    display: flex;
    flex-direction: column;
}

.file-name {
    font-size: 0.9em;
    word-wrap: anywhere;
}

.file-size {
    font-size: 0.8em;
    color: #666;
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

.options-menu {
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    min-width: 200px;
    padding: 5px 0;
}

.options-menu-item {
    padding: 12px 20px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.options-menu-item:hover {
    background-color: #f8f9fa;
}

.options-menu-item.delete:hover {
    background-color: #ffe6e6;
    color: #dc3545;
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

.cancel-preview-btn {
    padding: 8px 12px;
    border-radius: 5px;
    border: none;
    background: #dc3545;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
}

.cancel-preview-btn:hover {
    background: #c82333;
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

.application-block {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}
.application-toggle{
  position: absolute;
}
.application-toggle-btn {
  position: absolute;
  bottom: -35px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.application-toggle-btn img {
  width: 16px;
  height: 16px;
}

.application-toggle-btn img.flipped {
  transform: rotate(180deg);
}

.application-card {
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.application-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
}

.application-card h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #0f172a;
}

.account-age {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 12px;
}

.application-rating {
  margin-bottom: 16px;
  font-weight: 600;
  color: #334155;
}

.application-cover-letter {
  text-align: left;
  margin-bottom: 16px;
  padding: 12px;
  background: #f1f5f9;
  border-radius: 8px;
}

.application-cover-letter h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #475569;
}

.application-cover-letter p {
  margin: 0;
  color: #334155;
  line-height: 1.5;
  white-space: pre-wrap;
}

.application-price {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
  margin-bottom: 16px;
}

.application-price .label {
  color: #475569;
}

.application-price .value {
  font-weight: 600;
  color: #16a34a;
}

.application-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.accept-btn {
  padding: 10px 20px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.accept-btn:hover {
  background: #15803d;
}

.reject-btn {
  padding: 10px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.reject-btn:hover {
  background: #b91c1c;
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

.file-preview {
    padding: 10px;
    background: #f5f5f5;
    border-radius: 5px;
}

@media (max-width: 1000px) {
    .chat-container {
        padding: 0;
        border: none;
        border-radius: 0;
    }

    .chat-list {
        width: 100%;
        position: absolute;
        left: 0;
        top: 60px;
        height: calc(100vh - 60px);
        z-index: 10;
    }

    .chat-area {
        display: none;
        max-width: 100%;
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        height: 100vh;
        background: white;
        z-index: 20;
    }

    .chat-area.active {
        display: flex;
        flex-direction: column;
        height: 100vh;
        transform: none;
    }

    .chat-area.sliding {
        transform: translateX(100%);
    }

    .chat-item {
        padding: 12px;
    }

    .chat-avatar {
        width: 40px;
        height: 40px;
    }

    .chat-user-info h3 {
        font-size: 0.95em;
    }

    .chat-preview {
        font-size: 0.85em;
    }

    .chat-header {
        padding: 12px;
    }

    .chat-messages {
        padding: 10px;
    }

    .message-container {
        padding: 5px;
        gap: 8px;
    }

    .message {
        max-width: 75%;
        padding: 8px 12px;
    }

    .message-image {
        max-width: 200px;
    }

    .message-video {
        max-width: 200px;
        max-height: 200px;
    }

    .message-form {
        padding: 10px;
    }

    .message-input-container {
        gap: 8px;
    }

    .add img {
        width: 40px;
        height: 40px;
    }

    .message-form textarea {
        padding: 8px;
        font-size: 14px;
    }

    .message-form button {
        padding: 10px 15px;
        font-size: 14px;
    }

    .modal-content img {
        width: 100%;
        max-width: 90vw;
    }

    .modal-close {
        top: 10px;
        right: 10px;
        font-size: 30px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .image-preview {
        width: 80px;
    }

    .video-preview {
        max-width: 150px;
        max-height: 150px;
    }

    .file-download-circle {
        min-width: 40px;
        min-height: 40px;
    }

    .file-attachment img {
        width: 20px;
        height: 20px;
    }

    .file-name {
        font-size: 0.85em;
    }

    .file-size {
        font-size: 0.75em;
    }

    .context-menu {
        min-width: 120px;
    }

    .context-menu-item {
        padding: 12px;
        font-size: 15px;
    }

    .options-menu {
        min-width: 180px;
    }

    .options-menu-item {
        padding: 14px 18px;
        font-size: 15px;
    }

    .editing-indicator {
        padding: 10px;
        font-size: 13px;
    }

    .preview-actions {
        margin-left: 5px;
    }

    .select-other-btn,
    .cancel-preview-btn {
        padding: 10px;
        font-size: 13px;
    }

    .chat-placeholder {
        font-size: 1em;
        padding: 20px;
        text-align: center;
    }

    .add-select {
        min-width: 120px;
    }

    .add-select label {
        padding: 12px;
        font-size: 14px;
    }
}
</style>