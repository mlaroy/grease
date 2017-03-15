# Grease
An ES6 Vanilla JS Carousel

-----

**Alpha** - This project is still in development, and as such, probably isn't stable for use in production yet. When the time comes, a 1.0 release will be made, and it possibly will be made available as an npm module.


## Getting Started

Include the Grease CSS file, and the the Grease JavaScript,
```html
<link rel="stylesheet" src="dist/style.css">

...

<div id="grease-carousel">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
  <div>Slide 4</div>
</div>

...

<script src="dist/grease.js"></script>
```

### Initialize Grease

```javascript
<script>
  const carousel = document.getElementById('grease-carousel');
  const grease = new Grease( carousel, options );
</script>
```

## Options
* fade (default: false)
* buttons (default: true)
* captions (default: false)
* dots (default: false)
* ease (default: 'ease')
* infinite (default: false)
* ticker (default: false)
* slidesToShow (default: 1)
* slidesToScroll (default: 1)
* speed (in milliseconds - default: 300)
* breakpoint (default: 640)
* matchHeightClass

```javascript
<script>
  const grease = new Grease( carousel, {
  	fade: true,
  	dots: true
  });
</script>
```

_toDo_
* autoplay
* prev/next labels


## Events

* init
* nextSlide
* previousSlide
* resize

```javascript
grease.on('nextSlide', () => {
  // do stuff
});
```

## Methods
_todo_


## Captions

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

---

&copy; 2017 [Michael LaRoy](http://mikelaroy.com). Find me on Twitter [@laroymike](https://twitter.com/laroymike)

