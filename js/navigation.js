// Definir la funciu00f3n showSection directamente en el objeto window
// IMPORTANTE: Esta funciu00f3n debe estar disponible globalmente antes de que se cargue el DOM
// Implementaciu00f3n principal de showSection
function navigationShowSection(sectionId, contextId = null, contextTitle = null) {
    console.log(`DEBUG: Mostrando sección desde window.showSection: ${sectionId}`, contextId ? `(Context ID: ${contextId}, Title: ${contextTitle})` : '');
    
    // Asegurarse de que las secciones estu00e9n inicializadas
    if (!sections || Object.keys(sections).length === 0) {
        sections = {
            crear: document.getElementById('crear-section'),
            listar: document.getElementById('listar-section'),
            rizoma: document.getElementById('rizoma-section'),
            kanban: document.getElementById('kanban-section')
        };
        
        sectionTitles = {
            crear: '<span>➕</span> Crear Nuevo Objeto Virtual Creativo',
            listar: '<span>📋</span> Mis objetos virtuales creativos',
            rizoma: '<span>🌱</span> Visualización del Rizoma',
            kanban: '<span>📋</span> Tablero Kanban'
        };
        
        sectionTitle = document.getElementById('section-title');
    }
    
    // Clear iframe if it exists
    const contentArea = document.getElementById('content-area');
    const existingIframe = contentArea.querySelector('iframe');
    if (existingIframe) {
        existingIframe.remove();
    }
    
    // Resto del código de la función showSection
    // Ocultar todas las secciones
    Object.values(sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    
    // Mostrar la sección seleccionada
    if (sections[sectionId]) {
        // Si es la sección de kanban, cargar el contenido de kanban.html
        if (sectionId === 'kanban') {
            // Verificar si necesitamos cargar el contenido
            const kanbanSection = sections[sectionId];
            const existingIframe = kanbanSection.querySelector('iframe');
            
            // Si no hay iframe o necesitamos recargar, crear uno nuevo
            if (!existingIframe) {
                console.log('DEBUG: Cargando contenido de kanban.html en iframe');
                
                // Limpiar la sección antes de añadir el iframe
                kanbanSection.innerHTML = '';
                
                // Crear un iframe para cargar kanban.html
                const iframe = document.createElement('iframe');
                iframe.src = 'kanban.html';
                iframe.id = 'kanban-iframe';
                iframe.className = 'w-full h-full border-none';
                iframe.style.minHeight = '700px';
                iframe.style.width = '100%';
                iframe.style.border = 'none';
                
                // Añadir el iframe al DOM inmediatamente
                kanbanSection.appendChild(iframe);
                
                // Configurar el evento onload para inicializar el Kanban
                iframe.onload = function() {
                    console.log('DEBUG: iframe de kanban cargado correctamente');
                    
                    // Definir una función para inicializar el Kanban
                    const initKanban = () => {
                        try {
                            if (iframe && iframe.contentWindow && iframe.contentWindow.KanbanApp) {
                                console.log(`DEBUG: Inicializando KanbanApp en iframe con contextId: ${contextId || 'ninguno'}, contextTitle: ${contextTitle || 'ninguno'}`);
                                // Pasar tanto el ID como el título del OVC al inicializar el Kanban
                                if (contextId) {
                                    const message = { 
                                        type: 'INIT_KANBAN',
                                        ovcId: contextId,
                                        ovcTitle: contextTitle || 'Sin título',
                                        timestamp: new Date().toISOString()
                                    };
                                    console.log('Enviando mensaje al iframe:', message);
                                    iframe.contentWindow.postMessage(message, '*');
                                } else {
                                    console.error('No se proporcionó un ID de OVC para inicializar el Kanban');
                                }
                                return true;
                            } else {
                                console.warn('KanbanApp aún no está disponible en el iframe, reintentando...');
                                return false;
                            }
                        } catch (error) {
                            console.error('ERROR al inicializar KanbanApp:', error);
                            return false;
                        }
                    };
                    
                    // Configurar el listener para mensajes desde el iframe
                    const kanbanMessageHandler = function(event) {
                        if (event.data && event.data.type === 'KANBAN_READY') {
                            console.log('DEBUG: Recibido mensaje KANBAN_READY desde iframe');
                            if (initKanban()) {
                                // Eliminar este listener una vez inicializado con éxito
                                window.removeEventListener('message', kanbanMessageHandler);
                            }
                        } else if (event.data && event.data.type === 'KANBAN_ERROR') {
                            console.log('Mensaje de error de Kanban ignorado (solo para depuración):', event.data.message);
                            // No mostrar el error al usuario
                        }
                    };
                    
                    // Agregar el listener de mensajes
                    window.addEventListener('message', kanbanMessageHandler);
                    
                    // Configurar el listener para mensajes desde el iframe
                    const waitForKanbanApp = (attempts = 0, maxAttempts = 20) => {
                        console.log(`Intento ${attempts + 1} de ${maxAttempts} para cargar KanbanApp`);
                        
                        // Si ya pasamos el número máximo de intentos, mostrar un error
                        if (attempts >= maxAttempts) {
                            console.error('No se pudo cargar KanbanApp después de varios intentos');
                            return;
                        }
                        
                        // Verificar si el iframe y su contenido están disponibles
                        if (!iframe || !iframe.contentWindow) {
                            console.warn('El iframe aún no está listo');
                            if (attempts < maxAttempts) {
                                return setTimeout(() => waitForKanbanApp(attempts + 1, maxAttempts), 300);
                            }
                            console.error('El iframe no se cargó correctamente después de varios intentos');
                            return;
                        }
                        
                        // Verificar si KanbanApp está disponible
                        try {
                            if (iframe.contentWindow.KanbanApp) {
                                console.log('KanbanApp encontrado en el iframe');
                                if (initKanban()) {
                                    window.addEventListener('message', kanbanMessageHandler);
                                    return; // Éxito
                                }
                            } else {
                                console.warn('KanbanApp aún no está disponible en el iframe');
                            }
                        } catch (e) {
                            console.error('Error al acceder a KanbanApp:', e);
                        }
                        
                        // Reintentar si no se ha alcanzado el máximo de intentos
                        if (attempts < maxAttempts) {
                            setTimeout(() => waitForKanbanApp(attempts + 1, maxAttempts), 300);
                        } else {
                            console.error('No se pudo cargar KanbanApp después de varios intentos');
                            // Intentar una última vez después de un breve retraso
                            setTimeout(() => {
                                if (initKanban()) {
                                    window.addEventListener('message', kanbanMessageHandler);
                                }
                            }, 500);
                        }
                    };
                    
                    // Iniciar el proceso de espera con un pequeño retraso inicial
                    setTimeout(() => waitForKanbanApp(), 100);
                    
                    // Limpiar el listener cuando se desmonte el iframe
                    iframe.addEventListener('unload', () => {
                        window.removeEventListener('message', kanbanMessageHandler);
                    });
                    
                    // También intentar inicializar directamente después de cargar
                    setTimeout(() => {
                        initKanban();
                    }, 500);
                    
                    // Intentar nuevamente después de un tiempo más largo si todo lo demás falla
                    setTimeout(() => {
                        if (!iframe.contentWindow.kanbanInitialized) {
                            console.log('DEBUG: Reintentando inicialización de KanbanApp después de 2 segundos');
                            initKanban();
                        }
                    }, 2000);
                };
            } else if (contextId) {
                // Si ya existe un iframe y tenemos un nuevo contextId, actualizar
                try {
                    if (existingIframe.contentWindow && existingIframe.contentWindow.KanbanApp && 
                        typeof existingIframe.contentWindow.KanbanApp.init === 'function') {
                        console.log(`DEBUG: Actualizando KanbanApp en iframe existente con contextId: ${contextId}`);
                        existingIframe.contentWindow.KanbanApp.init(contextId);
                    } else {
                        // Recargar el iframe si KanbanApp no está disponible
                        console.log('DEBUG: Recargando iframe de kanban porque KanbanApp no está disponible');
                        kanbanSection.innerHTML = '';
                        // Obtener el título del OVC del elemento del botón si está disponible
                        const button = document.querySelector(`button[data-ovc-id="${contextId}"]`);
                        const ovcTitle = button ? (button.getAttribute('data-ovc-title') || 'Sin título') : 'Sin título';
                        navigationShowSection('kanban', contextId, ovcTitle);
                    }
                } catch (error) {
                    console.error('ERROR al actualizar KanbanApp en iframe existente:', error);
                    // Recargar el iframe en caso de error
                    kanbanSection.innerHTML = '';
                    // Obtener el título del OVC del elemento del botón si está disponible
                    const button = document.querySelector(`button[data-ovc-id="${contextId}"]`);
                    const ovcTitle = button ? (button.getAttribute('data-ovc-title') || 'Sin título') : 'Sin título';
                    navigationShowSection('kanban', contextId, ovcTitle);
                }
            }
        }
        
        sections[sectionId].classList.remove('hidden');
        
        // Actualizar el título de la sección
        if (sectionTitle) {
            if (sectionId === 'kanban' && contextTitle) {
                sectionTitle.innerHTML = `<span>📋</span> Tablero Kanban: ${contextTitle}`;
            } else {
                sectionTitle.innerHTML = sectionTitles[sectionId] || '';
            }
        }
        
        // Actualizar el estado activo del enlace de la barra lateral
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
        
        // Acciones específicas por sección
        if (sectionId === 'listar') {
            // Renderizar la tabla de OVCs si estamos en la sección de listar
            if (typeof window.renderOvcTable === 'function') {
                window.renderOvcTable();
            } else {
                console.error('ERROR: renderOvcTable no está disponible como función global.');
            }
        } else if (sectionId === 'rizoma') {
            // Renderizar el grafo de rizoma si estamos en la sección de rizoma
            if (typeof window.renderRizomaGraph === 'function') {
                window.renderRizomaGraph();
            } else {
                console.error('ERROR: renderRizomaGraph no está disponible como función global.');
            }
        } else if (sectionId === 'kanban' && contextId) {
            const kanbanSection = document.getElementById('kanban-section');
            let iframe = kanbanSection.querySelector('iframe');
            
            // Si el iframe no existe, crearlo
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'kanban-iframe';
                iframe.src = 'kanban.html';
                iframe.className = 'w-full h-full border-0';
                iframe.style.minHeight = '600px';
                kanbanSection.innerHTML = '';
                kanbanSection.appendChild(iframe);
                
                // Esperar a que el iframe cargue
                iframe.onload = function() {
                    initializeKanbanIframe(iframe, contextId, contextTitle);
                };
            } else {
                // Si el iframe ya existe, solo inicializarlo
                if (iframe.contentWindow) {
                    initializeKanbanIframe(iframe, contextId, contextTitle);
                }
            }
            
            // Asegurarse de que la sección esté visible
            kanbanSection.style.display = 'flex';
            kanbanSection.style.flexDirection = 'column';
            kanbanSection.style.flex = '1';
        }
    }
}

