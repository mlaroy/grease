import Grease from './js/grease.js';

const container = document.querySelector('.grease');
const grease = new Grease(container, {
	dots: true,
	ticker: true,
	infinite: true
});

grease.on('nextSlide', function(){
	console.log('next');
});

grease.on('previousSlide', function(){
	console.log('previous');
});