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
          :class="{ 
            active: activeChat && chat.id === activeChat.id, 
            'has-unread': chat.unread_count > 0,
            'accepted-chat': chat.application && ['accepted', 'in_progress', 'disputed'].includes(chat.application.status)
          }"
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
                {{ isVacancyAuthor ? 'откликнулся на' : 'автор вакансии' }}
              </span>
              <Link :href="`/posts/${vacancyPostId}`" class="vacancy-position"><h2>{{ vacancyPosition }}</h2></Link>
            </div>
            <img class="chat-options" src="/images/dots.svg" alt="опции" @click.stop="toggleOptionsMenu($event)">
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
              
              <div v-if="activeChat.application.proposed_price" class="application-price-row">
                <div class="application-price">
                  <span class="label">Предложенная цена:</span>
                  <span class="value">{{ activeChat.application.proposed_price }} ₽</span>
                </div>
                <button 
                  v-if="isVacancyAuthor && activeChat.application.status === 'pending'"
                  type="button" 
                  class="price-edit-btn"
                  @click="showPriceModal = true"
                >
                  <img src="/images/edit.svg" alt="Изменить цену">
                </button>
              </div>

                  <div v-if="activeChat.application.status === 'completed'" class="application-status">
                <span class="status-badge completed">✅ Сделка завершена</span>
              </div>

              <div v-if="activeChat.application.status === 'cancelled'" class="application-status">
                <span class="status-badge cancelled">❌ Сделка отменена</span>
              </div>

              <div v-if="activeChat.application.status === 'disputed' || (activeChat.application.dispute && activeChat.application.dispute.status === 'open')" class="application-status">
                <span class="status-badge dispute">⚠️ Открыт спор</span>
              </div>

              <div v-if="isVacancyAuthor" class="application-actions">
                <template v-if="activeChat.application.status === 'pending'">
                  <form @submit.prevent="acceptApplication">
                    <button type="submit" class="accept-btn">Принять отклик</button>
                  </form>
                  <form @submit.prevent="rejectApplication">
                    <button type="submit" class="reject-btn">Отклонить</button>
                  </form>
                </template>

                <template v-else-if="activeChat.application.status === 'in_progress'">
                  <form v-if="activeChat.application.executor_marked_completed_at" @submit.prevent="confirmCompletion">
                    <button type="submit" class="accept-btn">Подтвердить завершение</button>
                  </form>
                  <button v-if="!activeChat.application.executor_marked_completed_at" type="button" class="withdraw-btn" @click="openCancelModal = true">
                    Отменить
                  </button>
                </template>

                <template v-else-if="activeChat.application.status === 'accepted'">
                  <button type="button" class="withdraw-btn" @click="openCancelModal = true">
                    Отменить
                  </button>
                </template>
              </div>

              <div v-if="!isVacancyAuthor" class="application-actions">
                <template v-if="activeChat.application.status === 'in_progress' && !activeChat.application.executor_marked_completed_at">
                  <form @submit.prevent="markCompleted">
                    <button type="submit" class="accept-btn">Отметить как выполненное</button>
                  </form>
                  <button type="button" class="withdraw-btn" @click="openCancelModal = true">
                    Отменить
                  </button>
                </template>

                <template v-if="activeChat.application.status === 'in_progress' && activeChat.application.executor_marked_completed_at">
                  <button type="button" class="withdraw-btn" @click="openCancelModal = true">
                    Отменить
                  </button>
                  <button type="button" class="dispute-btn" @click="openDisputeModal = true">
                    Открыть спор
                  </button>
                </template>

                <template v-if="activeChat.application.status === 'accepted'">
                  <button type="button" class="dispute-btn" @click="openDisputeModal = true">
                    Открыть спор
                  </button>
                </template>
              </div>
            </div>
          </div>

          <div class="chat-messages" ref="messagesRef">
            <div class="chat-messages-inner">
              <TransitionGroup name="messages" tag="div" class="chat-messages-content">
                <div
                  v-for="(message, index) in localMessages"
                  :key="message._clientId || message.id"
                  :data-message-id="message.id"
                  class="message-container"
                  :class="{ 
                    'right-clicked': rightClickedMessage && rightClickedMessage.id === message.id,
                    'selected': selectedMessages.some(m => m.id === message.id),
                    'search-highlighted': isSearching && searchResults[currentMatchIndex]?.id === message.id
                  }"
                  @click="toggleMessageSelection(message, $event)"
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
                    <div class="message-content" @click="handleMessageContentClick">
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
                      <div v-if="message.is_price_proposal && message.price_proposal_status === 'pending' && !message.is_mine" class="price-proposal-actions">
                        <form @submit.prevent="acceptPriceProposal(message)" class="price-action-form">
                          <button type="submit" class="accept-price-btn" @click.stop>Принять</button>
                        </form>
                        <button type="button" class="change-price-btn" @click.stop="openPriceChangeModal(message)">Изменить</button>
                      </div>
                    </div>
                    <div class="message-time">
                      <span>{{ message.time }}</span>
                      <span v-if="getMessageStatus(message)" class="message-status" :class="getMessageStatus(message)">
                        <img v-if="getMessageStatus(message) === 'sending'" src="/images/loading.svg" alt="Отправляется" class="status-icon spinning" />
                        <img v-else-if="getMessageStatus(message) === 'sent'" src="/images/check-mark.svg" alt="Отправлено" class="status-icon" />
                        <img v-else-if="getMessageStatus(message) === 'read'" src="/images/double-check.svg" alt="Прочитано" class="status-icon" style="width: 16px; height: 16px;"/>
                        <img v-else-if="getMessageStatus(message) === 'failed'" src="/images/exclamation-circle.svg" alt="Не отправлено" class="status-icon" />
                      </span>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
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
          </form>
        </template>

        <div v-else class="chat-placeholder">
          <p>Выберите чат для начала общения</p>
        </div>
      </div>

      <div v-if="showChatFiles" class="chat-files-panel">
        <div class="chat-files-header">
          <h3>Файлы чата</h3>
          <button type="button" class="chat-files-close" @click="closeChatFiles">
            <img src="/images/close.svg" alt="Закрыть">
          </button>
        </div>
        <div class="chat-files-tabs">
          <button 
            type="button" 
            class="chat-files-tab" 
            :class="{ active: chatFilesTab === 'media' }"
            @click="chatFilesTab = 'media'"
          >
            Медиа
          </button>
          <button 
            type="button" 
            class="chat-files-tab" 
            :class="{ active: chatFilesTab === 'files' }"
            @click="chatFilesTab = 'files'"
          >
            Файлы
          </button>
          <button 
            type="button" 
            class="chat-files-tab" 
            :class="{ active: chatFilesTab === 'links' }"
            @click="chatFilesTab = 'links'"
          >
            Ссылки
          </button>
        </div>
        <div class="chat-files-content">
          <div v-if="chatFilesTab === 'media'" class="chat-files-media">
            <div v-if="chatMediaFiles.length === 0" class="chat-files-empty">
              Нет медиафайлов
            </div>
            <div v-else class="chat-files-grid">
              <div 
                v-for="media in chatMediaFiles" 
                :key="media.id" 
                class="chat-files-media-item"
                @click="media.type === 'video' ? openVideo(media.url) : openImage(media.url)"
              >
                <img v-if="media.type === 'image'" :src="media.url" alt="Медиа">
                <video v-else :src="media.url"></video>
                <div v-if="media.type === 'video'" class="play-icon">▶</div>
              </div>
            </div>
          </div>
          <div v-if="chatFilesTab === 'files'" class="chat-files-list">
            <div v-if="chatDocFiles.length === 0" class="chat-files-empty">
              Нет файлов
            </div>
            <div v-else>
              <div 
                v-for="file in chatDocFiles" 
                :key="file.id" 
                class="chat-files-item"
              >
                <button type="button" class="file-download-circle" @click="downloadFile(file)">
                  <img src="/images/download.svg" alt="Скачать">
                </button>
                <div class="file-info">
                  <div class="file-name">{{ file.file_name }}</div>
                  <div class="file-size">{{ formatSize(file.file_size) }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="chatFilesTab === 'links'" class="chat-files-list">
            <div v-if="chatLinks.length === 0" class="chat-files-empty">
              Нет ссылок
            </div>
            <div v-else>
              <div 
                v-for="link in chatLinks" 
                :key="link.id" 
                class="chat-files-link"
                @click="handleLinkClick(link.url)"
              >
                <span class="link-text">{{ link.content }}</span>
                <span class="link-time">{{ link.time }}</span>
              </div>
            </div>
          </div>
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

    <div v-if="showPriceModal" class="modal-overlay" style="display: flex" @click.self="showPriceModal = false">
      <div class="price-modal">
        <div class="price-modal-header">
          <h3>Предложить новую цену</h3>
          <button type="button" class="modal-close" @click="showPriceModal = false">
            <img src="/images/close.svg" alt="Закрыть">
          </button>
        </div>
        <form @submit.prevent="submitPriceProposal">
          <div class="price-modal-body">
            <label for="new-price">Новая цена (₽):</label>
            <input 
              id="new-price"
              v-model="priceForm.proposed_price"
              type="number"
              min="0"
              max="9999999999"
              placeholder="Введите сумму"
              required
            />
          </div>
          <div class="price-modal-footer">
            <button type="button" class="cancel-btn" @click="showPriceModal = false">Отмена</button>
            <button type="submit" class="submit-btn">Предложить</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="priceChangeModal.show" class="modal-overlay" style="display: flex" @click.self="priceChangeModal.show = false">
      <div class="price-modal">
        <div class="price-modal-header">
          <h3>Предложить новую цену</h3>
          <button type="button" class="modal-close" @click="priceChangeModal.show = false">
            <img src="/images/close.svg" alt="Закрыть">
          </button>
        </div>
        <form @submit.prevent="submitPriceChange">
          <div class="price-modal-body">
            <p class="price-modal-info">Текущее предложение: {{ priceChangeModal.message?.proposed_price }} ₽</p>
            <label for="new-price-change">Новая цена (₽):</label>
            <input 
              id="new-price-change"
              v-model="priceChangeModal.newPrice"
              type="number"
              min="0"
              max="9999999999"
              placeholder="Введите сумму"
              required
            />
          </div>
          <div class="price-modal-footer">
            <button type="button" class="cancel-btn" @click="priceChangeModal.show = false">Отмена</button>
            <button type="submit" class="submit-btn">Предложить</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="openDisputeModal" class="modal-overlay" style="display: flex" @click.self="openDisputeModal = false">
      <div class="price-modal">
        <div class="price-modal-header">
          <h3>Открыть спор</h3>
          <button type="button" class="modal-close" @click="openDisputeModal = false">
            <img src="/images/close.svg" alt="Закрыть">
          </button>
        </div>
        <form @submit.prevent="submitDispute">
          <div class="price-modal-body">
            <label for="dispute-reason">Причина спора:</label>
            <textarea
              id="dispute-reason"
              v-model="disputeForm.reason"
              rows="5"
              minlength="10"
              maxlength="5000"
              placeholder="Опишите причину спора (минимум 10 символов)"
              required
            ></textarea>
          </div>
          <div class="price-modal-footer">
            <button type="button" class="cancel-btn" @click="openDisputeModal = false">Отмена</button>
            <button type="submit" class="submit-btn">Отправить</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="openCancelModal" class="modal-overlay" style="display: flex" @click.self="openCancelModal = false">
      <div class="price-modal">
        <div class="price-modal-header">
          <h3>Отмена сделки</h3>
          <button type="button" class="modal-close" @click="openCancelModal = false">
            <img src="/images/close.svg" alt="Закрыть">
          </button>
        </div>
        <form @submit.prevent="submitCancel">
          <div class="price-modal-body">
            <label for="cancel-reason">Причина отмены:</label>
            <textarea
              id="cancel-reason"
              v-model="cancelForm.reason"
              rows="5"
              minlength="5"
              maxlength="5000"
              placeholder="Опишите причину отмены (минимум 5 символов)"
              required
            ></textarea>
          </div>
          <div class="price-modal-footer">
            <button type="button" class="cancel-btn" @click="openCancelModal = false">Назад</button>
            <button type="submit" class="reject-btn">Подтвердить отмену</button>
          </div>
        </form>
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
import { postPreviewsCache, addToCache } from '@/composables/usePostPreviewsCache'
import { useDarkMode } from '@/composables/useDarkMode'

const props = defineProps({
  chats: Array,
  activeChat: {
    type: Object,
    default: null
  }
})

const page = usePage()
useDarkMode()

const form = useForm({
  content: '',
  photo: null,
  video: null,
  document: null,
  file_name: null
})

function toLocalPath(url) {
  try {
    const parsed = new URL(url)
    const currentHost = window.location.hostname
    const isLocal = parsed.hostname === currentHost || 
                    (parsed.hostname === '127.0.0.1' && (currentHost === '127.0.0.1' || currentHost === 'localhost')) ||
                    (currentHost === '127.0.0.1' && parsed.hostname === 'localhost')
    if (isLocal) {
      return parsed.pathname + parsed.search + parsed.hash
    }
  } catch (e) {
    if (url.startsWith('/')) {
      return url
    }
  }
  return null
}

function openExternal(url) {
  window.open(url, '_blank')
}

function handleLinkClick(url) {
  const path = toLocalPath(url)
  if (path) {
    router.visit(path)
  } else {
    window.open(url, '_blank')
  }
}

function handleMessageContentClick(event) {
  const link = event.target.closest('a')
  if (link) {
    event.preventDefault()
    const url = link.getAttribute('href')
    handleLinkClick(url)
  }
}

const textareaRef = ref(null)
const messagesRef = ref(null)
const chatArea = ref(null)
const photoPreviewUrl = ref(null)
const isApplicationBlockClosed = ref(false)
const videoPreviewUrl = ref(null)
const documentPreviewName = ref(null)
const showPriceModal = ref(false)
const priceForm = ref({
  proposed_price: ''
})
const priceChangeModal = ref({
  show: false,
  message: null,
  newPrice: ''
})
const openDisputeModal = ref(false)
const disputeForm = ref({
  reason: ''
})
const openCancelModal = ref(false)
const cancelForm = ref({
  reason: ''
})
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
const showChatFiles = ref(false)
const chatFilesTab = ref('media')
const onlineUsers = ref(new Set())
const isSliding = ref(false)
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)

