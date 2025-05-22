// Función para mostrar el modal del foro
function showForumModal(ovcId) {
    const modal = document.getElementById('forum-modal');
    const iframe = document.getElementById('forum-iframe');
    const closeBtn = document.getElementById('close-forum-modal');
    const modalTitle = document.getElementById('forum-modal-title');
    
    // Obtener el título del OVC desde localStorage
    let ovcTitle = 'OVC';
    try {
        // Attempt to get OVCs from a global function if available, otherwise fallback to direct localStorage access
        let ovcs = [];
        if (typeof window.getOvcsFromStorage === 'function') {
            ovcs = window.getOvcsFromStorage();
        } else if (localStorage.getItem('ovcData')) { // Fallback for 'ovcData' key
            ovcs = JSON.parse(localStorage.getItem('ovcData')) || [];
        } else { // Fallback for 'ovcs' key if 'ovcData' is not found
            ovcs = JSON.parse(localStorage.getItem('ovcs')) || [];
        }

        const ovc = ovcs.find(o => o.id === ovcId || (o.id && o.id.toString() === ovcId)); // Handle both number and string IDs
        if (ovc && ovc.titulo) {
            ovcTitle = ovc.titulo;
        }
    } catch (error) {
        console.error('Error al obtener el título del OVC:', error);
    }
    
    // Actualizar el título del modal
    modalTitle.textContent = `Foro: ${ovcTitle}`;
    
    // Configurar la URL del foro con el título codificado
    const forumUrl = `foro_embed.html?ovcId=${ovcId}&ovcTitle=${encodeURIComponent(ovcTitle)}`;
    console.log('Cargando foro en modal:', forumUrl);
    
    // Cargar el foro en el iframe
    iframe.src = forumUrl;
    
    // Mostrar el modal
    if (modal) modal.classList.remove('hidden');
    
    // Manejar el cierre del modal
    function closeModal() {
        if (modal) modal.classList.add('hidden');
        // Limpiar el iframe al cerrar
        if (iframe) iframe.src = 'about:blank';
    }
    
    // Configurar el botón de cierre
    if (closeBtn) closeBtn.onclick = closeModal;
    
    // Cerrar al hacer clic fuera del contenido
    if (modal) {
        modal.onclick = function(event) {
            if (event.target === modal) {
                closeModal();
            }
        };
    }
    
    // Cerrar con la tecla Escape
    document.addEventListener('keydown', function onEsc(event) {
        if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeModal();
            document.removeEventListener('keydown', onEsc); // Remove self once executed for this modal instance
        }
    });
}

// Manejador de eventos delegado para los botones de acción (incluyendo dinámicos)
document.addEventListener('DOMContentLoaded', function() {
    // Usamos el evento click en el documento para manejar elementos dinámicos
    document.addEventListener('click', function(event) {
        // Manejador para el botón del foro
        let forumBtn = event.target.closest('.forum-ovc-btn');
        if (!forumBtn) {
            const forumLink = event.target.closest('a[href*="foro.html"]');
            if (forumLink) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                const ovcId = forumLink.getAttribute('data-id') || 
                              new URLSearchParams(forumLink.getAttribute('href').split('?')[1] || '').get('ovcId');
                if (ovcId) { // Ensure ovcId is not null or undefined
                    console.log('Manejador global (en modalHandlers.js): Clic en enlace del foro para OVC ID:', ovcId);
                    showForumModal(ovcId);
                } else {
                    console.warn('Manejador global (en modalHandlers.js): ID de OVC no encontrado en enlace de foro.');
                }
                return false;
            }
        } else { // forumBtn is not null
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            const ovcId = forumBtn.getAttribute('data-id');
            if (ovcId) { // Ensure ovcId is not null or undefined
                console.log('Manejador global (en modalHandlers.js): Clic en botón del foro para OVC ID:', ovcId);
                showForumModal(ovcId);
            } else {
                console.warn('Manejador global (en modalHandlers.js): ID de OVC no encontrado en botón de foro.');
            }
            return false;
        }
        
        // Manejador para el botón de evaluar
        const evaluateBtn = event.target.closest('.evaluate-ovc-btn');
        if (evaluateBtn) {
            event.preventDefault();
            event.stopPropagation(); // Prevenir propagación adicional
            const ovcId = evaluateBtn.getAttribute('data-id');
             if (ovcId) {
                console.log('DEBUG (in modalHandlers.js): Clic en botón de evaluar (delegado) para OVC ID:', ovcId);
                showEvaluateModal(ovcId);
            } else {
                console.warn('DEBUG (in modalHandlers.js): ID de OVC no encontrado en botón de evaluar.');
            }
            return false;
        }
        
        // Manejador para el botón de ver promedios
        const viewAveragesBtn = event.target.closest('.view-averages-btn');
        if (viewAveragesBtn) {
            event.preventDefault();
            event.stopPropagation(); // Prevenir propagación adicional
            const ovcId = viewAveragesBtn.getAttribute('data-id');
            if (ovcId) {
                console.log('DEBUG (in modalHandlers.js): Clic en botón de ver promedios (delegado) para OVC ID:', ovcId);
                showAveragesModal(ovcId);
            } else {
                 console.warn('DEBUG (in modalHandlers.js): ID de OVC no encontrado en botón de ver promedios.');
            }
            return false;
        }
    }, true); // Usar captura para asegurar que se ejecute primero
});

