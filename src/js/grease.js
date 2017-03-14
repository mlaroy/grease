import _ from 'lodash';
import TouchUtil from './touch-utility';

class Grease {

	/**
   * Plugin Constructor Object
   * @param {element} - The html element to initialize
   * @param {Object} options - User options
   */
	constructor(el, options={}){
		this.el = el;
		// this.slides = '';
		// this.track = '';
		this.dots = [];
		this.currentSlideIndex = 0;
		this.trackWidth = 0;
		this.maxWidth = 0;
		this.id = 'grease-' + Math.random().toString(3).substr(2,9);
		this.isMobile = false;

		const defaults = {
			buttons: true,
			captions: false,
			dots: false,
			ease: 'ease',
			fade: false,
			infinite: false,
			ticker: false,
			slidesToShow: 1,
			slidesToScroll: 1,
			speed: 300,
			breakpoint: 640,
			matchHeightClass: '',
		}

		// merge defaults with the options passed in on init
		this.settings = Object.assign({}, defaults, options);

		const e = new CustomEvent('init');
		this.el.dispatchEvent(e);

		this.addMarkup();
		this.setupBindings();
		this.applyTransitions();
		this.addAccessibility();
	}

	deGrease() {
		// todo

		const e = new CustomEvent('destroy');
		this.el.dispatchEvent(e);
	}

	on(event,callback){
		this.el.addEventListener(event,callback);
	}

	addMarkup() {
		this.addWrapper();
		if(this.settings.buttons){
			this.addButtons();
		}
		if( this.settings.ticker ){
			this.addSlideTracker();
		}
		if(this.settings.captions){
			this.addCaption();
		}
		if(this.settings.dots){
			this.addDotsContainer();
		}
		this.resizeHandler();
	}

	// adds a wrapper with overflow: hidden to set the viewport
	// for the slides
	addWrapper() {
		const slides = this.el.innerHTML;
		this.originalHtml = slides;

		this.el.innerHTML =
			`<div class="grease-wrap">
				<div class="grease-track">
					${slides}
				</div>
			<div>`;

		// create track
		let track = document.querySelector('.grease-track');
		this.track = track;

		// define slides
		this.slides = this.track.children;

		// add classes to slides
		[].forEach.call(this.slides, (slide) => {
			slide.classList.add('grease-slide');
		});
	}

	setupBindings() {
		const touchEl = new TouchUtil(this.track);

		// window.addEventListener('load', this.initializeSizes(this.el) );
		window.addEventListener('load', _.debounce(function(){
				this.initializeSizes(this.el);
			},200).bind(this)
		);
		window.addEventListener('resize', _.throttle(function(){
				this.initializeSizes(this.el);
			},50).bind(this)
		);

		// swipe left for next slide
		touchEl.on('swipeleft', () => {
			const e = new CustomEvent('swipeLeft');
			this.el.dispatchEvent(e);
			this.nextSlide();
		});

		// swipe right for prev slide
		touchEl.on('swiperight', () => {
			const e = new CustomEvent('swipeRight');
			this.el.dispatchEvent(e);
			this.prevSlide();
		});

		// if buttons, add event listeners
		if( this.settings.buttons ){
			console.log('settings');
			this.prev.addEventListener('click', () => {
				this.prevSlide();
			});

			this.next.addEventListener('click', () => {
				this.nextSlide()
			});
		}
	}

	applyTransitions(){
		const fade = this.settings.fade;
		const speedSetting = this.settings.speed;
		let speed = speedSetting / 1000;
		if( fade ){
			this.track.style.transition = `opacity ${speed}s ${this.settings.ease}`;
		}else{
			this.track.style.transition = `transform ${speed}s ${this.settings.ease}`;
		}
	}

	nextSlide(){
		let index = this.getCurrentSlideIndex();

		if(index < this.slides.length -1 ) {
			index = index + 1 ;
			this.changeSlide(index);
		}else{
			// go to first slide
			if( this.settings.infinite ){
				index = 0;
				this.changeSlide(index);
			}
		}
		const e = new CustomEvent('nextSlide');
		this.el.dispatchEvent(e);
	}

	prevSlide() {
		let index = this.getCurrentSlideIndex();

		if(index > 0 ) {
			index = index - 1;
			this.changeSlide(index);
		}else{
			// go to last slide
			if( this.settings.infinite ){
				index = this.slides.length -1;
				this.changeSlide(index);
			}
		}
		const e = new CustomEvent('previousSlide');
		this.el.dispatchEvent(e);
	}

	initializeSizes() {

		this.setSlideWidth();
		this.setTrackWidth();

		if( this.settings.dots ){
			this.resizeHandler();
		}

		setTimeout( function(){
			this.setTrackHeight();
		}.bind(this), 500)
	}

	addAccessibility() {
		this.track.setAttribute('role', 'listbox');
		[].forEach.call(this.slides, function(item, index){
			item.id = `${this.id}-grease-${index}`;
			item.dataset.slide = index;
		}.bind(this));
	}

