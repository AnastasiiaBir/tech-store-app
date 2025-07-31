// public/js/main.js

window.addEventListener('DOMContentLoaded', () => {
  // 👋 Приветствие
  const saludo = document.getElementById('saludo');
  if (saludo) {
    const nombre = saludo.dataset.nombre;
    const hora = new Date().getHours();
    let mensaje = '';

    if (hora >= 6 && hora < 12) {
      mensaje = 'Buenos días';
    } else if (hora >= 12 && hora < 18) {
      mensaje = 'Buenas tardes';
    } else {
      mensaje = 'Buenas noches';
    }

    saludo.textContent = `${mensaje}, ${nombre}`;
  }

  // 🔍 Фильтрация товаров
  const filtrarBtn = document.getElementById('filtrarBtn');
  const nombreFiltro = document.getElementById('nombreFiltro');
  const precioMinFiltro = document.getElementById('precioMinFiltro');
  const precioMaxFiltro = document.getElementById('precioMaxFiltro');
  const filas = document.querySelectorAll('.tabla-productos tbody tr');

  if (filtrarBtn && nombreFiltro && precioMinFiltro && precioMaxFiltro && filas.length > 0) {
    filtrarBtn.addEventListener('click', () => {
      const nombre = nombreFiltro.value.toLowerCase();
      const precioMin = parseFloat(precioMinFiltro.value);
      const precioMax = parseFloat(precioMaxFiltro.value);

      filas.forEach(fila => {
        const nombreProd = fila.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const precioProd = parseFloat(fila.querySelector('td:nth-child(4)').textContent);

        const coincideNombre = nombre === '' || nombreProd.includes(nombre);
        const coincideMin = isNaN(precioMin) || precioProd >= precioMin;
        const coincideMax = isNaN(precioMax) || precioProd <= precioMax;

        const mostrar = coincideNombre && coincideMin && coincideMax;
        fila.style.display = mostrar ? '' : 'none';
      });
    });
  }
});