// Inicialización de variables globales necesarias para la navegación
// Estas variables se inicializan cuando el DOM está completamente cargado
let sections = {};
let sectionTitles = {};
let sidebarLinks = [];
let rubricasToggle;
let rubricasSubmenu;
let sectionTitle;
// isEditMode se define en ovcForm.js

/**
 * Inicializa el iframe del Kanban con el contexto del OVC
 * @param {HTMLIFrameElement} iframe - El elemento iframe a inicializar
 * @param {string} ovcId - ID del OVC
 * @param {string} [ovcTitle] - Título del OVC (opcional)
 */
function initializeKanbanIframe(iframe, ovcId, ovcTitle = 'Sin título') {
    if (!iframe || !iframe.contentWindow) {
        console.error('No se puede inicializar el iframe: elemento no válido');
        return;
    }
    
    try {
        iframe.contentWindow.postMessage({
            type: 'INIT_KANBAN',
            ovcId: ovcId,
            ovcTitle: ovcTitle
        }, '*');
        console.log('Mensaje de inicialización enviado al iframe Kanban');
    } catch (error) {
        console.error('Error al enviar mensaje de inicialización al iframe Kanban:', error);
    }
}

// Listener para mensajes del iframe de Kanban
window.addEventListener('message', function(event) {
    if (!event.data || !event.data.type) return;
    
    const iframe = document.querySelector('#kanban-section iframe');
    if (!iframe || !iframe.contentWindow) return;
    
    // Verificar si el mensaje es del iframe de Kanban
    if (event.source !== iframe.contentWindow) return;
    
    console.log('Mensaje recibido del iframe Kanban:', event.data.type);
    
    switch (event.data.type) {
        case 'KANBAN_READY':
            console.log('Kanban listo en el iframe');
            // No es necesario hacer nada aquí, la inicialización se maneja al mostrar la sección
            break;
            
        case 'KANBAN_INITIALIZED':
            console.log('Kanban inicializado correctamente con OVC ID:', event.data.ovcId);
            // Actualizar el título de la sección si es necesario
            const sectionTitle = document.getElementById('section-title');
            if (sectionTitle) {
                sectionTitle.innerHTML = `<span>📋</span> Tablero Kanban - ${event.data.ovcTitle || 'Sin título'}`;
            }
            break;
            
        default:
            console.log('Mensaje no manejado del iframe Kanban:', event.data);
    }
});