const mergeMessages = (newMessages) => {
  newMessages.forEach(newMsg => {
    const existing = localMessages.value.find(m => m.id === newMsg.id || m._clientId === newMsg._clientId)
    if (existing) {
      Object.assign(existing, newMsg)
    } else {
      localMessages.value.push(newMsg)
    }
  })
}

const localMessages = ref([])

const postPreviews = ref(postPreviewsCache)
const isHydratingChat = ref(false)
const showSkeleton = ref(false)
const isSkeletonFading = ref(false)
const isMessagesStable = ref(false)
const initialScrollDone = ref(false)
let stableCheckTimer = null
let highlightMessageId = null
const pendingTempIds = new Set()

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
  postPreviews.value = { ...postPreviewsCache }
  try {
    const res = await fetch(`/api/posts/${postId}/preview`)
    if (!res.ok) throw new Error('not found')
    const data = await res.json()
    addToCache(postId, data)
    postPreviews.value = { ...postPreviewsCache }
  } catch {
    postPreviewsCache[postId] = 'error'
    postPreviews.value = { ...postPreviewsCache }
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
        
        if (highlightMessageId) {
          const messageId = parseInt(highlightMessageId, 10)
          const msgExists = props.activeChat?.messages?.some(m => m.id === messageId)
          if (msgExists) {
            nextTick(() => scrollToMessage(messageId))
          }
          highlightMessageId = null
        } else {
          scrollToBottom(true)
        }
        initialScrollDone.value = true

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
    .map(id => postPreviews.value[id])
    .filter(p => p && p !== 'loading' && p !== 'error')
}

