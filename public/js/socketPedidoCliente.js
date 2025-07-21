// public/js/socketPedidoCliente.js
const socket = io();

socket.on('actualizar-estado-pedido', (pedidoActualizado) => {
  const pedidoId = pedidoActualizado._id;
  const nuevoEstado = pedidoActualizado.estadoTrabajo;

  // Найдём элемент на странице, где отображается статус
  const estadoElemento = document.querySelector(`#estado-pedido-${pedidoId}`);
  if (estadoElemento) {
    estadoElemento.textContent = nuevoEstado;
  }

  // Всплывающее сообщение, чтобы пользователь увидел
  alert(`¡El estado de tu pedido ha cambiado a: ${nuevoEstado}!`);
});