// Inicializar las variables cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    sections = {
        crear: document.getElementById('crear-section'),
        listar: document.getElementById('listar-section'),
        rizoma: document.getElementById('rizoma-section'),
        kanban: document.getElementById('kanban-section')
    };
    
    sectionTitles = {
        crear: '<span>➕</span> Crear Nuevo Objeto Virtual Creativo',
        listar: '<span>📋</span> Mis objetos virtuales creativos',
        rizoma: '<span>🌱</span> Visualización del Rizoma',
        kanban: '<span>📋</span> Tablero Kanban'
    };
    
    sidebarLinks = document.querySelectorAll('.sidebar-link');
    rubricasToggle = document.getElementById('rubricas-toggle');
    rubricasSubmenu = document.getElementById('rubricas-submenu');
    sectionTitle = document.getElementById('section-title');
    
    // Configurar el toggle de rúbricas
    if (rubricasToggle && rubricasSubmenu) {
        console.log('DEBUG: Inicializando toggle de rúbricas');
        let rubricasToggleIcon = rubricasToggle.querySelector('.submenu-toggle-icon');
        
        // Asegurarse de que el ícono exista
        if (!rubricasToggleIcon) {
            console.log('DEBUG: Creando ícono de toggle para rúbricas');
            rubricasToggleIcon = document.createElement('span');
            rubricasToggleIcon.className = 'submenu-toggle-icon';
            rubricasToggle.appendChild(rubricasToggleIcon);
        }
        
        // Inicialmente ocultar el submenú
        rubricasSubmenu.style.maxHeight = '0';
        rubricasSubmenu.style.opacity = '0';
        rubricasSubmenu.style.overflow = 'hidden';
        rubricasSubmenu.style.transition = 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out';
        
        // Configurar el ícono inicial
        rubricasToggleIcon.textContent = '▶️';
        
        // Función para alternar el submenú
        const toggleRubricasMenu = (event) => {
            console.log('DEBUG: Evento de clic en el menú de rúbricas');
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            console.log('DEBUG: Alternando menú de rúbricas');
            
            // Alternar la clase 'open' en el submenú y en el botón toggle
            const isOpening = !rubricasSubmenu.classList.contains('open');
            
            console.log('DEBUG: isOpening:', isOpening);
            console.log('DEBUG: rubricasSubmenu:', rubricasSubmenu);
            console.log('DEBUG: rubricasToggle:', rubricasToggle);
            
            // Actualizar clases
            rubricasSubmenu.classList.toggle('open', isOpening);
            rubricasToggle.classList.toggle('active', isOpening);
            
            // Actualizar estilos directamente para asegurar la visibilidad
            if (isOpening) {
                rubricasSubmenu.style.maxHeight = rubricasSubmenu.scrollHeight + 'px';
                rubricasSubmenu.style.opacity = '1';
            } else {
                rubricasSubmenu.style.maxHeight = '0';
                rubricasSubmenu.style.opacity = '0';
            }
            
            if (rubricasToggleIcon) {
                rubricasToggleIcon.classList.toggle('open', isOpening);
                rubricasToggleIcon.textContent = isOpening ? '▼' : '▶️';
            }
            
            console.log('DEBUG: Estado del menú de rúbricas:', isOpening ? 'abierto' : 'cerrado');
        };
        
        // Agregar manejador de eventos
        console.log('DEBUG: Añadiendo manejador de eventos al botón de rúbricas');
        rubricasToggle.removeEventListener('click', toggleRubricasMenu); // Remover cualquier manejador previo
        rubricasToggle.addEventListener('click', toggleRubricasMenu);
        
        // Asegurarse de que el menú esté cerrado al inicio
        rubricasSubmenu.classList.remove('open');
        rubricasSubmenu.style.maxHeight = '0';
        rubricasSubmenu.style.opacity = '0';
        
        // También manejar clics en los enlaces del submenú para mantener el menú abierto
        const submenuLinks = rubricasSubmenu.querySelectorAll('a');
        submenuLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                console.log('DEBUG: Clic en enlace del submenú:', link.textContent.trim());
                // No prevenir el comportamiento por defecto aquí, ya que loadPageInContentArea lo maneja
            });
        });
        
        // Asegurarse de que el menú esté cerrado al inicio
        rubricasSubmenu.classList.remove('open');
        rubricasToggle.classList.remove('active');
        
        console.log('DEBUG: Menú de rúbricas inicializado correctamente');
    } else {
        console.error('ERROR: No se encontraron todos los elementos del menú de rúbricas');
        console.log('rubricasToggle:', rubricasToggle);
        console.log('rubricasSubmenu:', rubricasSubmenu);
        console.log('rubricasToggleIcon:', rubricasToggleIcon);
    }
    
    // Cargar OVCs al iniciar
    const listarSection = document.getElementById('listar-section');
    if (listarSection && !listarSection.classList.contains('hidden')) {
        window.renderOvcTable();
    }
});