function renderContent(content) {
  if (!content) return ''
  let result = content.replace(
    /http?:\/\/[^\/\s]+\/posts\/(\d+)/g,
    (url, id) => `<a href="/posts/${id}" class="post-link" data-link="local">${url}</a>`
  )
  result = result.replace(
    /(https?:\/\/[^\s<]+)/g,
    (url) => `<a href="${url}" class="message-link" style="color:#007bff;" target="_blank" rel="noopener">${url}</a>`
  )
  return result
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
  
  const years = Math.floor(diffDays / 365)
  const yearsMod10 = years % 10
  const yearsMod100 = years % 100
  
  let yearText
  if (yearsMod100 >= 11 && yearsMod100 <= 19) {
    yearText = 'лет'
  } else if (yearsMod10 === 1) {
    yearText = 'год'
  } else if (yearsMod10 >= 2 && yearsMod10 <= 4) {
    yearText = 'года'
  } else {
    yearText = 'лет'
  }
  
  return `${years} ${yearText} назад`
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
  form.reset('content', 'photo', 'video', 'document', 'file_name')
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

const withdrawApplication = () => {
  router.post(`/applications/${props.activeChat.application.id}/withdraw`, {}, {
    preserveScroll: true,
  })
}

const closeVacancy = () => {
  router.post(`/applications/${props.activeChat.application.id}/close-vacancy`, {}, {
    preserveScroll: true,
  })
}

const confirmCompletion = () => {
  router.post(`/applications/${props.activeChat.application.id}/confirm-completion`, {}, {
    preserveScroll: true,
  })
}

const markCompleted = () => {
  router.post(`/applications/${props.activeChat.application.id}/mark-completed`, {}, {
    preserveScroll: true,
  })
}

const submitCancel = () => {
  if (!cancelForm.value.reason || cancelForm.value.reason.length < 5) {
    return
  }

  router.post(`/applications/${props.activeChat.application.id}/cancel`, {
    reason: cancelForm.value.reason
  }, {
    preserveScroll: true,
    onSuccess: () => {
      openCancelModal.value = false
      cancelForm.value.reason = ''
    }
  })
}

const submitDispute = () => {
  if (!disputeForm.value.reason || disputeForm.value.reason.length < 10) {
    return
  }
  
  router.post('/disputes', {
    application_id: props.activeChat.application.id,
    reason: disputeForm.value.reason
  }, {
    preserveScroll: true,
    onSuccess: () => {
      openDisputeModal.value = false
      disputeForm.value.reason = ''
    }
  })
}

const getDaysRemaining = (completedAt) => {
  const completed = new Date(completedAt)
  const now = new Date()
  const diffTime = completed - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, 7 - diffDays)
}

