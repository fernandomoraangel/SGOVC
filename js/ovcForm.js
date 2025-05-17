// js/ovcForm.js

// Variables globales para el estado de edición
let isEditMode = false;
let currentEditOvcId = null;
let ovcIdToDeleteConfirm = null;

// Exportar las variables globalmente
window.isEditMode = isEditMode;

// Referencias a elementos del DOM
let crearOvcForm;
let editOvcIdInput;
let formSubmitButtonText;
let imagenInput;
let imagenDataUrlInput;
let imagePreviewContainer;
let imagenFilenameSpan;
let archivoInput;
let archivoFilenameSpan;
let confirmationModal;
let confirmationModalText;
let modalOverlay;
let deleteConfirmModal;

// Inicializar referencias a elementos del DOM cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    crearOvcForm = document.getElementById('crear-ovc-form');
    editOvcIdInput = document.getElementById('edit-ovc-id');
    formSubmitButtonText = document.getElementById('form-submit-button-text');
    imagenInput = document.getElementById('ovc-imagen');
    imagenDataUrlInput = document.getElementById('imagen-data-url');
    imagePreviewContainer = document.getElementById('image-preview-container');
    imagenFilenameSpan = document.getElementById('imagen-filename');
    archivoInput = document.getElementById('ovc-archivo');
    archivoFilenameSpan = document.getElementById('archivo-filename');
    confirmationModal = document.getElementById('confirmation-modal');
    confirmationModalText = document.getElementById('confirmation-modal-text');
    modalOverlay = document.getElementById('modal-overlay');
    deleteConfirmModal = document.getElementById('delete-confirm-modal');
    
    console.log('DEBUG: Referencias a elementos del formulario inicializadas');
});

// Función para poblar el formulario para edición
function populateFormForEdit(ovcId) {
    console.log(`DEBUG: Iniciando populateFormForEdit para ID: ${ovcId}`);
    const ovcs = getOvcsFromStorage();
    const ovcData = ovcs.find(ovc => ovc.id === Number(ovcId));

    if (!ovcData) { /* ... error handling ... */
        console.error(`Error: No se encontró OVC con ID ${ovcId} para editar.`);
        resetFormToCreateMode();
        return;
    }

    isEditMode = true;
    currentEditOvcId = ovcData.id;
    editOvcIdInput.value = ovcData.id;
    formSubmitButtonText.textContent = 'Actualizar OVC';

    // Rellenar campos simples
    document.getElementById('ovc-titulo').value = ovcData.titulo || '';
    document.getElementById('ovc-descripcion').value = ovcData.descripcion || '';
    document.getElementById('ovc-semestre').value = ovcData.semestre || '2025-1';
    document.getElementById('ovc-licencia').value = ovcData.licencia || 'CC BY';

    // --- Manejo de Imagen Guardada (Base64) ---
    imagenInput.value = ''; // Limpiar input file
    imagenDataUrlInput.value = ''; // Limpiar DataURL temporal
    if (ovcData.imagen && ovcData.imagen.dataUrl && typeof ovcData.imagen.dataUrl === 'string' && ovcData.imagen.dataUrl.startsWith('data:image')) {
        console.log("DEBUG: Mostrando imagen guardada (Base64)");
        imagePreviewContainer.innerHTML = `<img src="${ovcData.imagen.dataUrl}" alt="Previsualización guardada">`;
        imagenFilenameSpan.textContent = `Archivo actual: ${ovcData.imagen.filename || 'Desconocido'}`;
        // Guardar nombre original en data attribute por si no se cambia la imagen
        imagenFilenameSpan.dataset.originalName = ovcData.imagen.filename || '';
    } else {
        console.log("DEBUG: No hay imagen guardada o dataUrl inválido.");
        imagePreviewContainer.innerHTML = '<span>No hay imagen guardada</span>';
        imagenFilenameSpan.textContent = '';
        imagenFilenameSpan.dataset.originalName = '';
    }

    // Archivo principal (solo nombre)
    archivoFilenameSpan.textContent = ovcData.archivo ? `Archivo actual: ${ovcData.archivo.replace('Archivo seleccionado: ', '')}` : '';
    archivoInput.value = '';

    // Rellenar checkboxes y listas dinámicas
    document.querySelectorAll('input[name="asignaturas[]"]').forEach(checkbox => {
        checkbox.checked = ovcData.asignaturas?.includes(checkbox.value) || false;
    });
    
    populateDynamicListField('autores-container', '.autor-item', ovcData.autores || [], (item, data) => {
        item.querySelector('input[name="autor_nombre[]"]').value = data.nombre || '';
        item.querySelector('input[name="autor_rol[]"]').value = data.rol || '';
        item.querySelector('input[name="autor_email[]"]').value = data.email || '';
        item.querySelector('input[name="autor_participacion[]"]').value = data.participacion || '';
    });
    
    populateDynamicListField('etiquetas-container', '.etiqueta-item', ovcData.etiquetas || [], (item, data) => {
        item.querySelector('input[name="etiquetas[]"]').value = data || '';
    });
    
    populateDynamicListField('enlaces-container', '.enlace-item', ovcData.enlaces || [], (item, data) => {
        item.querySelector('input[name="enlace_desc[]"]').value = data.descripcion || '';
        item.querySelector('input[name="enlace_url[]"]').value = data.url || '';
    });
    
    populateDynamicListField('relaciones-container', '.relacion-item', ovcData.relaciones || [], (item, data) => {
        item.querySelector('input[name="relacion_ovc[]"]').value = data.ovc || '';
        item.querySelector('input[name="relacion_etiqueta[]"]').value = data.etiqueta || '';
        item.querySelector('select[name="relacion_direccion[]"]').value = data.direccion || 'saliente';
    });

    console.log("DEBUG: Formulario poblado para edición.");
}

