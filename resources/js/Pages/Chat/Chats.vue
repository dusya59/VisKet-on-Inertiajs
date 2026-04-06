<template>
  <AppLayout>
    <Head title="Чаты" />
    <div class="chat-container">
      <div class="chat-list">
        <div class="chat-list-header" v-if="!isSearching">
          <h2>Чаты</h2>
          <button type="button" class="search-btn" @click="startSearch">
            <img src="/images/search.svg" alt="Поиск">
          </button>
        </div>
        <div v-else class="search-header">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="isGlobalSearch ? 'Поиск чатов и сообщений...' : 'Поиск в чате...'"
            class="search-input"
            @keydown.esc="closeSearch"
          />
          <button type="button" class="search-close" @click="closeSearch">
            <img src="/images/close.svg" alt="Закрыть">
          </button>
        </div>

<div
  v-if="!isSearching"
  v-for="chat in chats"
  :key="chat.id"
  @click="router.visit(`/chats/${chat.id}`)"
  class="chat-item"
  :class="{ active: activeChat && chat.id === activeChat.id, 'has-unread': chat.unread_count > 0 }"
  tabindex="0"
  @keydown.enter="router.visit(`/chats/${chat.id}`)"
>
  <div v-if="chat.other_user" class="chat-user-info">
    <div class="avatar-wrapper">
      <img :src="chat.other_user.avatar_url" class="chat-avatar" />
      <span v-if="isUserOnline(chat.other_user.id)" class="online-indicator"></span>
    </div>
    <div>
      <h3>{{ chat.other_user.name }}</h3>
      <p v-if="chat.latest_message" class="chat-preview" :class="{ unread: chat.unread_count > 0 }">
        {{ getChatPreview(chat.latest_message) }}
      </p>
    </div>
  </div>

  <div class="chat-meta">
    <span v-if="chat.unread_count > 0" class="unread-badge">{{ chat.unread_count > 99 ? '99+' : chat.unread_count }}</span>
  </div>