	// adds prev and next controls
	addButtons() {
		this.el.classList.add('grease--has-buttons');
		this.next = document.createElement('button');
		this.prev = document.createElement('button');
		this.next.classList.add('js-next', 'grease__button');
		this.next.innerHTML = '<span class="sr">Next</span><span class="grease__arrow">&rsaquo;</span>';
		this.prev.classList.add('js-prev', 'grease__button');
		this.prev.innerHTML = '<span class="grease__arrow">&lsaquo;</span><span class="sr">Previous</span>';

		this.el.appendChild(this.prev);
		this.el.appendChild(this.next);
	}

	// adds caption container
	addCaption() {
		this.el.classList.add('grease--has-captions');
		this.caption = document.createElement('span');
		this.caption.classList.add('type-small','color-grey', 'figcaption');
		this.el.appendChild(this.caption);
		console.log(this.caption);
	}

	// only rebuild dots once per change of breakpoint
	resizeHandler () {
		if( window.innerWidth < this.settings.breakpoint && !this.isMobile ){
			this.buildDots();
		}
		else if(window.innerWidth >= this.settings.breakpoint && this.isMobile ) {
			this.buildDots();
		}
		const e = new CustomEvent('resize');
		this.el.dispatchEvent(e);
	}

	/**
   * Returns number of dots we need based on slides to scroll.
   * @return int
   */
	getDotCount() {
		// by dividing the number of slides by the number of slides to show at a time, we get the result.
		// This gives us the initial number of dots to show
		const quotient = ( window.innerWidth < this.settings.breakpoint ) ? this.slides.length : this.slides.length/this.settings.slidesToScroll;
		// console.log('quotient', quotient);

		// determine whether there will be a remainder, by dividing the number of slides
		// by the number of slides to show at a time.
		let mod = ( window.innerWidth < this.settings.breakpoint ) ? 0 : this.slides.length % this.settings.slidesToScroll;
		// console.log('modulus', mod);

		// set the initial dot count
		let dotCount = Math.floor(quotient);

		// if the mod is greater than 0,
		// we add 1 dot so we can see all the slides
		if( mod ){
			dotCount += 1;
		}

		// overrides dotCount, if there are fewer slides than
		// the number in this.settings.slidesToScroll
		dotCount = (dotCount > 1) ? dotCount : 0;

		// if there are more slides than
		// the number in this.settings.slidesToScroll
		if( dotCount > 0 ) {
			this.el.classList.add('grease--has-dots');
		}else{
			if( this.el.classList.contains('grease--has-dots') ){
				this.el.classList.remove('grease--has-dots');
			}
		}

		return dotCount;
	}

	addDotsContainer() {
		// appends dot controls to the carousel container, and enables
		// navigating by click to the relevant slide index
		this.dotList = document.createElement('ul');
		this.dotList.setAttribute('role', 'tablist');
		this.dotList.classList.add('grease__dots-container');

		this.buildDots();
	}

	buildDots() {
		// clear the list, in case of resize event
		this.dotList.innerHTML = '';
		// clear array of dots
		this.dots = [];

		const dotCount = this.getDotCount();

		// for the number of dots we need (dotCount), we loop over that number
		// and build dots for each of them. Their slide target is either the
		// current index of the loop (for mobile), or the current index times
		// the number of slides we show at a time.
		for(let i = 0; i < dotCount; i++){
			let slideIndex = ( window.innerWidth < this.settings.breakpoint ) ? i : i * this.settings.slidesToShow;
			const li = document.createElement('li');
			li.classList.add(`grease-index-${slideIndex}`, 'grease__dot');
			li.setAttribute('role', 'presentation');
			li.setAttribute('aria-selected', 'false');
			li.setAttribute('aria-controls', `${this.id}-grease-${slideIndex}`);

			// bind click to this dot
			li.addEventListener('click', (function(){
				this.changeSlide(slideIndex);
			}).bind(this));

			this.dots.push(li);
		}

		this.appendDots();

		// set isMobile value - the resize handler uses this to
		// determine whether we need to build the dots or not.
		if( window.innerWidth < this.settings.breakpoint ){
			this.isMobile = true;
		}else {
			this.isMobile = false;
		}

	}

	appendDots() {
		// append array of dots to the ul container
		this.dots.forEach(function(dot){
			this.dotList.appendChild(dot);
		}.bind(this))

		// append the dots list to the DOM
		this.el.appendChild(this.dotList);
	}

	updateActiveDot(index){
		const dots = this.dots;

		dots.forEach(function(item){
			item.classList.remove('active');
			item.setAttribute('aria-selected', 'false');

			if( item.classList.contains(`grease-index-${index}`) ){
				item.classList.add('active');
				item.setAttribute('aria-selected', 'true');
			}
		});
	}