const submitPriceProposal = () => {
  if (!priceForm.value.proposed_price || priceForm.value.proposed_price <= 0) {
    return
  }
  
  router.post(`/applications/${props.activeChat.application.id}/propose-price`, {
    proposed_price: priceForm.value.proposed_price
  }, {
    preserveScroll: true,
    onSuccess: () => {
      showPriceModal.value = false
      priceForm.value.proposed_price = ''
    }
  })
}

const acceptPriceProposal = (message) => {
  router.post(`/messages/${message.id}/accept-price`, {}, {
    preserveScroll: true,
  })
}

const openPriceChangeModal = (message) => {
  priceChangeModal.value = {
    show: true,
    message: message,
    newPrice: ''
  }
}

const submitPriceChange = () => {
  if (!priceChangeModal.value.newPrice || priceChangeModal.value.newPrice <= 0) {
    return
  }
  
  router.post(`/applications/${props.activeChat.application.id}/propose-price`, {
    proposed_price: priceChangeModal.value.newPrice
  }, {
    preserveScroll: true,
    onSuccess: () => {
      priceChangeModal.value = { show: false, message: null, newPrice: '' }
    }
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

const lastReadAt = ref(null)
const otherLastReadAt = ref(null)

const initLastReadAt = () => {
  const raw = props.activeChat?.last_read_at
  if (raw) {
    const date = new Date(raw)
    if (!isNaN(date.getTime())) {
      lastReadAt.value = date
    }
  }
  
  const otherRaw = props.activeChat?.other_last_read_at
  if (otherRaw) {
    const date = new Date(otherRaw)
    if (!isNaN(date.getTime())) {
      otherLastReadAt.value = date
    }
  }
}
initLastReadAt()

const getMessageStatus = (message) => {
  if (!message.is_mine) return null
  if (message._status) return message._status
  
  const readTime = otherLastReadAt.value 
    ? new Date(otherLastReadAt.value).getTime() 
    : 0
  const msgTime = new Date(message.created_at).getTime()
  return msgTime < readTime ? 'read' : 'sent'
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

const chatMediaFiles = computed(() => {
  if (!props.activeChat || !props.activeChat.messages) return []
  const media = []
  for (const msg of props.activeChat.messages) {
    if (msg.image_url) {
      media.push({ id: msg.id, type: 'image', url: msg.image_url })
    }
    if (msg.video_url) {
      media.push({ id: msg.id, type: 'video', url: msg.video_url })
    }
  }
  return media.reverse()
})

const chatDocFiles = computed(() => {
  if (!props.activeChat || !props.activeChat.messages) return []
  return props.activeChat.messages.filter(m => m.file_url && m.file_name).reverse()
})

const chatLinks = computed(() => {
  if (!props.activeChat || !props.activeChat.messages) return []
  const links = []
  const URL_REGEX = /https?:\/\/[^\s]+/g
  for (const msg of props.activeChat.messages) {
    if (msg.content) {
      const matches = msg.content.match(URL_REGEX)
      if (matches) {
        for (const url of matches) {
          links.push({
            id: msg.id + '-' + url,
            content: url,
            url: url,
            time: msg.time
          })
        }
      }
    }
  }
  return links.reverse()
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
        form.file_name = null
        const reader = new FileReader()
        reader.onload = (e) => {
          photoPreviewUrl.value = e.target.result
          videoPreviewUrl.value = null
          documentPreviewName.value = null
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        form.video = file
        form.file_name = null
        const reader = new FileReader()
        reader.onload = (e) => {
          videoPreviewUrl.value = e.target.result
          photoPreviewUrl.value = null
          documentPreviewName.value = null
        }
        reader.readAsDataURL(file)
      } else {
        form.document = file
        form.file_name = file.name
        documentPreviewName.value = file.name
        photoPreviewUrl.value = null
        videoPreviewUrl.value = null
      }
    }
  }
  input.click()
}

const onPhotoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.photo = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreviewUrl.value = e.target.result
      videoPreviewUrl.value = null
      documentPreviewName.value = null
    }
    reader.readAsDataURL(file)
  }
}

const onVideoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.video = file
    const reader = new FileReader()
    reader.onload = (e) => {
      videoPreviewUrl.value = e.target.result
      photoPreviewUrl.value = null
      documentPreviewName.value = null
    }
    reader.readAsDataURL(file)
  }
}

const onDocumentChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.document = file
    form.file_name = file.name
    documentPreviewName.value = file.name
    photoPreviewUrl.value = null
    videoPreviewUrl.value = null
  }
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

  const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
  const currentUser = page.props.auth?.user

  if (!editingMessage.value && currentUser) {
    localMessages.value.push({
      id: tempId,
      _clientId: tempId,
      content: form.content,
      is_mine: true,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        avatar_url: currentUser.avatar ? `/storage/${currentUser.avatar}` : '/images/User-avatar.png'
      },
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString(),
      image_url: photoPreviewUrl.value,
      video_url: videoPreviewUrl.value,
      file_name: documentPreviewName.value,
      _status: 'sending'
    })

    pendingTempIds.add(tempId)
    scrollToBottom(true)
  }

  const url = editingMessage.value
    ? `/chats/${props.activeChat.id}/messages/${editingMessage.value.id}`
    : `/chats/${props.activeChat.id}/messages`

  const wasEditing = !!editingMessage.value

  form[wasEditing ? 'put' : 'post'](url, {
    preserveScroll: true,
    onSuccess: (page) => {
      const newMessages = page.props.activeChat?.messages ?? []
      const realMessage = newMessages[newMessages.length - 1]

      if (!wasEditing && realMessage) {
        const tempMessage = localMessages.value.find(m => m._clientId === tempId)

        if (tempMessage) {
          Object.assign(tempMessage, realMessage)
          tempMessage._clientId = tempId
          tempMessage._status = 'sent'
        } else {
          mergeMessages(newMessages)
        }
      } else {
        mergeMessages(newMessages.map(m => ({
          ...m,
          _clientId: m._clientId || m.id
        })))
      }

      pendingTempIds.delete(tempId)
      resetForm()

      if (!wasEditing) scrollToBottom(true)
    },
    onError: () => {
      pendingTempIds.delete(tempId)
      const tempMessage = localMessages.value.find(m => m._clientId === tempId)
      if (tempMessage) tempMessage._status = 'failed'
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

const toggleMessageSelection = (message, event) => {
  if (event?.target.closest('a')) return
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

  if (!confirm(confirmMsg)) return

  const backup = [...localMessages.value]
  localMessages.value = localMessages.value.filter(m => !messageIds.includes(m.id))
  selectedMessages.value = []

  router.delete(`/chats/${props.activeChat.id}/messages`, {
    data: { ids: messageIds },
    preserveScroll: true,
    onSuccess: () => {
      hideContextMenu()
    },
    onError: () => {
      localMessages.value = backup
      selectedMessages.value = messagesToDelete
    }
  })
}

const toggleOptionsMenu = (event) => {
  const rect = event.target.getBoundingClientRect()
  optionsMenu.value.x = Math.max(10, window.innerWidth - rect.right)
  optionsMenu.value.y = rect.bottom + 5
  optionsMenu.value.show = !optionsMenu.value.show
}

const hideOptionsMenu = () => {
  optionsMenu.value.show = false
}

const handleChatFiles = () => {
  showChatFiles.value = true
  hideOptionsMenu()
}

const closeChatFiles = () => {
  showChatFiles.value = false
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

  try {
    const { default: Pusher } = await import('pusher-js')
    window.Pusher = Pusher

    window.Echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8081),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8081),
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
      enabledTransports: ['ws'], 
    })

    if (props.activeChat) {
      window.Echo.private(`chat.${props.activeChat.id}`)
        .listen('.message.sent', (e) => {
          const newMessages = page.props.activeChat?.messages ?? []
          mergeMessages(newMessages)
        })
        .listen('.message.updated', (e) => {
          router.reload({ only: ['activeChat'] })
        })
        .listen('.message.deleted', (e) => {
          const newMessages = page.props.activeChat?.messages ?? []
          mergeMessages(newMessages)
        })
        .listen('.messages.read', (e) => {
          const otherUser = otherUsers.value[0]
          if (otherUser && e.user_id === otherUser.id && e.last_read_at) {
            otherLastReadAt.value = new Date(e.last_read_at)
          }
        });
    }

    window.Echo.join('presence-online')
      .here((users) => {
        onlineUsers.value = new Set(users.map(u => u.id))
      })
      .joining((user) => {
        onlineUsers.value.add(user.id)
      })
      .leaving((user) => {
        onlineUsers.value.delete(user.id)
      })
  } catch (error) {
    console.error('Failed to initialize Echo:', error)
  }
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
          const newMessages = page.props.activeChat?.messages ?? []
          mergeMessages(newMessages)
        })
        .listen('.message.updated', (e) => {
          router.reload({ only: ['activeChat'] })
        })
        .listen('.message.deleted', (e) => {
          const newMessages = page.props.activeChat?.messages ?? []
          mergeMessages(newMessages)
        })
        .listen('.messages.read', (e) => {
          const otherUser = otherUsers.value[0]
          if (otherUser && e.user_id === otherUser.id && e.last_read_at) {
            otherLastReadAt.value = new Date(e.last_read_at)
          }
        });
    }
  }
)