</div>

        <div v-if="isSearching" class="search-results">
          <div v-if="searchResults.length === 0" class="search-no-results">
            Ничего не найдено
          </div>
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="search-result-item"
            @click="goToMessage(result)"
          >
            <img :src="result.user.avatar_url" class="chat-avatar" />
            <div class="search-result-content">
              <div class="search-result-name">{{ result.user.name }}</div>
              <div v-if="result.type === 'chat'" class="search-result-type">Чат</div>
              <div v-else class="search-result-text" v-html="highlight(result.content)"></div>
            </div>
          </div>
        </div>
      </div>
        <div 
          class="chat-area" 
          :class="{ active: !!activeChat, sliding: isSliding }" 
          :style="slideOffset > 0 ? { transform: `translateX(${slideOffset}px)` } : {}"
          ref="chatArea" 
          @touchstart="onTouchStart" 
          @touchmove="onTouchMove" 
          @touchend="onTouchEnd"
        >
        <template v-if="activeChat">
          <div class="chat-header">
            <button type="button" class="back" @click="handleBackClick"> 
              <img src="/images/arrow-left.svg" alt="назад">
            </button>
            <div class="chat-header-mid">
              <Link v-if="otherUsers.length > 0" :href="`/profile/${otherUsers[0].id}`" class="chat-header-user">
                <div class="avatar-wrapper">
                  <img :src="otherUsers[0].avatar_url" class="chat-avatar" />
                  <span v-if="isUserOnline(otherUsers[0].id)" class="online-indicator"></span>
                  <span v-else class="offline-indicator"></span>
                </div>  
                  <h2>{{ otherUsers[0].name }}</h2>        
              </Link>
              <span v-if="vacancyPostId" class="vacancy-link">
                  откликнулся на 
              </span>
              <Link :href="`/posts/${vacancyPostId}`"><h2>{{ vacancyPosition }}</h2></Link>
            </div>
            <img class="chat-options" src="/images/dots.svg" alt="опции" @click.stop="toggleOptionsMenu">
          </div>

          <div v-if="isSearching && !isGlobalSearch && activeChat" class="search-navigation">
            <button type="button" class="search-nav-btn" @click="prevMatch" :disabled="currentMatchIndex <= 0">
              <img src="/images/arrow-up.svg" alt="вверх">
            </button>
            <span class="search-nav-counter">{{ searchResults.length > 0 ? currentMatchIndex + 1 : 0 }} / {{ searchResults.length }}</span>
            <button type="button" class="search-nav-btn" @click="nextMatch" :disabled="currentMatchIndex >= searchResults.length - 1">
              <img src="/images/arrow-up.svg" alt="вниз" style="transform: rotate(180deg)">
            </button>
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
              <div class="name">
                <h3>{{ activeChat.application.user.name }}</h3>
                <span class="user-status" :class="{ online: isUserOnline(otherUsers[0].id) }">
                    {{ isUserOnline(otherUsers[0].id) ? 'онлайн' : 'оффлайн' }}
                </span>
              </div>
              
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
            <div class="chat-messages-inner">
              <div class="chat-messages-content">
                <div
                  v-for="(message, index) in activeChat.messages"
                  :key="message.id"
                  :data-message-id="message.id"
                  class="message-container"
                  :class="{ 
                    'right-clicked': rightClickedMessage && rightClickedMessage.id === message.id,
                    'selected': selectedMessages.some(m => m.id === message.id),
                    'search-highlighted': isSearching && searchResults[currentMatchIndex]?.id === message.id
                  }"
                  @click="toggleMessageSelection(message)"
                  @contextmenu.prevent="showContextMenu($event, message)"
                >
                  <img :src="message.user.avatar_url" class="chat-avatar" />

                  <div class="message" :class="{ 'my-message': message.is_mine, 'shared-post': isOnlyPostUrl(message.content) }">
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
                      <span
                        v-if="message.content && !isOnlyPostUrl(message.content)"
                        v-html="renderContent(message.content)"
                      ></span>

                      <div
                        v-for="preview in getPostPreviewsFromContent(message.content)"
                        :key="preview.id"
                        class="post-preview-card"
                        :class="{ 'shared-post-card': isOnlyPostUrl(message.content) }"
                        @click.stop="router.visit(`/posts/${preview.id}`)"
                      >
                        <img
                          v-if="preview.image_url"
                          :src="preview.image_url"
                          class="post-preview-img"
                          alt=""
                        />
                        <div class="post-preview-body">
                          <div class="post-preview-title">{{ preview.title }}</div>
                          <div v-if="preview.description" class="post-preview-desc">
                            {{ preview.description.slice(0, 80) }}{{ preview.description.length > 80 ? '…' : '' }}
                          </div>
                        </div>
                      </div>

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

              <div
                v-if="showSkeleton"
              class="chat-skeleton"
              :class="{ fading: isSkeletonFading }"
            >
              <div
                v-for="(item, index) in skeletonItems"
                :key="index"
                class="skeleton-message"
                :class="{ right: item.side === 'right' }"
              >
                <div class="skeleton-avatar"></div>

                <div class="skeleton-bubble">
                  <div class="skeleton-line" :style="{ width: item.lines[0] }"></div>
                  <div class="skeleton-line short" :style="{ width: item.lines[1] }"></div>
                  <div v-if="item.hasThirdLine" class="skeleton-line tiny" :style="{ width: item.lines[2] }"></div>
                </div>
              </div>
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
                <img src="/images/clip.svg" alt="Добавить вложение" />
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
      <div v-if="!contextMenu.message?.is_mine" class="context-menu-item" @click="replyToMessage(contextMenu.message)">
        Ответить
      </div>
      <div v-if="contextMenu.message?.is_mine" class="context-menu-item" @click="editMessage(contextMenu.message)">
        Редактировать
      </div>
      <div v-if="contextMenu.message?.is_mine" class="context-menu-item delete" @click="deleteMessage(contextMenu.message)">
        Удалить
      </div>
    </div>

    <div v-if="selectedMessages.length > 0" class="selection-toolbar">
      <span>{{ selectedMessages.length }} выбрано</span>
      <button v-if="canDeleteSelected" type="button" class="selection-delete-btn" @click="deleteSelectedMessages">
        Удалить
      </button>
      <button type="button" class="selection-clear-btn" @click="clearSelection">
        Отмена
      </button>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/Layouts/AppLayout.vue'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { router } from '@inertiajs/vue3'
