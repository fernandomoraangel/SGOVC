// js/ovcDisplay.js

// Asegurarse de que getOvcsFromStorage esté disponible
window.renderOvcTable = function(ovcsToRender) {
    // Exportar la funciu00f3n globalmente de inmediato
    window.renderOvcTable = renderOvcTable;
    
    const ovcTableBody = document.getElementById('ovc-table-body'); // Necesitamos obtener este elemento
    const paginationStart = document.getElementById('pagination-start');
    const paginationEnd = document.getElementById('pagination-end');
    const paginationTotal = document.getElementById('pagination-total');


    if (!ovcTableBody) return;
    // Si no se proveen OVCs para renderizar, obtener todos desde el storage (comportamiento original)
    const ovcs = ovcsToRender || getOvcsFromStorage(); // Asegúrate que getOvcsFromStorage esté disponible

    ovcTableBody.innerHTML = ''; // Limpiar tabla

    if (paginationStart && paginationEnd && paginationTotal) {
        paginationStart.textContent = ovcs.length > 0 ? '1' : '0';
        paginationEnd.textContent = ovcs.length;
        paginationTotal.textContent = ovcs.length;
    }

    if (ovcs.length === 0) {
        ovcTableBody.innerHTML = `<tr class="empty-table-row"><td colspan="6">No hay OVCs guardados.</td></tr>`;
    } else {
        ovcs.forEach((ovc) => {
            const row = document.createElement('tr');
            const truncate = (str, num) => str && str.length > num ? str.slice(0, num) + "..." : str;
            const displayAutores = (autores) => {
                if (!autores || !Array.isArray(autores) || autores.length === 0) return 'N/A';
                const firstAuthor = autores[0].nombre || 'Autor Desconocido';
                const remainingCount = autores.length - 1;
                return `${firstAuthor}${remainingCount > 0 ? ` (+${remainingCount})` : ''}`;
            };
            const asignaturasStr = Array.isArray(ovc.asignaturas) ? ovc.asignaturas.join(', ') : '';
            const etiquetasStr = Array.isArray(ovc.etiquetas) ? ovc.etiquetas.join(', ') : '';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${ovc.titulo || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${displayAutores(ovc.autores)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${truncate(asignaturasStr, 30) || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ovc.semestre || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-gray-500 break-words">${truncate(etiquetasStr, 40) || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" class="text-indigo-600 hover:text-indigo-900 action-btn edit-ovc-btn" title="Editar" data-id="${ovc.id}">✏️</a>
                    <a href="#" class="text-blue-600 hover:text-blue-900 ml-4 action-btn view-ovc-btn" title="Ver" data-id="${ovc.id}">🔍</a>
                    <a href="#" class="text-red-600 hover:text-red-900 ml-4 action-btn delete-ovc-btn" title="Eliminar" data-id="${ovc.id}">🗑️</a>
                    <a href="#" class="text-green-600 hover:text-green-900 ml-4 action-btn forum-ovc-btn" title="Foro" data-id="${ovc.id}">💬</a>
                    <a href="#" class="text-purple-600 hover:text-purple-900 ml-4 action-btn evaluate-ovc-btn" title="Evaluar" data-id="${ovc.id}">✔️</a>
                    <a href="ver_promedios.html?ovcId=${ovc.id}" class="text-cyan-600 hover:text-cyan-900 ml-4 action-btn view-averages-btn" title="Ver Promedios" data-id="${ovc.id}">📈</a>
                    <a href="#" class="text-orange-600 hover:text-orange-900 ml-4 action-btn kanban-ovc-btn" title="Tablero Kanban" data-id="${ovc.id}" data-title="${ovc.titulo || ''}">📋</a>
               </td>
            `;
            ovcTableBody.appendChild(row);
        });
    }
}

// Función para mostrar el modal con el resumen del OVC
window.showSummaryModal = function (ovcId) { // Hacer la función global
    const ovcs = getOvcsFromStorage(); // Asegúrate que getOvcsFromStorage esté disponible
    const ovc = ovcs.find(ovc => ovc.id === Number(ovcId));
    const summaryModal = document.getElementById('ovc-summary-modal'); // Necesitamos obtener estos elementos
    const summaryModalContent = document.getElementById('ovc-summary-modal-content'); // o un ID similar para el contenido


    if (!summaryModal || !summaryModalContent) {
        console.error("Elementos del modal de resumen no encontrados.");
        return;
    }

    if (!ovc) {
        console.error(`Error: No se encontró el OVC con ID ${ovcId}`);
        return;
    }

    // Generar contenido del resumen
    summaryModalContent.innerHTML = `
<div class="p-4 bg-white rounded-lg shadow-lg space-y-4">
    <div>
        ${ovc.imagen && ovc.imagen.dataUrl ? `<img src="${ovc.imagen.dataUrl}" alt="Imagen de Portada" class="w-full h-auto rounded-md">` : '<span>No disponible</span>'}
    </div>
    <div>
        <strong>Título:</strong> ${ovc.titulo || 'N/A'}
    </div>
    <div>
        <strong>Descripción:</strong> ${ovc.descripcion || 'N/A'}
    </div>
    <div>
        <strong>Autores:</strong> ${ovc.autores.map(a => `${a.nombre} (${a.rol})`).join(', ') || 'N/A'}
    </div>
    <div>
        <strong>Semestre:</strong> ${ovc.semestre || 'N/A'}
    </div>
    <div>
        <strong>Etiquetas:</strong> ${ovc.etiquetas.join(', ') || 'N/A'}
    </div>
    <div>
        <strong>Relaciones:</strong> ${ovc.relaciones.map(r => `${r.ovc} (${r.etiqueta})`).join(', ') || 'N/A'}
    </div>
    <div>
        <strong>Enlaces Externos:</strong><br>
        ${ovc.enlaces.map(e => `<a href="${e.url}" target="_blank" class="text-blue-600 underline">${e.descripcion}</a>`).join('<br>') || 'N/A'}
    </div>
</div>
`;

    // Mostrar el modal con animación
    summaryModal.classList.remove('hidden');
    summaryModal.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => {
        summaryModal.classList.remove('opacity-0');
    }, 10);
}

// Función para ocultar el modal
window.hideSummaryModal = function() {
    const summaryModal = document.getElementById('ovc-summary-modal');
    if (summaryModal) {
        // Agregar clase para transición de opacidad
        summaryModal.classList.add('opacity-0');
        
        // Esperar a que termine la transición antes de ocultar completamente
        setTimeout(() => {
            summaryModal.classList.add('hidden');
        }, 300);
    }
};

// Configurar los botones del modal cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar la tabla de OVCs al cargar la página si estamos en la sección de listar
    const listarSection = document.getElementById('listar-section');
    if (listarSection && !listarSection.classList.contains('hidden')) {
        window.renderOvcTable();
    }
    // Botón de cerrar (X) en la esquina superior derecha
    const closeButton = document.getElementById('ovc-summary-modal-close');
    if (closeButton) {
        closeButton.innerHTML = '<span>\u274C</span>'; // Emoji X
        closeButton.addEventListener('click', window.hideSummaryModal);
    }
    
    // Botón de cerrar (Aceptar) en la parte inferior
    const okButton = document.getElementById('ovc-summary-modal-ok');
    if (okButton) {
        okButton.addEventListener('click', window.hideSummaryModal);
    }
    
    // Cerrar al hacer clic en el overlay
    const modalOverlay = document.getElementById('ovc-summary-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', window.hideSummaryModal);
    }

    // Manejador de eventos para el botón del foro
    document.addEventListener('click', function(event) {
        // Verificar si el clic fue en el botón del foro
        const forumBtn = event.target.closest('.forum-ovc-btn');
        if (forumBtn) {
            event.preventDefault();
            const ovcId = forumBtn.getAttribute('data-id');
            console.log('Clic en botón del foro para OVC ID:', ovcId);
            window.location.href = `foro.html?ovcId=${ovcId}`;
            return;
        }

        // Verificar si el clic fue en otro botón de acción
        const actionBtn = event.target.closest('.action-btn');
        if (!actionBtn) {
            return;
        }

        event.preventDefault();
        
        // Obtener las clases del botón
        const btnClasses = actionBtn.className.split(' ');
        
        // Buscar la clase que termina en '-btn' para determinar la acción
        const actionClass = btnClasses.find(cls => cls.endsWith('-btn'));
        const ovcId = actionBtn.getAttribute('data-id');
        const ovcTitle = actionBtn.getAttribute('data-title') || 'Sin título';

        console.log(`Acción detectada: ${actionClass}, OVC ID: ${ovcId}, Título: ${ovcTitle}`);

        // Manejar diferentes acciones
        switch(actionClass) {
            case 'kanban-ovc-btn':
                // Navegar a la sección de Kanban con el ID del OVC
                if (window.showSection) {
                    window.showSection('kanban', ovcId, ovcTitle);
                } else if (window.navigationShowSection) {
                    window.navigationShowSection('kanban', ovcId, ovcTitle);
                } else {
                    console.error('No se pudo encontrar la función para mostrar la sección Kanban');
                }
                break;
                
            case 'view-ovc-btn':
                // Mostrar el modal de resumen para el OVC
                window.showSummaryModal(ovcId);
                break;
                
            case 'edit-ovc-btn':
                // Redirigir a la página de edición con el ID del OVC
                window.location.href = `editar_ovc.html?id=${ovcId}`;
                break;
                
            case 'delete-ovc-btn':
                // Mostrar confirmación antes de eliminar
                if (confirm('¿Estás seguro de que deseas eliminar este OVC?')) {
                    // Lógica para eliminar el OVC
                    console.log(`Eliminar OVC con ID: ${ovcId}`);
                    // Aquí iría la lógica para eliminar el OVC
                }
                break;
                
            case 'evaluate-ovc-btn':
                // Navegar a la página de evaluación del OVC
                console.log('Navegando a la evaluación del OVC:', ovcId);
                window.location.href = `evaluar_ovc.html?ovcId=${ovcId}`;
                break;
                
            case 'view-averages-btn':
                // Navegar a la página de promedios del OVC
                window.location.href = `ver_promedios.html?ovcId=${ovcId}`;
                break;
                
            case 'forum-ovc-btn':
                // Navegar al foro del OVC
                console.log('Navegando al foro del OVC:', ovcId);
                // Usar la ruta relativa correcta
                window.location.href = `pages/foro.html?ovcId=${ovcId}`;
                break;
                
            default:
                console.warn(`Acción no reconocida: ${actionClass}`);
        }
    });
});