// Funciu00f3n para mostrar una secciu00f3n
function showSection(sectionId, contextId = null, contextTitle = null) { // Added context params
    console.log(`DEBUG: Mostrando sección interna: ${sectionId}`, contextId ? `(Context ID: ${contextId}, Title: ${contextTitle})` : '');
    
    // Clear iframe if it exists
    const contentArea = document.getElementById('content-area');
    const existingIframe = contentArea.querySelector('iframe');
    if (existingIframe) {
        existingIframe.remove();
    }

    // Hide all regular sections
    Object.values(sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    // Deactivate all links first
    sidebarLinks.forEach(link => link.classList.remove('active'));
    // Deactivate rubric parent toggle if active
    rubricasToggle.classList.remove('active');


    const activeSection = sections[sectionId];
    if (activeSection) {
        activeSection.classList.remove('hidden');
    } else {
        console.warn(`Sección con ID '${sectionId}' no encontrada.`);
    }


    // Resetear el formulario a modo creación si estamos en la sección 'crear' o si estamos en modo edición
    if (sectionId === 'crear' || isEditMode) {
        window.resetFormToCreateMode();
    }

    // Update section title - Use contextTitle if provided for Kanban
    if (sectionId === 'kanban' && contextTitle) {
        sectionTitle.innerHTML = `<span>📋</span> Tablero Kanban - ${contextTitle}`;
    } else if (sectionTitles[sectionId]) {
        sectionTitle.innerHTML = sectionTitles[sectionId];
    } else {
        // Keep previous title or set a default if navigating from iframe?
        // For now, let's assume sectionTitles covers all main sections.
    }

    // Activate the correct link
    const activeLink = document.querySelector(`.sidebar-link[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }


    if (sectionId === 'listar') {
        window.renderOvcTable();
    } else if (sectionId === 'crear' && !isEditMode) {
        window.resetFormToCreateMode();
    } else if (sectionId === 'rizoma') {
        // Asegurarse de que existe el contenedor SVG para el rizoma
        const rizomaSection = document.getElementById('rizoma-section');
        let svgElement = document.getElementById('rizoma-graph');
        
        if (!svgElement && rizomaSection) {
            console.log('DEBUG: Creando elemento SVG para el rizoma...');
            svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgElement.id = 'rizoma-graph';
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '600px');
            rizomaSection.appendChild(svgElement);
            console.log('DEBUG: Elemento SVG creado con éxito');
        }
        
        // Retrasar ligeramente la renderización para dar tiempo al layout
        setTimeout(() => {
            console.log("DEBUG: Llamando a renderRizomaGraph desde showSection (retrasado)");
            console.log("DEBUG: Estado del DOM:", document.readyState);
            console.log("DEBUG: Elemento SVG presente:", !!document.getElementById('rizoma-graph'));
            
            if (typeof window.renderRizomaGraph === 'function') {
                window.renderRizomaGraph(); // Renderizar el grafo
            } else {
                console.error('ERROR: La función renderRizomaGraph no está disponible');
                console.log('Intentando cargar rizoma-simple.js dinámicamente...');
                
                // Intentar cargar el script dinámicamente
                const script = document.createElement('script');
                script.src = '../js/rizoma-simple.js';
                script.onload = function() {
                    console.log('rizoma-simple.js cargado dinámicamente');
                    if (typeof window.renderRizomaGraph === 'function') {
                        window.renderRizomaGraph();
                    } else {
                        console.error('ERROR: La función renderRizomaGraph sigue sin estar disponible');
                    }
                };
                document.body.appendChild(script);
            }
        }, 300); // Un retraso más largo para asegurar que todo esté cargado
    } else if (sectionId === 'kanban') {
        const kanbanSection = sections['kanban'];
        
        console.log("DEBUG: Inicializando sección Kanban...");
        
        // Asegurarse de que el contenedor esté vacío
        kanbanSection.innerHTML = '<div id="kanban-section" style="width: 100%; height: 100%;"></div>';
        
        // Usar la implementación simplificada del Kanban
        if (window.KanbanApp && typeof window.KanbanApp.init === 'function') {
            console.log(`DEBUG: Inicializando KanbanApp con ID de OVC: ${contextId}`);
            window.KanbanApp.init(contextId);
            kanbanSection.dataset.loaded = 'true'; // Marcar como cargado
        } else {
            console.error('ERROR: KanbanApp no está disponible');
            console.log('Intentando cargar kanban-simple.js dinámicamente...');
            
            // Intentar cargar el script dinámicamente
            const script = document.createElement('script');
            script.src = '../js/kanban-simple.js';
            script.onload = function() {
                console.log('kanban-simple.js cargado dinámicamente');
                if (window.KanbanApp && typeof window.KanbanApp.init === 'function') {
                    console.log(`DEBUG: Inicializando KanbanApp con ID de OVC: ${contextId} (carga dinámica)`);
                    window.KanbanApp.init(contextId);
                    kanbanSection.dataset.loaded = 'true'; // Marcar como cargado
                } else {
                    console.error('ERROR: KanbanApp sigue sin estar disponible');
                    kanbanSection.innerHTML = `
                        <div class="p-4">
                            <p class="text-red-500 font-semibold">Error: No se pudo inicializar el tablero Kanban.</p>
                            <p class="mt-2">Por favor, recarga la página e intenta nuevamente.</p>
                        </div>`;
                }
            };
            script.onerror = function() {
                console.error('ERROR: No se pudo cargar kanban-simple.js');
                kanbanSection.innerHTML = `
                    <div class="p-4">
                        <p class="text-red-500 font-semibold">Error: No se pudo cargar el módulo Kanban.</p>
                        <p class="mt-2">Por favor, verifica tu conexión a internet y recarga la página.</p>
                    </div>`;
            };
            document.body.appendChild(script);
        }
    }
}

// Exponer la implementaciu00f3n de navigationShowSection globalmente
window.navigationShowSection = navigationShowSection;

// Función para cargar páginas en el área de contenido
function loadPageInContentArea(url, clickedLink) {
    console.log(`DEBUG: Cargando contenido de ${url} en iframe.`);
    const contentArea = document.getElementById('content-area');

    try {
        // Ocultar todas las demás secciones primero
        const allSections = document.querySelectorAll('main > div');
        allSections.forEach(section => {
            if (section.id && section.id !== 'content-area') {
                section.classList.add('hidden');
            }
        });

        // Limpiar contenido anterior (incluyendo cualquier iframe antiguo)
        contentArea.innerHTML = '';
        contentArea.classList.remove('hidden');

        // Crear y configurar iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', url);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
        iframe.style.width = '100%';
        iframe.style.height = '100%'; // Hacer que el iframe llene el contenedor
        iframe.style.minHeight = '600px'; // Asegurar altura mínima
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.style.backgroundColor = '#fff';

        // Agregar indicador de carga
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'flex items-center justify-center p-4';
        loadingDiv.innerHTML = `
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span class="ml-2">Cargando...</span>
        `;
        contentArea.appendChild(loadingDiv);

        // Agregar iframe al área de contenido
        contentArea.appendChild(iframe);

        // Manejar clics en enlaces dentro del iframe
        window.addEventListener('message', function handleIframeMessage(event) {
            // Verificar que el mensaje venga de nuestro iframe
            if (event.source !== iframe.contentWindow) return;
            
            // Verificar si es un mensaje de navegación
            if (event.data && event.data.type === 'navigate') {
                console.log('Navegación dentro del iframe detectada:', event.data.url);
                // Cargar la nueva URL en el iframe
                iframe.contentWindow.location.href = event.data.url;
                return false;
            }
        });

        // Inyectar script en el iframe para manejar la navegación
        iframe.onload = function() {
            try {
                const scriptContent = `
                    // Interceptar clics en enlaces
                    document.addEventListener('click', function(event) {
                        let target = event.target;
                        
                        // Encontrar el enlace más cercano
                        while (target && target.tagName !== 'A' && target !== document) {
                            target = target.parentNode;
                        }
                        
                        if (target && target.tagName === 'A' && target.href) {
                            // Prevenir la navegación normal
                            event.preventDefault();
                            event.stopPropagation();
                            
                            // Enviar mensaje al padre para manejar la navegación
                            window.parent.postMessage({
                                type: 'navigate',
                                url: target.href
                            }, '*');
                            
                            return false;
                        }
                    }, true);
                    
                    // También manejar el evento submit de formularios
                    document.addEventListener('submit', function(event) {
                        const form = event.target;
                        if (form && form.tagName === 'FORM' && form.action) {
                            event.preventDefault();
                            event.stopPropagation();
                            
                            // Enviar mensaje al padre para manejar el envío del formulario
                            window.parent.postMessage({
                                type: 'navigate',
                                url: form.action,
                                method: form.method || 'GET',
                                data: new FormData(form)
                            }, '*');
                            
                            return false;
                        }
                    }, true);
                `;
                
                // Ejecutar el script en el contexto del iframe
                const script = document.createElement('script');
                script.textContent = scriptContent;
                iframe.contentDocument.head.appendChild(script);
                
                console.log('Script de navegación inyectado en el iframe');
            } catch (error) {
                console.error('Error al inyectar script de navegación:', error);
            }
        };

        // Manejar evento de carga del iframe
        let iframeLoaded = false;
        iframe.onload = function() {
            // Solo ejecutar si el iframe no se ha cargado antes
            if (iframeLoaded) return;
            iframeLoaded = true;
            
            // Solo ejecutar si el iframe sigue siendo hijo del contentArea
            if (iframe.parentNode === contentArea) {
                loadingDiv.remove();
                
                // Actualizar título (usar el texto del enlace clickeado)
                let linkText = '';
                if (clickedLink) {
                    linkText = clickedLink.textContent.trim().replace(/^[^\\w]+/, ''); // Limpiar emoji/prefijo
                    
                    // Actualizar estado del enlace activo
                    const sidebarLinks = document.querySelectorAll('.sidebar-link');
                    sidebarLinks.forEach(link => link.classList.remove('active'));
                    clickedLink.classList.add('active');
                    
                    // También marcar el toggle principal de "Rúbricas" como activo visualmente si es un submenú
                    const rubricasToggle = document.getElementById('rubricas-dropdown');
                    const rubricasSubmenu = document.getElementById('rubricas-submenu');
                    const rubricasToggleIcon = document.getElementById('rubricas-toggle-icon');
                    
                    if (clickedLink.classList.contains('submenu-link') && rubricasToggle) {
                        rubricasToggle.classList.add('active');
                        // Asegurar que el submenú permanezca abierto visualmente
                        if (rubricasSubmenu && !rubricasSubmenu.classList.contains('open')) {
                            rubricasSubmenu.classList.add('open');
                            if (rubricasToggleIcon) {
                                rubricasToggleIcon.classList.add('open');
                                rubricasToggleIcon.textContent = '▼';
                            }
                        }
                    }
                }
                
                // Actualizar título de la sección con el emoji apropiado según la página
                const sectionTitle = document.getElementById('section-title');
                if (sectionTitle) {
                    let emoji = '📄';
                    if (url.includes('evaluar')) emoji = '✔️';
                    else if (url.includes('promedio')) emoji = '📊';
                    else if (url.includes('rubrica') || url.includes('resumen')) emoji = '📑';
                    
                    let titleText = linkText || 'Cargando...';
                    if (clickedLink && clickedLink.dataset.title) {
                        titleText = clickedLink.dataset.title;
                    }
                    
                    sectionTitle.innerHTML = `${emoji} ${titleText}`;
                }
            }
        };

        // Manejar error del iframe
        iframe.onerror = function() {
            loadingDiv.innerHTML = `
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p class="font-bold">Error al cargar el contenido</p>
                    <p>No se pudo cargar la página: ${url}</p>
                </div>
            `;
            console.error(`Error al cargar la página: ${url}`);
        };

        // Agregar el iframe al DOM inmediatamente
        contentArea.appendChild(iframe);

    } catch (error) {
        console.error('Error en loadPageInContentArea:', error);
        contentArea.innerHTML = `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p class="font-bold">Error</p>
                <p>${error.message || 'Error al cargar el contenido'}</p>
            </div>
        `;
    }
}

// Hacer la función accesible globalmente
window.loadPageInContentArea = loadPageInContentArea;

// Asignar la implementaciu00f3n a window.showSection cuando el DOM estu00e9 cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG: navigation.js - DOMContentLoaded');
    // Reemplazar la implementaciu00f3n temporal de showSection con la implementaciu00f3n completa
    window.showSection = navigationShowSection;
    console.log('DEBUG: Implementaciu00f3n de showSection actualizada');
    
    // Si hay una sección activa, asegurarse de que se renderice correctamente
    const activeSection = document.querySelector('.section:not(.hidden)');
    if (activeSection && activeSection.id === 'rizoma-section') {
        console.log('DEBUG: Sección de rizoma activa, renderizando grafo...');
        setTimeout(() => {
            if (typeof window.renderRizomaGraph === 'function') {
                window.renderRizomaGraph();
            }
        }, 100);
    }
});