import Echo from 'laravel-echo';
import { postPreviewsCache, addToCache } from '@/composables/usePostPreviewsCache'

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
const slideOffset = ref(0)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  message: null
})
const rightClickedMessage = ref(null)
const editingMessage = ref(null)
const selectedMessages = ref([])
const optionsMenu = ref({
  show: false,
  x: 15,
  y: 60
})
const onlineUsers = ref(new Set())
const isSliding = ref(false)
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)

const postPreviews = ref(postPreviewsCache)
const isHydratingChat = ref(false)
const showSkeleton = ref(false)
const isSkeletonFading = ref(false)
const isMessagesStable = ref(false)
const initialScrollDone = ref(false)
let stableCheckTimer = null
let highlightMessageId = null

const isSearching = ref(false)
const searchQuery = ref('')
const searchQueryRaw = ref('')
const searchInputRef = ref(null)
const currentMatchIndex = ref(0)
const isGlobalSearch = ref(false)
const searchResultsFromApi = ref([])

async function searchChats(query) {
  if (query.length < 2) {
    searchResultsFromApi.value = []
    return
  }
  
  router.get('/chats/search', { q: query }, {
    preserveState: true,
    preserveScroll: true,
    onSuccess: (page) => {
      searchResultsFromApi.value = page.props.searchResults || []
    },
    onError: (errors) => {
      console.error('Search error:', errors)
      searchResultsFromApi.value = []
    }
  })
}

const searchResults = computed(() => {
  const query = searchQueryRaw.value.trim()
  
  if (isGlobalSearch.value) {
    return searchResultsFromApi.value
  }
  
  if (!query) return []
  
  if (props.activeChat && props.activeChat.messages) {
    return props.activeChat.messages.filter(m => 
      m.content && m.content.toLowerCase().includes(query.toLowerCase())
    ).map(m => ({ type: 'message', ...m }))
  }
  return []
})

function highlight(text) {
  if (!searchQueryRaw.value) return text || ''
  const escaped = searchQueryRaw.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return (text || '').replace(regex, '<mark>$1</mark>')
}

function startSearch() {
  searchResultsFromApi.value = []
  searchQuery.value = ''
  searchQueryRaw.value = ''
  currentMatchIndex.value = 0
  isGlobalSearch.value = true
  isSearching.value = true
  nextTick(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  })
}

function closeSearch() {
  searchQuery.value = ''
  searchQueryRaw.value = ''
  currentMatchIndex.value = 0
  searchResultsFromApi.value = []
  
  router.get('/chats', {}, {
    preserveState: true,
    onSuccess: () => {
      isSearching.value = false
      isGlobalSearch.value = false
    }
  })
}

