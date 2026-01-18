const img = document.querySelector('.block>img');
const block = document.querySelector('.block');
const block2 = document.querySelector('.block div');
const comment = document.querySelector('.comments');
const imgWidth = parseFloat(getComputedStyle(img).width);
const imgHeight = parseFloat(getComputedStyle(img).height);
const title = document.querySelector('.title');
const description = document.querySelector('.description');

if (imgWidth > imgHeight && window.innerWidth>1000) {
    
    block.style.flexDirection = 'column';
    block.style.width=600+"px";
    img.style.width=600+"px";
    block2.style.width=600+"px";
    comment.style.overflowY='none'
}else{
    comment.style.maxHeight = 
    (((imgHeight - 150) - 
    parseFloat(getComputedStyle(title).height)) - 
    parseFloat(getComputedStyle(description).height) )+'px';

}
if(imgHeight > 900 && window.innerWidth>1000){
    img.style.width = 350 + "px";
}