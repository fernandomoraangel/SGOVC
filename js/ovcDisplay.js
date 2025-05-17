// js/ovcDisplay.js

// Asegurarse de que getOvcsFromStorage esté disponible
function renderOvcTable(ovcsToRender) {
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
                    <a href="foro.html?ovcId=${ovc.id}" class="text-green-600 hover:text-green-900 ml-4 action-btn forum-ovc-btn" title="Foro" data-id="${ovc.id}">💬</a>
                    <a href="evaluar_ovc.html?ovcId=${ovc.id}" class="text-purple-600 hover:text-purple-900 ml-4 action-btn evaluate-ovc-btn" title="Evaluar" data-id="${ovc.id}">✔️</a>
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
});