function scrollToMessage(messageId) {
  if (!messageId) return
  nextTick(() => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function getMessageId(result) {
  return result.messageId || result.id
}

function goToMessage(result) {
  if (isGlobalSearch.value) {
    const messageId = result.messageId
    const url = messageId ? `/chats/${result.chatId}?highlight=${messageId}` : `/chats/${result.chatId}`
    
    searchQuery.value = ''
    searchQueryRaw.value = ''
    searchResultsFromApi.value = []
    isSearching.value = false
    isGlobalSearch.value = false
    currentMatchIndex.value = 0
    
    router.visit(url)
    return
  }
  
  const messageId = getMessageId(result)
  const messageIndex = props.activeChat?.messages?.findIndex(m => m.id === messageId)
  if (messageIndex !== undefined && messageIndex >= 0) {
    currentMatchIndex.value = searchResults.value.findIndex(m => getMessageId(m) === messageId)
    scrollToMessage(messageId)
  }
}

function nextMatch() {
  if (currentMatchIndex.value < searchResults.value.length - 1) {
    currentMatchIndex.value++
    scrollToMessage(getMessageId(searchResults.value[currentMatchIndex.value]))
  }
}

function prevMatch() {
  if (currentMatchIndex.value > 0) {
    currentMatchIndex.value--
    scrollToMessage(getMessageId(searchResults.value[currentMatchIndex.value]))
  }
}

watch(searchQuery, (val) => {
  searchQueryRaw.value = val
  currentMatchIndex.value = 0
  
  if (isGlobalSearch.value) {
    searchChats(val)
  } else if (searchResults.value.length > 0) {
    scrollToMessage(searchResults.value[0].id)
  }
})

const skeletonItems = computed(() => [
  { side: 'left', lines: ['42%', '58%', '32%'], hasThirdLine: true },
  { side: 'right', lines: ['55%', '40%'], hasThirdLine: false },
  { side: 'left', lines: ['68%', '34%'], hasThirdLine: false },
  { side: 'right', lines: ['48%', '62%', '28%'], hasThirdLine: true },
  { side: 'left', lines: ['38%', '52%'], hasThirdLine: false },
  { side: 'right', lines: ['60%', '44%'], hasThirdLine: false },
  { side: 'left', lines: ['72%', '36%', '24%'], hasThirdLine: true },
])

const POST_URL_REGEX = /http?:\/\/[^\/\s]+\/posts\/(\d+)/

function extractPostIds(content) {
  if (!content) return []
  const ids = []
  let match
  const regex = new RegExp(POST_URL_REGEX.source, 'g')
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1])
  }
  return [...new Set(ids)]
}

function testPostUrl(text) {
  return new RegExp(POST_URL_REGEX.source).test(text)
}

async function fetchPostPreview(postId) {
  if (postPreviewsCache[postId]) return
  postPreviewsCache[postId] = 'loading'
  try {
    const res = await fetch(`/api/posts/${postId}/preview`)
    if (!res.ok) throw new Error('not found')
    const data = await res.json()
    addToCache(postId, data)
    postPreviews.value = { ...postPreviewsCache }
  } catch {
    postPreviewsCache[postId] = 'error'
  }
}

async function loadPreviewsForMessages(messages) {
  if (!messages) return
  const promises = []
  for (const msg of messages) {
    const ids = extractPostIds(msg.content)
    for (const id of ids) promises.push(fetchPostPreview(id))
  }
  await Promise.all(promises)
}

async function hydrateChat(messages) {
  const needsFetch = messages?.some(msg => {
    const ids = extractPostIds(msg.content)
    return ids.some(id => !postPreviewsCache[id] || postPreviewsCache[id] === 'loading')
  })

  if (stableCheckTimer) clearTimeout(stableCheckTimer)

  if (needsFetch) {
    showSkeleton.value = true
    isHydratingChat.value = true
    await loadPreviewsForMessages(messages)
  }

  isMessagesStable.value = false
  initialScrollDone.value = false

  let lastHeight = 0
  let stableCount = 0
  const STABLE_THRESHOLD = 3

  const checkStable = () => {
    if (!messagesRef.value) {
      stableCheckTimer = setTimeout(checkStable, 100)
      return
    }
    const currentHeight = messagesRef.value.scrollHeight
    if (currentHeight === lastHeight && currentHeight > 0) {
      stableCount++
      if (stableCount >= STABLE_THRESHOLD) {
        isMessagesStable.value = true
        scrollToBottom(true)
        initialScrollDone.value = true

        if (highlightMessageId) {
          const messageId = parseInt(highlightMessageId, 10)
          const msgExists = props.activeChat?.messages?.some(m => m.id === messageId)
          if (msgExists) {
            nextTick(() => scrollToMessage(messageId))
          }
          highlightMessageId = null
        }

        if (needsFetch) {
          setTimeout(() => {
            isSkeletonFading.value = true
            setTimeout(() => {
              showSkeleton.value = false
              isSkeletonFading.value = false
              isHydratingChat.value = false
            }, 500)
          }, 500)
        } else {
          isHydratingChat.value = false
        }
        return
      }
    } else {
      stableCount = 0
      lastHeight = currentHeight
    }
    stableCheckTimer = setTimeout(checkStable, 100)
  }
  checkStable()
}

