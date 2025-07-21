document.addEventListener('DOMContentLoaded', () => {
    console.log('[chat-admin.js] DOM cargado');
    
  const socket = io();
  console.log('[chat-admin.js] Socket inicializado:', socket);

  const input = document.getElementById('input-respuesta');
  const btnEnviar = document.getElementById('btn-enviar');
  const mensajes = document.getElementById('mensajes');

  if (!input || !btnEnviar || !mensajes) {
    console.error('[chat-admin.js] No se encontró uno de los elementos:', {
      input,
      btnEnviar,
      mensajes
    });
    return;
  }

  const clienteId = parseInt(document.body.dataset.clienteId, 10);
  console.log('[chat-admin.js] clienteId из dataset:', clienteId);

  if (isNaN(clienteId)) {
    console.error('[chat-admin.js] Error: clienteId no es un número');
    return;
  }

  // Админ подключается к комнате клиента
  socket.emit('joinRoom', { clienteId, role: 'admin' });
  console.log('[chat-admin.js] Enviado joinRoom:', { clienteId, role: 'admin' });

  btnEnviar.addEventListener('click', () => {
    const texto = input.value.trim();
    if (!texto) {
        console.log('[chat-admin.js] Entrada vacía: no enviar');
        return;
    }

    console.log('[chat-admin.js] Enviando respuesta de administrador:', texto);

    socket.emit('respuestaAdmin', {
      clienteId,
      contenido: texto
    });

    input.value = '';
  });

  socket.on('mensajeRecibido', (mensaje) => {
    console.log('[chat-admin.js] Mensaje recibido del servidor:', mensaje);

    if (mensaje.clienteId !== clienteId) {
        console.log('[chat-admin.js] Mensaje de otro cliente: ignorar');
        return; // Игнорируем чужие комнаты
    }

    const div = document.createElement('div');

    if (mensaje.remitente === 'admin') {
      div.textContent = `Tu (admin): ${mensaje.contenido}`;
      div.style.textAlign = 'right';
      div.style.backgroundColor = '#cce5ff';
    } else if (mensaje.remitente === 'cliente') {
      div.textContent = `Cliente: ${mensaje.contenido}`;
      div.style.textAlign = 'left';
      div.style.backgroundColor = '#f8f9fa';
    } else {
      console.warn('[chat-admin.js] Remitente desconocido:', mensaje.remitente);
    }

    div.style.margin = '5px';
    div.style.padding = '8px';
    div.style.borderRadius = '8px';
    mensajes.appendChild(div);
    mensajes.scrollTop = mensajes.scrollHeight;
  });
});