	addSlideTracker() {
		this.ticker = document.createElement('span');
		this.ticker.classList.add('grease__ticker');
		this.ticker.innerHTML = `1 / ${this.slides.length}`;
		this.el.appendChild(this.ticker);
	}

	updateTracker(index){
		this.ticker.innerHTML = `${index+1} / ${this.slides.length}`;
	}

	updateCaption(index){
		let caption = this.slides[index].dataset.caption;
		if( caption !== '' ) {
			// let imgSrc = '/themes/custom/talking-energy/dist/images/camera.svg';
			this.caption.innerHTML = caption;
		}else{
			this.caption.innerHTML = '';
		}
	}

	/* changeSlide()
	 *
   *
   * @param {index} int - the index of the slide to be activated
   */
	changeSlide(index) {

		const e = new CustomEvent('beforeChange');
		this.el.dispatchEvent(e);

		// set the new current index
		this.setCurrentSlideIndex(index);

		// get the left offset of the newly selected slide
		let offset = this.slides[index].offsetLeft;

		// get the width of the new slide, in case we need it
		const currentSlideWidth = this.slides[index].offsetWidth;

		// last item - if it's smaller than the container,
		// align it to the right so that the container is filled with both the
		// current and a sliver of the previous slide
		if( index == this.slides.length - 1  && currentSlideWidth < this.el.offsetWidth  ){
			// align this to the last image's right edge
			offset = offset - (this.el.offsetWidth - currentSlideWidth);
		}

		// remove any active classes
		[].forEach.call(this.slides, function(item){
			item.classList.remove('current-slide');
			item.setAttribute('aria-hidden', 'true');
		});

		// assign the active class to the new slide
		this.slides[index].classList.add('current-slide');

		if(this.settings.ticker) {
			this.updateTracker(index);
		}
		if(this.settings.captions){
			this.updateCaption(index);
		}
		if(this.settings.dots){
			this.updateActiveDot(index);
		}
		this.slides[index].setAttribute('aria-hidden', 'false');

		// apply transition
		if( this.settings.fade ){
			this.track.style.opacity = 0;
			this.track.addEventListener('transitionend', (event) => {
				this.track.style.transform = `translate3d(-${offset}px, 0,0)`;
			  this.track.style.opacity = 1;
			}, false);


		}else{
			// apply the offset to set the current slide to align to the left
			// of the container
			this.track.style.transform = `translate3d(-${offset}px, 0,0)`;
		}

		// setTimeout( () => {
		// 	this.track.style.opacity = 1;
		// }, this.settings.speed*2 / 1000);
	}

	adjustSlideOffset() {
		let index = this.getCurrentSlideIndex();
		this.changeSlide(index);
	}

	// sets max width on each slide to equal the
	// width of the whole carousel viewport
	setSlideWidth() {
		let width = this.el.offsetWidth;
		let numItems = this.slides.length;

		if( window.innerWidth >= this.settings.breakpoint ) {
			// if above breakpoint, show the number of slides passed
			// to the settings
			[].forEach.call(this.slides, function(item){
				item.style.removeProperty('width');
				item.style.minWidth = Math.round(width/this.settings.slidesToShow) + 'px';
				item.style.maxWidth = Math.round(width/this.settings.slidesToShow) + 'px';
			}.bind(this))
		}else{
			// only show one slide on small screens
			[].forEach.call(this.slides, function(item){
				item.style.removeProperty('max-width');
				item.style.removeProperty('min-width');
				item.style.width = Math.round(width) + 'px';
			})
		}
		this.maxWidth = width;
	}

	// sets width on the slides track to equal
	// the total width of all the slides
	setTrackWidth() {
		let width = 0;

		[].forEach.call(this.slides, function(item){
			width += item.offsetWidth;
		});
		this.trackWidth = width;
		this.track.style.width =  width +'px';
	}

	setTrackHeight() {
		this.clearMatchHeights();

		let height = 0;
		for (var i = 0; i <= this.slides.length -1 ; i++) {
			if( this.slides[i].offsetHeight >= height ){
				height = this.slides[i].offsetHeight;
			}
		}
		this.track.style.height = height+5 + 'px';

		// make all child elements the full height of the
		// carousel track
		if( this.settings.matchHeightClass !== '' ){
			let matchElements = this.el.querySelectorAll( `.${this.settings.matchHeightClass}` );
			[].forEach.call(matchElements, function(el){
				el.style.minHeight = `${height}px`;
			});
		}

		this.adjustSlideOffset();
	}

	clearMatchHeights() {
		if( this.settings.matchHeightClass !== '' ){
			let matchElements = this.el.querySelectorAll( `.${this.settings.matchHeightClass}` );
			[].forEach.call(matchElements, function(el){
				el.removeAttribute('style');
			});
		}
	}

	// gets the index of the current active slide
	getCurrentSlideIndex() {
		return this.currentSlideIndex;
	}

	// sets the index to the new active slide
	setCurrentSlideIndex(index) {
		this.currentSlideIndex = index;
	}
}

export default Grease;