function getPostPreviewsFromContent(content) {
  const ids = extractPostIds(content)
  return ids
    .map(id => postPreviewsCache[id])
    .filter(p => p && p !== 'loading' && p !== 'error')
}

function renderContent(content) {
  if (!content) return ''
  return content.replace(
    /http?:\/\/[^\/\s]+\/posts\/(\d+)/g,
    (url, id) => `<a href="/posts/${id}" class="post-link" target="_blank">${url}</a>`
  )
}

function isOnlyPostUrl(content) {
  if (!content) return false
  const trimmed = content.trim()
  const regex = new RegExp(`^${POST_URL_REGEX.source.replace('\\/', '/').replace('http?', 'http?s?')}$`)
  return regex.test(trimmed)
}

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '…' : text
}

function getChatPreview(message) {
  if (!message || !message.content) return ''
  const trimmed = message.content.trim()
  if (testPostUrl(trimmed)) {
    return message.is_mine ? 'Вы поделились постом' : 'поделился(лась) постом'
  }
  return truncate(message.content, 30)
}

const formatAccountAge = (createdAt) => {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now - created
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) return `${diffDays} дней назад`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`
  return `${Math.floor(diffDays / 365)} лет назад`
}

const scrollToBottom = (force = false) => {
  nextTick(() => {
    const el = messagesRef.value
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100

    if (force || isNearBottom) {
      el.scrollTop = el.scrollHeight
    }
  })
}

const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const isMobile = () => window.innerWidth <= 1000

const resetForm = () => {
  form.reset('content', 'photo', 'video', 'document')
  photoPreviewUrl.value = null
  videoPreviewUrl.value = null
  documentPreviewName.value = null
  editingMessage.value = null
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

const otherUsers = computed(() => {
  if (!props.activeChat) return []
  const currentId = page.props.auth?.user?.id
  return props.activeChat.users.filter((u) => u.id !== currentId)
})

const vacancyPosition = computed(() => {
  if (!props.activeChat || !props.activeChat.application?.vacancy) return null
  return props.activeChat.application.vacancy.position
})

const vacancyPostId = computed(() => {
  if (!props.activeChat || !props.activeChat.application?.vacancy) return null
  return props.activeChat.application.vacancy.post_id
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

const canDeleteSelected = computed(() => {
  if (selectedMessages.value.length === 0) return false
  return selectedMessages.value.every(m => m.is_mine)
})

const isUserOnline = (userId) => {
  return onlineUsers.value.has(userId)
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

const sendMessage = () => {
  if (!props.activeChat || !canSend.value) return

  const url = editingMessage.value
    ? `/chats/${props.activeChat.id}/messages/${editingMessage.value.id}`
    : `/chats/${props.activeChat.id}/messages`

  const wasEditing = !!editingMessage.value
  const method = wasEditing ? 'put' : 'post'

  form[method](url, {
    preserveScroll: true,
    onSuccess: () => {
      resetForm()
      if (!wasEditing) {
        scrollToBottom(true)
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

const toggleMessageSelection = (message) => {
  const index = selectedMessages.value.findIndex(m => m.id === message.id)
  if (index > -1) {
    selectedMessages.value.splice(index, 1)
  } else {
    selectedMessages.value.push(message)
  }
}

const replyToMessage = (message) => {
  const prefix = message.content
    ? `>> ${message.user.name}: ${message.content.slice(0, 50)}${message.content.length > 50 ? '…' : ''}\n`
    : `>> ${message.user.name}\n`
  form.content = prefix
  hideContextMenu()
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
      autoResize()
    }
  })
}

const clearSelection = () => {
  selectedMessages.value = []
}

const deleteSelectedMessages = async () => {
  if (selectedMessages.value.length === 0) return
  
  const messagesToDelete = selectedMessages.value.filter(m => m.is_mine)
  if (messagesToDelete.length === 0) return
  
  const messageIds = messagesToDelete.map(m => m.id)
  const confirmMsg = messageIds.length === selectedMessages.value.length
    ? `Удалить ${messageIds.length} сообщение(й)?`
    : `Удалить ${messageIds.length} из ${selectedMessages.value.length} выбранных сообщений?`
  
  if (confirm(confirmMsg)) {
    for (const id of messageIds) {
      await new Promise(resolve => {
        router.delete(`/chats/${props.activeChat.id}/messages/${id}`, {
          preserveScroll: true,
          onFinish: resolve
        })
      })
    }
    selectedMessages.value = []
    hideContextMenu()
  }
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
  isGlobalSearch.value = false
  isSearching.value = true
  hideOptionsMenu()
  nextTick(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus()
    }
  })
}

const handleDeleteChat = () => {
  if (confirm('Вы уверены, что хотите удалить этот чат?')) {
    console.log('Удалить чат')
  }
  hideOptionsMenu()
}

const handleBackClick = () => {
  if (!isMobile()) {
    router.get('/chats')
    return
  }

  isSliding.value = true

  const el = chatArea.value
  if (!el) {
    router.get('/chats')
    return
  }

  const onTransitionEnd = () => {
    el.removeEventListener('transitionend', onTransitionEnd)
    router.get('/chats', {}, { preserveScroll: true })
  }

  el.addEventListener('transitionend', onTransitionEnd)
}

const toggleApplicationBlock = () => {
  isApplicationBlockClosed.value = !isApplicationBlockClosed.value
  try {
    localStorage.setItem('visket_application_block_closed', isApplicationBlockClosed.value ? '1' : '0')
  } catch (e) {
    console.error('Не удалось сохранить состояние', e)
  }
  nextTick(() => {
    scrollToBottom(true)
  })
}

const onTouchStart = (e) => {
  if (!isMobile()) return
  touchStartX.value = e.touches[0].clientX
  touchCurrentX.value = e.touches[0].clientX
  isSwiping.value = touchStartX.value < 50
  slideOffset.value = 0
}

const onTouchMove = (e) => {
  if (!isMobile() || !isSwiping.value) return
  touchCurrentX.value = e.touches[0].clientX
  const deltaX = touchCurrentX.value - touchStartX.value
  
  if (deltaX > 0) {
    slideOffset.value = deltaX
  }
}

const onTouchEnd = () => {
  if (!isMobile() || !isSwiping.value) return
  
  const deltaX = touchCurrentX.value - touchStartX.value
  
  if (deltaX > 100) {
    isSliding.value = true
    slideOffset.value = 0
    setTimeout(() => {
      router.visit('/chats')
    }, 300)
  } else {
    slideOffset.value = 0
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
const resizeObserver = new ResizeObserver(() => {
   if (props.activeChat && !isHydratingChat.value) {
      scrollToBottom(true)
    }
    })

onMounted(async () => {
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

   const urlParams = new URLSearchParams(window.location.search)
   highlightMessageId = urlParams.get('highlight')

   syncBodyClass(!!props.activeChat)
   hydrateChat(props.activeChat?.messages)

    if (messagesRef.value) {
      resizeObserver.observe(messagesRef.value)
    }
    if (chatArea.value) {
      resizeObserver.observe(chatArea.value)
    }

    const { default: Pusher } = await import('pusher-js')
    window.Pusher = Pusher

    window.Echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
      enabledTransports: ['ws'], 
    })

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

    window.Echo.join('presence-online')
      .here((users) => {
        console.log('Presence here:', users)
        onlineUsers.value = new Set(users.map(u => u.id))
      })
      .joining((user) => {
        console.log('User joined:', user)
        onlineUsers.value.add(user.id)
      })
      .leaving((user) => {
        console.log('User left:', user)
        onlineUsers.value.delete(user.id)
      })
  })

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
  document.removeEventListener('click', hideOptionsMenu)
  document.body.classList.remove('mobile-chat-open')

  if (props.activeChat && window.Echo) {
    window.Echo.leave(`chat.${props.activeChat.id}`)
  }
  
  if (window.Echo) {
    window.Echo.leave('presence-online')
  }
  if (stableCheckTimer) clearTimeout(stableCheckTimer)
  resizeObserver.disconnect()
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
    if (newLength && newLength > (oldLength || 0) && !isHydratingChat.value) {
      scrollToBottom(true)
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

.chat-list-header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 10px;
}

.search-btn {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.search-btn:hover {
    background-color: #f0f0f0;
}

.search-btn img {
    width: 22px;
    height: 22px;
}

.search-header {
  height: 50px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid #eee;
}

.search-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 14px;
    outline: none;
}

.search-input:focus {
  border-color: #007bff;
}

.search-close {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-close:hover {
    background-color: #f0f0f0;
}

.search-close img {
    width: 18px;
    height: 18px;
}

.search-results {
    max-height: calc(100vh - 120px);
    overflow-y: auto;
}

.search-no-results {
    padding: 30px;
    text-align: center;
    color: #999;
}

.search-result-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
}

.search-result-item:hover {
    background-color: #f5f5f5;
}

.search-result-content {
    flex: 1;
    min-width: 0;
}

.search-result-name {
    font-weight: 600;
    font-size: 0.9em;
    margin-bottom: 4px;
}

.search-result-text {
    font-size: 0.85em;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.search-result-type {
    font-size: 0.8em;
    color: #007bff;
    font-style: italic;
}

.search-navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 8px;
    background: #f8f8f8;
    border-bottom: 1px solid #eee;
}

.search-nav-btn {
    background: none;
    border: none;
    padding: 6px;
    cursor: pointer;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.search-nav-btn:hover:not(:disabled) {
    background-color: #e0e0e0;
}

.search-nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.search-nav-btn img {
    width: 20px;
    height: 20px;
}

.search-nav-counter {
    font-size: 13px;
    color: #666;
    min-width: 50px;
    text-align: center;
}

.search-highlighted {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

:deep(mark) {
    background-color: #ffeb3b;
    padding: 0 2px;
    border-radius: 2px;
}

.chat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
    color: #333;
    text-decoration: none;
    transition: background-color 0.2s;
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
    flex: 1;
    min-width: 0;
}

.chat-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.avatar-wrapper {
    position: relative;
    flex-shrink: 0;
}

.online-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    background-color: #22c55e;
    border: 2px solid white;
    border-radius: 50%;
}

.offline-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    background-color: #9ca3af;
    border: 2px solid white;
    border-radius: 50%;
}

.unread-badge {
    background: #ff3b30;
    color: white;
    font-size: 11px;
    font-weight: 600;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    flex-shrink: 0;
}

.chat-preview {
    color: #666;
    font-size: 0.9em;
    margin-top: 4px;
}

.chat-preview.unread {
    font-weight: 600;
    color: #333;
}

.chat-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
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
    transform: translateX(100%) !important;
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

.user-status {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.user-status.online {
  color: #22c55e;
}

.chat-area.active {
    height: 93vh;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    position: relative;
}

.chat-messages-inner {
    position: relative;
    min-height: 100%;
}

.chat-skeleton {
    position: absolute;
    inset: 0;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: white;
    z-index: 10;
    opacity: 1;
    transition: opacity 0.5s ease;
}

.chat-skeleton.fading {
    opacity: 0;
    pointer-events: none;
}

.skeleton-message {
    display: flex;
    align-items: flex-end;
    gap: 10px;
}

.skeleton-message.right {
    flex-direction: row-reverse;
}

.skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    background: linear-gradient(90deg, #e6e6e6 25%, #f3f3f3 50%, #e6e6e6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
}

.skeleton-bubble {
    max-width: 60%;
    min-width: 180px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #f1f1f1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skeleton-message.right .skeleton-bubble {
    background: #ececec;
}

.skeleton-line {
    height: 12px;
    border-radius: 999px;
    background: linear-gradient(90deg, #e2e2e2 25%, #f5f5f5 50%, #e2e2e2 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
}

.skeleton-line.short {
    height: 10px;
}

.skeleton-line.tiny {
    height: 10px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
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
  font-size: 20px;
  color: #0f172a;
}
.name{
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px 0;
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
  transition: background-color 0.2s;
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
  transition: background-color 0.2s;
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

    .chat-list h2 {
        padding: 20px;
    }

    .chat-list-header {
        padding-right: 15px;
    }

    .search-btn {
        padding: 10px;
    }

    .search-btn img {
        width: 26px;
        height: 26px;
    }

    .search-header {
        padding: 12px 15px;
    }

    .search-input {
        padding: 10px 14px;
        font-size: 16px;
    }

    .search-results {
        max-height: calc(100vh - 120px);
    }

    .search-result-item {
        padding: 15px 20px;
    }

    .chat-area {
        display: flex;
        flex-direction: column;
        max-width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        height: 100vh;
        background: white;
        z-index: 20;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }

    .chat-area.active {
        transform: translateX(0);
    }

    .chat-area.sliding {
        transform: translateX(100%);
    }

    .chat-placeholder {
        display: none;
    }

    .chat-item {
        padding: 20px;
    }

    .chat-header{
      min-width: 100vw;
    }

    .chat-avatar {
        width: 50px;
        height: 50px;
    }

    .chat-header a{
      font-size: 0.8rem;
    }

    .chat-user-info {
        gap: 16px;
    }

    .chat-user-info h3 {
        font-size: 1.1em;
    }

    .chat-preview {
        font-size: 0.95em;
    }

    .unread-badge {
        font-size: 13px;
        min-width: 22px;
        height: 22px;
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

.post-preview-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: white;
  max-width: 300px;
  transition: background 0.15s;
}

.post-preview-card:hover {
  background: #f5f5f5;
}

.post-preview-img {
  width: 300px;
  object-fit: cover;
  flex-shrink: 0;
}

.post-preview-body {
  padding: 0 10px 10px 10px;
  flex: 1;
  min-width: 0;
}

.post-preview-title {
  -webkit-line-clamp: 1;
  font-weight: 600;
  font-size: 13px;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-preview-desc {
  font-size: 12px;
  color: #666;
  margin-top: 3px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message.shared-post {
  display: flex;
  align-items: end;
  gap: 10px;
  padding: 0;
  background: transparent;
}

.shared-post-card {
  border-radius: 12px;
}

.shared-post-card .post-preview-title {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shared-post-card .post-preview-desc {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-container.selected {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.selection-toolbar {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.selection-toolbar span {
  font-size: 14px;
}

.selection-delete-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 13px;
}

.selection-delete-btn:hover {
  background: #c82333;
}

.selection-clear-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 13px;
}

.selection-clear-btn:hover {
  background: #5a6268;
}
</style>