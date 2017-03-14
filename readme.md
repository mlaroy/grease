# Grease
An ES6 Vanilla JS Carousel


## Usage
```html
<div id="grease-carousel">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
  <div>Slide 4</div>
</div>
...

<script>
  const carousel = document.getElementById('grease-carousel');
  const grease = new Grease( carousel );
</script>
```

### Options
* fade (default: false)
* buttons (default: true)
* captions (default: false)
* dots (default: false)
* ease (default: 'ease')
* fade (default: false)
* infinite (default: false)
* ticker (default: false)
* slidesToShow (default: 1)
* slidesToScroll (default: 1)
* speed (in milliseconds - default: 300)
* breakpoint (default: 640)
* matchHeightClass

_to do_
* autoplay

### Events

* init
* nextSlide
* previousSlide
* resize

```
grease.on('nextSlide', () => {
	// do stuff
});
```

### Methods
_todo_


### Captions
```html
<div id="grease-carousel">
  <div data-caption="caption 1">Slide 1</div>
  <div data-caption="caption 2">Slide 2</div>
  <div data-caption="caption 3">Slide 3</div>
  <div data-caption="caption 4">Slide 4</div>
</div>

...
<script>
  const carousel = document.getElementById('grease-carousel');
  const grease = new Grease( carousel, {
    captions: true
  });
</script>
```