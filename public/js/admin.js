document.addEventListener('DOMContentLoaded', function() {
    const userSearch = document.getElementById('userSearch');
    const postSearch = document.getElementById('postSearch');
    const commentSearch = document.getElementById('commentSearch');

    if (userSearch) {
        userSearch.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const userItems = document.querySelectorAll('.user-item');

            userItems.forEach(item => {
                const userName = item.querySelector('h3').textContent.toLowerCase();
                const userEmail = item.querySelector('p').textContent.toLowerCase();
                
                if (userName.includes(searchText) || userEmail.includes(searchText)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    if (postSearch) {
        postSearch.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const postItems = document.querySelectorAll('.post-item');

            postItems.forEach(item => {
                const postTitle = item.querySelector('h3').textContent.toLowerCase();
                const postDesc = item.querySelector('p').textContent.toLowerCase();
                const postAuthor = item.querySelector('small').textContent.toLowerCase();
                
                if (postTitle.includes(searchText) || postDesc.includes(searchText) || postAuthor.includes(searchText)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    if (commentSearch) {
        commentSearch.addEventListener('input', function() {
            const searchText = this.value.toLowerCase();
            const commentItems = document.querySelectorAll('.comment-item');

            commentItems.forEach(item => {
                const commentText = item.querySelector('p').textContent.toLowerCase();
                const commentAuthor = item.querySelector('h3').textContent.toLowerCase();
                const postTitle = item.querySelector('small').textContent.toLowerCase();
                
                if (commentText.includes(searchText) || commentAuthor.includes(searchText) || postTitle.includes(searchText)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}); 