watch(() => props.activeChat?.messages, (msgs) => {
  if (pendingTempIds.size > 0) return
  if (msgs && msgs.length > 0 && localMessages.value.length === 0) {
    localMessages.value = msgs.map(m => ({
      ...m,
      _clientId: m._clientId || m.id
    }))
  }
}, { immediate: true })
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
    flex-shrink: 0;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
    position: relative;
    min-width: 0;
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
  padding: 0 15px;
  min-width: 0;
}
.chat-header-user{
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 15px;
  min-width: 0;
  overflow: hidden;
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

.chat-header h2{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vacancy-link {
  font-size: 12px;
  color: #666;
  min-width: 0;
}

.vacancy-position {
  min-width: 0;
  overflow: hidden;
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
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
}

.message-status {
    display: inline-flex;
    align-items: center;
}

.status-icon {
    width: 10px;
    height: 10px;
}

.status-icon.spinning {
  width: 14px;
  height: 14px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
    font-size: 1.5em
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

.file-download-circle img {
    width: 20px;
    height: 20px;
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

.application-price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.application-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
}

.application-price .label {
  color: #475569;
}

.application-price .value {
  font-weight: 600;
  color: #16a34a;
}

.price-edit-btn {
  background: #f1f5f9;
  border: none;
  padding: 14px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.price-edit-btn:hover {
  opacity: 1;
}

.price-edit-btn img {
  width: 16px;
  height: 16px;
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

    html.dark .chat-area {
        background: #0f172a;
    }

    html.dark .chat-header {
        background: #0f172a;
    }

    html.dark .application-block {
        background: #0f172a;
    }

    .avatar-wrapper {
        display: none;
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

.messages-move {
  transition: transform 0.3s ease;
}

.messages-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.messages-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  width: 100%;
  z-index: 0;
}

.messages-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.messages-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.messages-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.messages-leave-from {
  opacity: 1;
  transform: scale(1);
}

.chat-files-panel {
  width: 350px;
  flex-shrink: 0;
  border-left: 1px solid #eee;
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.chat-files-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.chat-files-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-files-close:hover {
  background: #f0f0f0;
}

.chat-files-close img {
  width: 20px;
  height: 20px;
}

.chat-files-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.chat-files-tab {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: color 0.2s, background-color 0.2s;
}

.chat-files-tab:hover {
  background: #f5f5f5;
}

.chat-files-tab.active {
  color: #007bff;
  font-weight: 600;
  border-bottom: 2px solid #007bff;
}

.chat-files-content {
  flex: 1;
  overflow-y: auto;
}

.chat-files-empty {
  text-align: center;
  color: #999;
  padding: 40px;
}

.chat-files-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.chat-files-media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.chat-files-media-item img,
.chat-files-media-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-files-media-item .play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.chat-files-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-files-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.chat-files-item .file-info {
  flex: 1;
  min-width: 0;
}

.chat-files-item .file-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-files-item .file-size {
  font-size: 12px;
  color: #999;
}

.chat-files-link {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-files-link:hover {
  background: #f5f5f5;
}

.chat-files-link .link-text {
  display: block;
  font-size: 14px;
  color: #007bff;
  word-break: break-all;
}

.chat-files-link .link-time {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.price-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.price-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.price-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.price-modal-body {
  padding: 20px;
}

.price-modal-body label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.price-modal-body input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.price-modal-body input:focus {
  outline: none;
  border-color: #007bff;
}

.price-modal-info {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.price-modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}

.price-modal-footer .cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.price-modal-footer .submit-btn {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.price-modal-footer .submit-btn:hover {
  background: #0056b3;
}

.price-proposal-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.price-action-form {
  margin: 0;
}

.accept-price-btn {
  padding: 8px 16px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.accept-price-btn:hover {
  background: #16a34a;
}

.change-price-btn {
  padding: 8px 16px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.change-price-btn:hover {
  background: #f5f5f5;
}

.accepted-chat {
  background-color: rgba(34, 197, 94, 0.1);
  border-left: 3px solid #22c55e;
}

.application-status {
  margin: 10px 0;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.waiting {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.dispute {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.completed {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.withdraw-btn,
.close-btn,
.dispute-btn {
  padding: 10px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.withdraw-btn:hover {
  background: #fee2e2;
  border-color: #dc2626;
  color: #dc2626;
}

.close-btn:hover {
  background: #1f2937;
  border-color: #1f2937;
  color: white;
}

.dispute-btn {
  background: #ff2c2c;
  border-color: #dc2626;
}

.dispute-btn:hover {
  background: #dc2626;
  color: white;
}

.price-modal-body textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.price-modal-body textarea:focus {
  outline: none;
  border-color: #007bff;
}

html.dark .chat-container {
  border-color: #334155;
}

html.dark .chat-list {
  border-right-color: #334155;
  background-color: #1e293b;
}

html.dark .search-btn:hover {
  background-color: #334155;
}

html.dark .search-header {
  border-bottom-color: #334155;
}

html.dark .search-input {
  background: #1e293b;
  border-color: #334155;
  color: #f1f5f9;
}

html.dark .search-close:hover {
  background-color: #334155;
}

html.dark .search-no-results {
  color: #94a3b8;
}

html.dark .search-result-item {
  border-bottom-color: #334155;
}

html.dark .search-result-item:hover {
  background-color: #334155;
}

html.dark .search-result-text {
  color: #94a3b8;
}

html.dark .search-navigation {
  background: #0f172a;
  border-bottom-color: #334155;
}

html.dark .search-nav-btn:hover:not(:disabled) {
  background-color: #334155;
}

html.dark .search-nav-counter {
  color: #94a3b8;
}

html.dark .chat-item {
  border-bottom-color: #334155;
  color: #f1f5f9;
}

html.dark .chat-item:hover {
  background: #334155;
}

html.dark .chat-item.active {
  background-color: #475569;
}

html.dark .chat-preview {
  color: #94a3b8;
}

html.dark .chat-preview.unread {
  color: #f1f5f9;
}

html.dark .chat-header {
  border-bottom-color: #334155;
  color: #f1f5f9;
  font-size: 0.9rem;
  background: #0f172a;
}

html.dark .chat-header a {
  color: #f1f5f9;
}

html.dark .vacancy-link {
  color: #94a3b8;
}

html.dark .user-status {
  color: #94a3b8;
}

html.dark .chat-messages {
  background: #0f172a;
}

html.dark .chat-skeleton {
  background: #0f172a;
}

html.dark .skeleton-avatar,
html.dark .skeleton-line {
  background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
  background-size: 200% 100%;
}

html.dark .skeleton-bubble {
  background: #334155;
}

html.dark .skeleton-message.right .skeleton-bubble {
  background: #334155;
}

html.dark .message {
  background: #334155;
  color: #f1f5f9;
}

html.dark .my-message {
  background: #1e40af;
}

html.dark .message-time {
  color: #94a3b8;
}

html.dark .message-form {
  border-top-color: #334155;
  background: #1e293b;
}

html.dark .message-form textarea {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

html.dark .chat-placeholder {
  color: #94a3b8;
}

html.dark .add-select {
  background: #1e293b;
  border-color: #334155;
}

html.dark .add-select label:hover {
  background-color: #334155;
}

html.dark .context-menu {
  background: #1e293b;
  border-color: #334155;
}

html.dark .context-menu-item:hover {
  background-color: #334155;
}

html.dark .options-menu {
  background: #1e293b;
  border-color: #334155;
}

html.dark .options-menu-item:hover {
  background-color: #334155;
}

html.dark .editing-indicator {
  background-color: #451a03;
  border-bottom-color: #78350f;
  color: #fbbf24;
}

html.dark .application-block {
  border-bottom-color: #334155;
  color: #f1f5f9;
}

html.dark .application-toggle-btn {
  background: #1e293b;
  border-color: #334155;
}

html.dark .application-card {
  background: transparent;
}

html.dark .application-card h3 {
  color: #f1f5f9;
}

html.dark .account-age {
  color: #94a3b8;
}

html.dark .application-rating {
  color: #e2e8f0;
}

html.dark .application-cover-letter {
  background: #334155;
}

html.dark .application-cover-letter h4 {
  color: #e2e8f0;
}

html.dark .application-cover-letter p {
  color: #f1f5f9;
}

html.dark .application-price {
  background: #14532d;
}

html.dark .application-price .label {
  color: #e2e8f0;
}

html.dark .price-edit-btn {
  background: #334155;
}

html.dark .file-preview {
  background: #334155;
}

html.dark .post-preview-card {
  background: #1e293b;
  border-color: #334155;
}

html.dark .post-preview-card:hover {
  background: #334155;
}

html.dark .post-preview-title {
  color: #f1f5f9;
}

html.dark .post-preview-desc {
  color: #94a3b8;
}

html.dark .chat-files-panel {
  border-left-color: #334155;
  background: #1e293b;
}

html.dark .chat-files-header {
  border-bottom-color: #334155;
}

html.dark .chat-files-close:hover {
  background: #334155;
}

html.dark .chat-files-tabs {
  border-bottom-color: #334155;
}

html.dark .chat-files-tab {
  color: #94a3b8;
}

html.dark .chat-files-tab:hover {
  background: #334155;
}

html.dark .chat-files-empty {
  color: #94a3b8;
}

html.dark .chat-files-item {
  border-color: #334155;
}

html.dark .chat-files-item .file-size {
  color: #94a3b8;
}

html.dark .chat-files-link {
  border-color: #334155;
}

html.dark .chat-files-link:hover {
  background: #334155;
}

html.dark .chat-files-link .link-time {
  color: #94a3b8;
}

html.dark .price-modal {
  background: #1e293b;
}

html.dark .price-modal-header {
  border-bottom-color: #334155;
}

html.dark .price-modal-body input,
html.dark .price-modal-body textarea {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

html.dark .price-modal-info {
  color: #94a3b8;
}

html.dark .price-modal-footer {
  border-top-color: #334155;
}

html.dark .price-modal-footer .cancel-btn {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

html.dark .change-price-btn {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

html.dark .change-price-btn:hover {
  background: #475569;
}

html.dark .withdraw-btn,
html.dark .close-btn {
  background: #334155;
  color: #f1f5f9;
  border-color: #475569;
}

html.dark .accepted-chat {
  background-color: rgba(34, 197, 94, 0.15);
}

html.dark .status-badge.waiting {
  background: #451a03;
  color: #fbbf24;
}

html.dark .status-badge.dispute {
  background: #450a0a;
  color: #fca5a5;
}

html.dark .status-badge.completed {
  background: #052e16;
  color: #4ade80;
}

html.dark .status-badge.cancelled {
  background: #334155;
  color: #94a3b8;
}
</style>

<style>
html.dark ::-webkit-scrollbar-track {
  background: #0f172a;
}

html.dark * {
  scrollbar-color: #888 #0f172a;
  scrollbar-width: thin;
}
</style>