const container = document.querySelector('.carrusel-contenedor');
const carousel = document.querySelector('.carrusel-categorias');
let scrollAmount=0;
const step = 150;
document.getElementById('next').addEventListener('click', () => {
  if (scrollAmount < carousel.scrollWidth - carousel.clientWidth) {
    scrollAmount += step;
    carousel.style.transform = `translateX(-${scrollAmount}px)`;
  }
});


document.getElementById('prev').addEventListener('click', () => {
  if (scrollAmount > 0) {
    scrollAmount -= step;
    carousel.style.transform = `translateX(-${scrollAmount}px)`;
  }
});

function updateCarousel() {
  carousel.style.transform = `translateX(${-index * slideWidth}px)`;
}
