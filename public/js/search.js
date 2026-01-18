const inputText = document.querySelector('.block2 input'); 
const posts = document.querySelector('.posts');
const grid1 = document.querySelector('.posts');

const masonry1 = new Masonry(grid1, {
    itemSelector: '.post',
    columnWidth: 300,
    gutter: 25,
    fitWidth: true
});

function initMasonry() {
    const columnWidth = window.innerWidth < 1000 ? 400 : 300; 
    masonry1.options.columnWidth = columnWidth; 
    masonry1.layout(); 
}

inputText.addEventListener('change', function() { 
    const searchText = inputText.value.toLowerCase(); 
    const items = document.querySelectorAll('.post');

    items.forEach(item => {
        const h3Text = item.querySelector('.title').textContent.toLowerCase();
        const pText = item.querySelector('.description').textContent.toLowerCase();
        const smallAText = item.querySelector('.username').textContent.toLowerCase();
        
        if (h3Text.includes(searchText) || pText.includes(searchText) || smallAText.includes(searchText)) {
            item.classList.remove('hidden'); 
        } else {
            item.classList.add('hidden'); 
        }
    });

    masonry1.layout();
});

initMasonry();

window.addEventListener('resize', initMasonry);
