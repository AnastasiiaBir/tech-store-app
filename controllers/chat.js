// document.addEventListener('DOMContentLoaded', () => {
  //const socket = io();

  //const chatForm = document.getElementById('formulario-chat');
  //const input = document.getElementById('input-chat');
  //const mensajes = document.getElementById('mensajes');

  // Фокус в поле ввода при загрузке
  //input.focus();

  // Эти данные вставляются через EJS прямо в HTML при рендере
  //const clienteNombre = document.body.dataset.cliente;
  //const clienteEmail = document.body.dataset.email;
  //const clienteId = parseInt(document.body.dataset.clienteid, 10);

  //socket.on("connect", () => {
  //console.log("[Client] Socket подключился, id:", socket.id);
//})

    // Подключаемся к комнате клиента
  //socket.emit('joinRoom', { clienteId, role: 'cliente' });
  //console.log(`[chat.js] Подключение к комнате cliente_${clienteId}`);

  //if (chatForm && input && mensajes) {
    //chatForm.addEventListener('submit', function (e) {
      //e.preventDefault();
      //const texto = input.value.trim();
      //if (texto && clienteId) {
        //console.log(`[chat.js] Отправка сообщения: "${texto}" от клиента ${clienteNombre} (${clienteId})`);
        //console.log('Отправлено сообщение:', {
          //contenido: texto,
          //cliente: clienteNombre,
          //email: clienteEmail,
          //clienteId: clienteId,
          //remitente: 'cliente'
        //});

        //socket.emit('nuevoMensaje', {
          //contenido: texto,
          //cliente: clienteNombre,
          //email: clienteEmail,
          //clienteId: clienteId,
          //remitente: 'cliente'
        //});
        //input.value = '';
      //}
    //});

  //socket.on('mensajeRecibido', function (mensaje) {
    //console.log('[chat.js] Получено сообщение с сервера:', mensaje);

    //f (mensaje.clienteId !== clienteId) {
        //console.warn('[chat.js] Сообщение для другого клиента, игнорируем', mensaje.clienteId);
        //return;
      //}

    //const div = document.createElement('div');
    //div.dataset.id = mensaje.id;

      //if (mensaje.remitente === 'cliente' && mensaje.clienteId === clienteId) {
        //div.textContent = `Tu: ${mensaje.contenido}`;
        //div.style.textAlign = 'right';  // свои сообщения справа
        //div.style.backgroundColor = '#dcf8c6'; // зеленоватый фон, как в WhatsApp
      //} else if (mensaje.remitente === 'admin') {
        //div.textContent = `Admin: ${mensaje.contenido}`;
        //div.style.textAlign = 'left';
        //div.style.backgroundColor = '#f1f0f0'; // сероватый фон
      //} else {
        // Сообщения других клиентов или неопознанные
        //div.textContent = `Cliente ${mensaje.clienteId}: ${mensaje.contenido}`;
        //div.style.textAlign = 'left';
        //div.style.backgroundColor = '#eee'; // светло-голубой фон
      //}

      //div.style.margin = '5px';
      //div.style.padding = '8px';
      //div.style.borderRadius = '8px';
      //mensajes.appendChild(div);
      //mensajes.scrollTop = mensajes.scrollHeight;
    //});

    // Обработка истории от сервера
    //socket.on('historialMensajes', function (mensajesHistorial) {
      //console.log('[chat.js] Получена история сообщений:', mensajesHistorial);

      //mensajesHistorial.forEach(mensaje => {
        //if (mensaje.clienteId !== clienteId) return;

        //const div = document.createElement('div');

    //if (mensaje.remitente === 'cliente' && mensaje.clienteId === clienteId) {
      //div.textContent = `Tu: ${mensaje.contenido}`;
      //div.style.textAlign = 'right';
      //div.style.backgroundColor = '#dcf8c6';
    //} else if (mensaje.remitente === 'admin') {
      //div.textContent = `Admin: ${mensaje.contenido}`;
      //div.style.textAlign = 'left';
      //div.style.backgroundColor = '#f1f0f0';
    //}

    //div.style.margin = '5px';
    //div.style.padding = '8px';
    //div.style.borderRadius = '8px';
    //mensajes.appendChild(div);
  //});

  //mensajes.scrollTop = mensajes.scrollHeight;
//});
 //}
//});