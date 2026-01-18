    const grid = document.querySelector('.posts');
    const masonry = new Masonry(grid, {
        itemSelector: '.post',
        columnWidth: 400,
        gutter: 25,
        fitWidth: true
    });
    function initMasonry() {
        const columnWidth = window.innerWidth < 1000 ? 400 : 400; 
    
        masonry.columnWidth=columnWidth;
    
    }
    
    initMasonry();
    document.addEventListener('DOMContentLoaded', function() {
        const expandButton = document.querySelector('.expand');
        const truncatedText = document.querySelector('.aboutme-content');
    
        
        if (expandButton && truncatedText) {
            
            function checkTextHeight() {
                const lineHeight = parseFloat(getComputedStyle(truncatedText).height);
                console.log(lineHeight)
                if (truncatedText.scrollHeight > lineHeight) {
                    expandButton.style.display = 'inline';
                                    
                } else {
                    expandButton.style.display = 'none';  

                }
            }
    
            checkTextHeight();
    
            expandButton.addEventListener('click', function() {
                truncatedText.classList.toggle('expanded');
                if (truncatedText.classList.contains('expanded')) {
                    expandButton.textContent = 'Свернуть';
                } else {
                    expandButton.textContent = 'Развернуть';
                }
            });
        }
    });
    