// Función para resetear el formulario a modo creación
function resetFormToCreateMode() {
    console.log("DEBUG: Reseteando formulario a modo creación.");
    
    isEditMode = false;
    currentEditOvcId = null;
    editOvcIdInput.value = '';
    formSubmitButtonText.textContent = 'Guardar OVC';
    crearOvcForm.reset();
    
    if (imagePreviewContainer) imagePreviewContainer.innerHTML = '<span>Previsualización</span>';
    if (imagenFilenameSpan) {
        imagenFilenameSpan.textContent = '';
        imagenFilenameSpan.dataset.originalName = ''; // Limpiar data attribute
    }
    if (archivoFilenameSpan) archivoFilenameSpan.textContent = '';
    if (imagenDataUrlInput) imagenDataUrlInput.value = ''; // Limpiar DataURL oculto
    
    // Limpiar listas dinámicas
    ['autores-container', 'etiquetas-container', 'enlaces-container', 'relaciones-container'].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const itemSelector = `#${containerId} > div`;
        container.querySelectorAll(`${itemSelector}:not(:first-child)`).forEach(el => el.remove());
        const firstItem = container.querySelector(itemSelector);
        if (firstItem) {
            firstItem.querySelectorAll('input, select, textarea').forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
                else input.value = '';
            });
        }
    });
    console.log("DEBUG: Formulario reseteado.");
}

// Función para mostrar el modal de confirmación
function showConfirmationModal(isUpdate = false) {
    
    if (confirmationModal) {
        confirmationModalText.textContent = isUpdate ? '¡El OVC se ha actualizado correctamente!' : '¡El OVC se ha guardado correctamente!';
        confirmationModal.classList.remove('hidden');
        modalOverlay.classList.add('opacity-100');
        confirmationModal.querySelector('.modal-content').classList.add('scale-100');
    }
}

// Función para ocultar el modal de confirmación
function hideConfirmationModal() {
    
    if (confirmationModal) {
        modalOverlay.classList.remove('opacity-100');
        confirmationModal.querySelector('.modal-content').classList.remove('scale-100');
        setTimeout(() => { confirmationModal.classList.add('hidden'); }, 300);
    }
}

// Función para mostrar el modal de confirmación de borrado
function showDeleteConfirmModal(ovcId) {
    
    ovcIdToDeleteConfirm = ovcId;
    if (deleteConfirmModal) {
        console.log(`DEBUG: Mostrando modal de confirmación de borrado para ID: ${ovcId}`);
        deleteConfirmModal.classList.remove('hidden');
    }
}

// Función para ocultar el modal de confirmación de borrado
function hideDeleteConfirmModal() {
    
    ovcIdToDeleteConfirm = null;
    if (deleteConfirmModal) {
        console.log("DEBUG: Ocultando modal de confirmación de borrado.");
        deleteConfirmModal.classList.add('hidden');
    }
}

// Exportar funciones globalmente
window.populateFormForEdit = populateFormForEdit;
window.resetFormToCreateMode = resetFormToCreateMode;
window.showConfirmationModal = showConfirmationModal;
window.hideConfirmationModal = hideConfirmationModal;
window.showDeleteConfirmModal = showDeleteConfirmModal;
window.hideDeleteConfirmModal = hideDeleteConfirmModal;

// Exportar variables globalmente
window.getIsEditMode = function() { return isEditMode; };
window.getCurrentEditOvcId = function() { return currentEditOvcId; };
window.getOvcIdToDeleteConfirm = function() { return ovcIdToDeleteConfirm; };
