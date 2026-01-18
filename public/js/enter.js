const button = document.querySelector('form.message-form button'),
textarea = document.querySelector('form.message-form textarea'),
chatList = document.querySelector('.chat-messages');
// back = document.querySelector('.back'),
// chatArea = document.querySelector('.chat-area'),
// chatItems = document.querySelectorAll('.chat-item');

const addSelect = document.querySelector('.add-select');
const add = document.querySelector('.add');
const photoInput = document.querySelector('input[name="photo"]');
const fileInput = document.querySelector('input[name="file"]');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeBtn = document.querySelector('.modal-close');
const messageImages = document.querySelectorAll('.message-image');

document.addEventListener('DOMContentLoaded', function () {
    messageImages.forEach(img => {
        img.addEventListener('click', function () {
            modal.style.display = 'flex';
            modalImg.src = this.dataset.fullSrc;
        });
    });

    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });

    const imageInput = document.querySelector('input[type="file"]');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreviewList = document.getElementById('imagePreviewList');

    imageInput.addEventListener('change', function (event) {
        const files = event.target.files;
        imagePreviewList.innerHTML = '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('image-preview');
                imagePreviewList.appendChild(img);
            };

            reader.readAsDataURL(file);
        }

        imagePreviewContainer.style.display = 'flex';
    });

    // Обработка отправки сообщения
    button.addEventListener('click', function () {
        const messageContent = textarea.value;
        const images = Array.from(imageInput.files); // Получаем все выбранные изображения

        if (messageContent.trim() || images.length > 0) {
            const formData = new FormData();
            formData.append('content', messageContent);

            // Добавляем все изображения в FormData
            images.forEach((file) => {
                formData.append('images[]', file);
            });

            // Отправка сообщения через AJAX (пример)
            fetch('/send-message', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                // Обработка успешного ответа
                console.log(data);
                // Очистка textarea и изображений после отправки
                textarea.value = '';
                imageInput.value = '';
                imagePreviewList.innerHTML = '';
                imagePreviewContainer.style.display = 'none';
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        }
    });
});

function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 

        if (document.activeElement === textarea) {
            
            button.click();
        } else {
            
            textarea.focus();
        }
    }
}

textarea.addEventListener('keypress', handleEnter);

window.onload = function() {
    chatList.scrollTop = chatList.scrollHeight;
    textarea.focus();
};

document.addEventListener('keypress', handleEnter);
    
if(photoInput){
photoInput.addEventListener('change', function (e) {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100px';
            img.style.height = 'auto';

            img.style.marginBottom = '5px';
            const messageContent = document.querySelector('textarea[name="content"]');
            messageContent.value = messageContent.value + '\n[Фото]';
        }
        reader.readAsDataURL(this.files[0]);
    }
});
}