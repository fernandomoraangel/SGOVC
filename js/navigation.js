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
                                console.log(`DEBUG: Inicializando KanbanApp en iframe con contextId: ${contextId || 'ninguno'}`);
                                iframe.contentWindow.KanbanApp.init(contextId);
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
                        }
                    };
                    
                    // Asegurarse de que el iframe esté completamente cargado
                    const waitForKanbanApp = (attempts = 0, maxAttempts = 20) => {
                        console.log(`Intento ${attempts + 1} de ${maxAttempts} para cargar KanbanApp`);
                        
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
                        navigationShowSection('kanban', contextId);
                    }
                } catch (error) {
                    console.error('ERROR al actualizar KanbanApp en iframe existente:', error);
                    // Recargar el iframe en caso de error
                    kanbanSection.innerHTML = '';
                    navigationShowSection('kanban', contextId);
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
        } else if (sectionId === 'kanban' && contextId && typeof KanbanApp !== 'undefined' && typeof KanbanApp.init === 'function') {
            // Inicializar Kanban con contexto si estamos en la sección de kanban y no estamos usando iframe
            KanbanApp.init(contextId);
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

// Listener para mensajes del iframe de Kanban
window.addEventListener('message', function(event) {
    // Verificar si el mensaje es del iframe de Kanban
    if (event.data && event.data.type === 'KANBAN_READY') {
        console.log('DEBUG: Recibido mensaje KANBAN_READY del iframe');
        
        // Obtener el iframe
        const iframe = document.getElementById('kanban-iframe');
        if (iframe && iframe.contentWindow) {
            // Obtener el contexto actual (si hay alguno)
            const currentSection = Object.entries(sections).find(([_, section]) => {
                return section && !section.classList.contains('hidden');
            });
            
            if (currentSection && currentSection[0] === 'kanban') {
                console.log('DEBUG: Inicializando KanbanApp en respuesta a KANBAN_READY');
                // Intentar inicializar KanbanApp en el iframe
                try {
                    if (iframe.contentWindow.KanbanApp && typeof iframe.contentWindow.KanbanApp.init === 'function') {
                        iframe.contentWindow.KanbanApp.init();
                    }
                } catch (error) {
                    console.error('ERROR al inicializar KanbanApp desde mensaje:', error);
                }
            }
        }
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
    
    // Configurar el toggle de ru00fabricas
    if (rubricasToggle && rubricasSubmenu) {
        const rubricasToggleIcon = rubricasToggle.querySelector('.submenu-toggle-icon');
        if (rubricasToggleIcon) {
            rubricasToggle.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link behavior
                const isOpen = rubricasSubmenu.classList.toggle('open');
                rubricasToggleIcon.classList.toggle('open', isOpen);
                rubricasToggleIcon.textContent = isOpen ? '▼' : '▶️'; // Change arrow icon
            });
        } else {
            console.error('ERROR: No se encontru00f3 el icono de toggle para ru00fabricas');
        }
    } else {
        console.error('ERROR: No se encontru00f3 el toggle de ru00fabricas o el submenu');
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


    if (sectionId !== 'crear' && isEditMode) {
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
