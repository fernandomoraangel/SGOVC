/**
 * Este archivo es un puente para la implementación completa de Kanban en kanban.html
 * Maneja la carga del iframe y la comunicación con la ventana principal
 */

// Definir un objeto global KanbanApp para manejar la inicialización
window.KanbanApp = window.KanbanApp || {
    init: function(contextId) {
        console.log('KanbanApp.init llamado con contextId:', contextId);
        
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
        
        // Limpiar el contenedor
        kanbanContainer.innerHTML = '';
        
        // Crear el iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'kanban-iframe';
        iframe.src = 'pages/kanban.html';
        iframe.style.width = '100%';
        iframe.style.minHeight = '800px';  // Altura mínima para asegurar visibilidad
        iframe.style.border = 'none';
        iframe.style.borderRadius = '0.75rem';
        iframe.style.overflow = 'hidden';
        iframe.style.backgroundColor = 'white';  // Fondo blanco para el área del iframe
        iframe.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        
        // Añadir el iframe al contenedor
        kanbanContainer.appendChild(iframe);
        
        // Función para enviar el mensaje de inicialización
        const sendInitMessage = () => {
            console.log('Intentando enviar mensaje INIT_KANBAN...');
            if (iframe && iframe.contentWindow) {
                console.log('Enviando mensaje INIT_KANBAN al iframe con OVC ID:', contextId);
                try {
                    const message = { 
                        type: 'INIT_KANBAN',
                        ovcId: contextId,
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

        // Manejar mensajes del iframe
        const messageHandler = (event) => {
            if (event.data && event.data.type === 'KANBAN_READY') {
                console.log('Kanban listo, inicializando con OVC ID:', contextId);
                // Esperar un breve momento para asegurar que el iframe esté listo
                setTimeout(sendInitMessage, 100);
            }
        };

        // Añadir el listener de mensajes
        window.addEventListener('message', messageHandler);

        // Limpiar el listener cuando se desmonte el componente
        iframe.addEventListener('unload', () => {
            window.removeEventListener('message', messageHandler);
        });
    }
};

// Inicializar automáticamente si se carga directamente
if (window.self === window.top) {
    document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const contextId = urlParams.get('ovcId') || null;
        window.KanbanApp.init(contextId);
    });
}
