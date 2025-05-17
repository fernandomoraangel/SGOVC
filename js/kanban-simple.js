/**
 * Este archivo es un puente para la implementación completa de Kanban en kanban.html
 * Maneja la carga del iframe y la comunicación con la ventana principal
 */



// Definir un objeto global KanbanApp para manejar la inicialización
window.KanbanApp = window.KanbanApp || {
    /**
     * Inicializa el tablero Kanban para un OVC específico
     * @param {string} ovcId - ID del OVC para el que se desea cargar el tablero
     * @param {string} ovcTitle - Título del OVC (opcional)
     */
    init: function(ovcId, ovcTitle = 'Sin título') {
        console.log('KanbanApp.init llamado con OVC ID:', ovcId, 'Título:', ovcTitle);
        
        // Validar que se proporcione un ID de OVC
        if (!ovcId) {
            console.error('Error: Se requiere un ID de OVC válido');
            return;
        }
        
        // Obtener o crear el contenedor del iframe
        let kanbanContainer = document.getElementById('kanban-section');
        if (!kanbanContainer) {
            console.error('No se encontró el contenedor del Kanban');
            return;
        }
        
        // Asegurar que el contenedor tenga estilos adecuados
        kanbanContainer.style.width = '100%';
        kanbanContainer.style.minHeight = '800px';
        kanbanContainer.style.padding = '1.5rem';
        kanbanContainer.style.backgroundColor = '#f3f4f6';
        kanbanContainer.style.borderRadius = '0.75rem';
        
        // Actualizar el título de la sección si es posible
        const sectionTitle = document.getElementById('section-title');
        if (sectionTitle) {
            sectionTitle.innerHTML = `<span>📋</span> Tablero Kanban`;
        }
        
        // Limpiar el contenedor
        kanbanContainer.innerHTML = '';
        
        // Crear el iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'kanban-iframe';
        iframe.src = 'pages/kanban.html';
        iframe.style.width = '100%';
        iframe.style.minHeight = '800px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '0.75rem';
        iframe.style.overflow = 'hidden';
        iframe.style.backgroundColor = 'white';
        iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        
        // Función para enviar el mensaje de inicialización
        const sendInitMessage = () => {
            console.log('Intentando enviar mensaje INIT_KANBAN...');
            if (iframe && iframe.contentWindow) {
                console.log('Enviando mensaje INIT_KANBAN al iframe con OVC ID:', ovcId);
                try {
                    const message = { 
                        type: 'INIT_KANBAN',
                        ovcId: ovcId,
                        ovcTitle: ovcTitle,
                        timestamp: new Date().toISOString()
                    };
                    console.log('Contenido del mensaje:', JSON.stringify(message, null, 2));
                    iframe.contentWindow.postMessage(message, '*');
                    console.log('Mensaje enviado correctamente');
                } catch (error) {
                    console.error('Error al enviar mensaje al iframe:', error);
                }
            } else {
                console.warn('El iframe no está listo para recibir mensajes');
                console.log('Estado del iframe:', {
                    iframeExists: !!iframe,
                    contentWindow: iframe ? !!iframe.contentWindow : 'no iframe',
                    readyState: iframe ? iframe.readyState : 'no iframe'
                });
            }
        };

        // Añadir el iframe al contenedor
        kanbanContainer.appendChild(iframe);
        
        // Esperar a que el iframe esté completamente cargado antes de enviar el mensaje
        iframe.onload = function() {
            console.log('Iframe cargado, esperando a que esté listo para recibir mensajes...');
            // Esperar un breve momento para asegurar que el contenido del iframe esté listo
            setTimeout(sendInitMessage, 500);
        };
        
        // También intentar enviar el mensaje cuando recibamos el evento KANBAN_READY
        const kanbanReadyHandler = (event) => {
            if (event.data && event.data.type === 'KANBAN_READY') {
                console.log('Recibido evento KANBAN_READY del iframe');
                // Eliminar el event listener para evitar múltiples inicializaciones
                window.removeEventListener('message', kanbanReadyHandler);
                // Enviar el mensaje de inicialización
                sendInitMessage();
            }
        };
        
        // Escuchar el evento KANBAN_READY del iframe
        window.addEventListener('message', kanbanReadyHandler);

        // Manejar mensajes del iframe
        const messageHandler = (event) => {
            // Verificar si el mensaje es del iframe correcto
            if (!event.data || typeof event.data !== 'object' || !event.data.type) {
                return;
            }
            
            // Verificar si el mensaje es del iframe correcto
            if (event.source !== iframe.contentWindow) {
                return;
            }
            
            console.log('Mensaje recibido del iframe:', event.data);
            
            if (event.data.type === 'KANBAN_READY') {
                console.log('Kanban listo, inicializando con OVC ID:', ovcId);
                
                // Cancelar cualquier reintento pendiente
                if (window.kanbanInitRetry) {
                    clearTimeout(window.kanbanInitRetry);
                    window.kanbanInitRetry = null;
                }
                
                // Esperar un breve momento para asegurar que el iframe esté listo
                setTimeout(sendInitMessage, 100);
            }
            else if (event.data.type === 'KANBAN_INITIALIZED') {
                console.log('Kanban inicializado correctamente en el iframe');
                window.kanbanInitialized = true;
                
                // Ocultar indicador de carga si existe
                const loadingIndicator = document.getElementById('kanban-loading');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
            }
            // Ignorar explícitamente los mensajes de error
        };

        // Añadir el listener de mensajes con { once: true } para mensajes únicos
        const handleInitialMessage = (event) => {
            messageHandler(event);
            // Cambiar al manejador normal después del primer mensaje
            window.removeEventListener('message', handleInitialMessage);
            window.addEventListener('message', messageHandler);
        };
        
        window.addEventListener('message', handleInitialMessage);

        // Limpiar el listener cuando se desmonte el componente
        const cleanup = () => {
            console.log('Limpiando manejadores del Kanban');
            window.removeEventListener('message', messageHandler);
            window.removeEventListener('message', handleInitialMessage);
            delete window.lastProcessedMessage;
            
            if (window.kanbanInitRetry) {
                clearTimeout(window.kanbanInitRetry);
                window.kanbanInitRetry = null;
            }
            
            // Eliminar manejadores de eventos del iframe
            if (iframe) {
                iframe.removeEventListener('unload', cleanup);
                iframe.removeEventListener('load', iframeLoadHandler);
            }
        };
        
        // Configurar el manejador de carga del iframe
        const iframeLoadHandler = function() {
            console.log('Evento onload del iframe disparado');
            // Limpiar cualquier intento previo
            if (window.kanbanInitRetry) {
                clearTimeout(window.kanbanInitRetry);
                window.kanbanInitRetry = null;
            }
            checkIframeReady();
        };
        
        // Configurar el evento unload para limpiar recursos
        iframe.addEventListener('unload', cleanup);
        
        // Función para verificar si el iframe está listo y enviar el mensaje
        const checkIframeReady = (attempts = 0, maxAttempts = 5) => {
            console.log(`Verificando si el iframe está listo (intento ${attempts + 1}/${maxAttempts})`);
            
            // Mostrar indicador de carga
            const showLoading = () => {
                const loadingContainer = document.createElement('div');
                loadingContainer.id = 'kanban-loading';
                loadingContainer.className = 'p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 mb-4';
                loadingContainer.role = 'status';
                loadingContainer.innerHTML = `
                    <div class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p>Cargando tablero Kanban, por favor espere...</p>
                    </div>
                `;
                
                const kanbanSection = document.getElementById('kanban-section');
                if (kanbanSection) {
                    kanbanSection.insertBefore(loadingContainer, kanbanSection.firstChild);
                } else {
                    document.body.insertBefore(loadingContainer, document.body.firstChild);
                }
            };
            
            if (attempts === 0) {
                showLoading();
            }
            
            if (attempts >= maxAttempts) {
                console.error('Se agotaron los intentos de inicialización del iframe');
                
                // Ocultar indicador de carga
                const loadingIndicator = document.getElementById('kanban-loading');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                
                // Mostrar mensaje de error al usuario
                const errorContainer = document.createElement('div');
                errorContainer.className = 'p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mb-4';
                errorContainer.role = 'alert';
                errorContainer.innerHTML = `
                    <p class="font-bold">Error al cargar el tablero Kanban</p>
                    <p>No se pudo inicializar el tablero después de varios intentos. Por favor, recarga la página.</p>
                `;
                
                const kanbanSection = document.getElementById('kanban-section');
                if (kanbanSection) {
                    kanbanSection.insertBefore(errorContainer, kanbanSection.firstChild);
                } else {
                    document.body.insertBefore(errorContainer, document.body.firstChild);
                }
                
                return;
            }
            
            if (iframe.contentWindow && iframe.contentWindow.document.readyState === 'complete') {
                console.log('Iframe listo, enviando mensaje de inicialización...');
                sendInitMessage();
                
                // Programar un nuevo intento si no se recibe confirmación
                window.kanbanInitRetry = setTimeout(() => {
                    if (!window.kanbanInitialized) {
                        console.log('Reintentando verificar estado del iframe...');
                        checkIframeReady(attempts + 1, maxAttempts);
                    }
                }, 1000); // Aumentar el tiempo de espera a 1 segundo
            } else {
                // El iframe aún no está listo, volver a intentar
                setTimeout(() => checkIframeReady(attempts + 1, maxAttempts), 300);
            }
        };
        
        // Configurar el evento onload del iframe
        iframe.addEventListener('load', iframeLoadHandler);
        
        // Si el iframe ya está cargado cuando se configura el evento
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            console.log('Iframe ya estaba cargado, verificando estado...');
            checkIframeReady();
        }
    }
};

// Inicializar automáticamente si se carga directamente
if (window.self === window.top) {
    document.addEventListener('DOMContentLoaded', function() {
        // Si se carga directamente, intentar obtener el ID del OVC de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const ovcId = urlParams.get('ovcId');
        const ovcTitle = urlParams.get('title') || 'Sin título';
        
        if (ovcId) {
            window.KanbanApp.init(ovcId, ovcTitle);
        } else {
            console.log('No se proporcionó un ID de OVC en la URL');
            // Mostrar un mensaje al usuario
            const container = document.getElementById('kanban-section') || document.body;
            container.innerHTML = `
                <div class="p-8 text-center">
                    <h2 class="text-2xl font-bold text-red-600 mb-4">Error: No se especificó un OVC</h2>
                    <p class="mb-4">No se proporcionó un ID de OVC válido para cargar el tablero Kanban.</p>
                    <a href="index.html" class="text-blue-600 hover:underline">Volver al inicio</a>
                </div>
            `;
        }
    });
}