// Funciones para mostrar/ocultar los modales
function showEvaluateModal(ovcId) {
    const modal = document.getElementById('evaluate-modal');
    const iframe = document.getElementById('evaluate-iframe');
    const closeBtn = document.getElementById('close-evaluate-modal');
    const modalTitle = document.getElementById('evaluate-modal-title');
    
    // Obtener el título del OVC desde localStorage
    let ovcTitle = 'OVC';
    try {
        let ovcs = [];
        if (typeof window.getOvcsFromStorage === 'function') {
            ovcs = window.getOvcsFromStorage();
        } else if (localStorage.getItem('ovcData')) { 
            ovcs = JSON.parse(localStorage.getItem('ovcData')) || [];
        } else { 
            ovcs = JSON.parse(localStorage.getItem('ovcs')) || [];
        }
        const ovc = ovcs.find(o => o.id === ovcId || (o.id && o.id.toString() === ovcId));
        if (ovc && ovc.titulo) {
            ovcTitle = ovc.titulo;
        }
    } catch (error) {
        console.error('Error al obtener el título del OVC:', error);
    }
    
    // Actualizar el título del modal
    if (modalTitle) modalTitle.textContent = `Evaluar: ${ovcTitle}`;
    
    // Configurar la URL del evaluador
    const evaluateUrl = `evaluar_ovc.html?ovcId=${ovcId}&embedded=true`;
    console.log('Cargando evaluador en modal:', evaluateUrl);
    
    // Cargar el evaluador en el iframe
    if (iframe) iframe.src = evaluateUrl;
    
    // Mostrar el modal
    if (modal) modal.classList.remove('hidden');
    
    // Manejar el cierre del modal
    function closeModal() {
        if (modal) modal.classList.add('hidden');
        if (iframe) iframe.src = 'about:blank';
    }
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (modal) {
        modal.onclick = function(event) {
            if (event.target === modal) {
                closeModal();
            }
        };
    }
    
    document.addEventListener('keydown', function onEsc(event) {
        if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeModal();
            document.removeEventListener('keydown', onEsc);
        }
    });
}

function showAveragesModal(ovcId) {
    const modal = document.getElementById('averages-modal');
    const iframe = document.getElementById('averages-iframe');
    const closeBtn = document.getElementById('close-averages-modal');
    const modalTitle = document.getElementById('averages-modal-title');
    
    let ovcTitle = 'OVC';
    try {
        let ovcs = [];
        if (typeof window.getOvcsFromStorage === 'function') {
            ovcs = window.getOvcsFromStorage();
        } else if (localStorage.getItem('ovcData')) {
            ovcs = JSON.parse(localStorage.getItem('ovcData')) || [];
        } else {
            ovcs = JSON.parse(localStorage.getItem('ovcs')) || [];
        }
        const ovc = ovcs.find(o => o.id === ovcId || (o.id && o.id.toString() === ovcId));
        if (ovc && ovc.titulo) {
            ovcTitle = ovc.titulo;
        }
    } catch (error) {
        console.error('Error al obtener el título del OVC:', error);
    }
    
    if (modalTitle) modalTitle.textContent = `Promedios: ${ovcTitle}`;
    
    const averagesUrl = `ver_promedios.html?ovcId=${ovcId}&embedded=true`;
    console.log('Cargando promedios en modal:', averagesUrl);
    
    if (iframe) iframe.src = averagesUrl;
    if (modal) modal.classList.remove('hidden');
    
    function closeModal() {
        if (modal) modal.classList.add('hidden');
        if (iframe) iframe.src = 'about:blank';
    }
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (modal) {
        modal.onclick = function(event) {
            if (event.target === modal) {
                closeModal();
            }
        };
    }
    
    document.addEventListener('keydown', function onEsc(event) {
        if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeModal();
            document.removeEventListener('keydown', onEsc);
        }
    });
}
