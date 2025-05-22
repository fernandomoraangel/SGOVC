// Definir la función showSection directamente en el HTML para asegurar que esté disponible
window.showSection = function(sectionId, contextId = null, contextTitle = null) {
    console.log(`DEBUG: Mostrando sección desde window.showSection en HTML: ${sectionId}`, contextId ? `(Context ID: ${contextId}, Title: ${contextTitle})` : '');
    
    // Verificar si existe la implementación en navigation.js y usarla si está disponible
    if (window.navigationShowSection && typeof window.navigationShowSection === 'function') {
        console.log('DEBUG: Delegando a la implementación en navigation.js');
        return window.navigationShowSection(sectionId, contextId, contextTitle);
    }
    
    // Implementación de respaldo si navigation.js no está cargado aún
    const sections = {
        crear: document.getElementById('crear-section'),
        listar: document.getElementById('listar-section'),
        rizoma: document.getElementById('rizoma-section'),
        kanban: document.getElementById('kanban-section')
    };
    
    // Ocultar todas las secciones
    Object.values(sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    
    // Mostrar la sección seleccionada
    if (sections[sectionId]) {
        sections[sectionId].classList.remove('hidden');
        
        // Si es la sección de rizoma, intentar renderizar el grafo
        if (sectionId === 'rizoma' && typeof window.renderRizomaGraph === 'function') {
            console.log('DEBUG: Renderizando rizoma desde la implementación HTML de showSection');
            setTimeout(() => window.renderRizomaGraph(), 100);
        }
    }
};
