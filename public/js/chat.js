// public/js/chat.js
document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const chatForm = document.getElementById('formulario-chat');
  const input = document.getElementById('input-chat');
  const mensajesDiv = document.getElementById('mensajes');

  const clienteId = parseInt(document.body.dataset.clienteid, 10);
  const cliente = document.body.dataset.cliente;
  const email = document.body.dataset.email;

  // Подключаемся к комнате
  socket.emit('joinRoom', { clienteId, role: 'cliente' });

  // Получаем историю сообщений
  socket.emit('obtenerHistorial', { clienteId, requesterId: clienteId, role: 'cliente' });

  // Отправка нового сообщения
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;

    socket.emit('nuevoMensaje', {
      contenido: texto,
      cliente,
      email,
      clienteId,
      remitente: 'cliente'
    });

    input.value = '';
  });

  // Рендер одного сообщения
  function renderMensaje(mensaje) {
    const div = document.createElement('div');
    const fecha = new Date(mensaje.fechaEnvio || new Date()).toLocaleString();
    div.style.margin = '5px';
    div.style.padding = '8px';
    div.style.borderRadius = '8px';

    if (mensaje.remitente === 'cliente') {
      div.textContent = `🙋‍♂️ Tú: ${mensaje.contenido} (${fecha})`;
      div.style.textAlign = 'right';
      div.style.backgroundColor = '#dcf8c6';
    } else {
      div.textContent = `👨‍💼 Admin: ${mensaje.contenido} (${fecha})`;
      div.style.textAlign = 'left';
      div.style.backgroundColor = '#f1f0f0';
    }

    mensajesDiv.appendChild(div);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;

  // Получение истории сообщений
  socket.on('historialMensajes', (mensajes) => {
    mensajesDiv.innerHTML = '';
    mensajes.forEach(renderMensaje);
  });

  // 🔔 Отправка события "прочитано" для входящих сообщений от администратора
  if (mensaje.remitente !== 'cliente') {
    socket.emit('mensajeLeido', {
      mensajeId: mensaje.id,
      clienteId: clienteId,
      remitente: 'cliente'
    });
  }
}

  // Получение нового сообщения
  socket.on('mensajeRecibido', (mensaje) => {
    if (mensaje.clienteId !== clienteId) return;
    renderMensaje(mensaje);
  });
});