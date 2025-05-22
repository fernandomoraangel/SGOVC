document.addEventListener('DOMContentLoaded', function () {
    // --- Selección de Elementos ---
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const contentArea = document.getElementById('content-area');
    const sectionTitle = document.getElementById('section-title');
    const ovcTableBody = document.getElementById('ovc-table-body');
    const goToCreateBtn = document.getElementById('go-to-create-btn');
    const crearOvcForm = document.getElementById('crear-ovc-form');
    const formSubmitButton = document.getElementById('form-submit-button');
    const formSubmitButtonText = document.getElementById('form-submit-button-text');
    const editOvcIdInput = document.getElementById('edit-ovc-id');
    const imagenInput = document.getElementById('ovc-imagen');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagenFilenameSpan = document.getElementById('imagen-filename');
    const imagenDataUrlInput = document.getElementById('imagen-data-url'); // Input oculto para DataURL
    const archivoInput = document.getElementById('ovc-archivo');
    const archivoFilenameSpan = document.getElementById('archivo-filename');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationModalText = document.getElementById('confirmation-modal-text');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseButtonX = document.getElementById('modal-close-button-x');
    const modalCloseButtonOk = document.getElementById('modal-close-button-ok');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const deleteModalOverlay = document.getElementById('delete-modal-overlay');
    const deleteConfirmButton = document.getElementById('delete-confirm-button');
    const deleteCancelButton = document.getElementById('delete-cancel-button');

    // Elementos para Búsqueda Avanzada
    const searchInput = document.getElementById('search-input'); // Ya existe, pero lo referenciamos aquí
    const advancedSearchTriggerBtn = document.getElementById('advanced-search-trigger');
    const advancedSearchModal = document.getElementById('advanced-search-modal');
    const advancedSearchModalOverlay = document.getElementById('advanced-search-modal-overlay');
    const advancedSearchModalCloseXBtn = document.getElementById('advanced-search-modal-close-x');
    const advancedSearchModalCloseCancelBtn = document.getElementById('advanced-search-modal-close-cancel');
    const applyAdvancedSearchBtn = document.getElementById('apply-advanced-search-button');
    const aiSearchPromptInput = document.getElementById('ai-search-prompt');
    const fuzzySearchCheckbox = document.getElementById('fuzzy-search-checkbox');
    const filterFieldCheckboxes = document.querySelectorAll('#advanced-search-modal input[name="filter-fields"]');


    const sections = {
        crear: document.getElementById('crear-section'),
        listar: document.getElementById('listar-section'),
        rizoma: document.getElementById('rizoma-section'),
        kanban: document.getElementById('kanban-section') // Added Kanban section
        // Rubric sections are handled differently (iframe)
    };
    const sectionTitles = {
        crear: '<span>➕</span> Crear Nuevo Objeto Virtual Creativo',
        listar: '<span>📋</span> Mis objetos virtuales creativos',
        rizoma: '<span>🌱</span> Visualización del Rizoma',
        kanban: '<span>📋</span> Tablero Kanban', // Added Kanban title
        // Titles for rubric pages will be set dynamically
    };
    // OVC_STORAGE_KEY se define en ovcStorage.js
    const GOOGLE_API_KEY = 'AIzaSyA5rWKqgBArqtg5aZiQiQFMRpZWcOsHwT0'; // TODO: Replace if needed & secure for production
    const AI_MODEL_NAME = 'gemini-1.5-flash-latest';
    const DEFAULT_SEARCH_FIELDS = [
        'titulo',
        'descripcion',
        'etiquetas',
        'autores.nombre',
        'autores.rol',
        'autores.correo',
        'asignaturas',
        'semestre',
        'licencia',
        'enlaces.descripcion',
        'enlaces.titulo',
        'enlaces.url',
        'archivo', // Contiene el nombre del archivo
        'relaciones.ovc',
        'relaciones.etiqueta',
        'palabrasClave',
        'fechaCreacion',
        'fechaActualizacion'
    ];

    // --- Estado de Edición ---
    // Las variables isEditMode, currentEditOvcId y ovcIdToDeleteConfirm se han movido a js/ovcForm.js

    // --- Navegación --- (La función showSection se movió a js/navigation.js)
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            const sectionId = this.getAttribute('data-section');
            const isSubmenuLink = this.classList.contains('submenu-link');
            const targetUrl = this.getAttribute('href');

            if (sectionId) {
                // Handle regular section toggle
                event.preventDefault();
                window.showSection(sectionId);
                // Ensure submenu is closed if a main section is clicked
                // Check if rubricasSubmenu and rubricasToggle are defined before using them
                const rubricasSubmenu = document.getElementById('rubricas-submenu');
                const rubricasToggle = document.getElementById('rubricas-toggle');
                if (rubricasSubmenu && rubricasToggle && !this.closest('.submenu') && rubricasSubmenu.classList.contains('open')) {
                    rubricasToggle.click(); // Simulate click to close
                }
            } else if (isSubmenuLink && targetUrl && targetUrl !== '#') {
                // Handle rubric submenu link click (load in iframe)
                event.preventDefault();
                if (typeof loadPageInContentArea === 'function') {
                    loadPageInContentArea(targetUrl, this);
                } else {
                    console.error("loadPageInContentArea is not defined. Ensure navigation.js is loaded.");
                }
            }
            // Allow default behavior for other links (like the main Rubricas toggle)
        });
    });
    if (goToCreateBtn) { 
        goToCreateBtn.addEventListener('click', () => {
            if (typeof window.resetFormToCreateMode === 'function') {
                window.resetFormToCreateMode();
            } else {
                console.error("resetFormToCreateMode is not defined. Ensure ovcForm.js is loaded.");
            }
            if (typeof window.showSection === 'function') {
                window.showSection('crear');
            } else {
                console.error("showSection is not defined. Ensure navigation.js or inlineShowSection.js is loaded.");
            }
        });
    }

    // --- LocalStorage y Renderizado Tabla ---
    // renderOvcTable is expected to be in ovcDisplay.js and attached to window.

    // --- Funcionalidad Formulario Crear/Editar OVC ---

    // Previsualización de Imagen (con Base64)
    if (imagenInput && imagePreviewContainer && imagenFilenameSpan && imagenDataUrlInput) {
        imagenInput.addEventListener('change', function (event) {
            console.log("DEBUG: Evento 'change' detectado en input de imagen.");
            const file = event.target.files[0];
            imagenDataUrlInput.value = ''; // Limpiar DataURL anterior
            imagenFilenameSpan.dataset.originalName = ''; // Limpiar nombre anterior
            const isEditMode = window.getIsEditMode ? window.getIsEditMode() : false;


            if (file && file.type.startsWith('image/')) {
                imagenFilenameSpan.textContent = `Procesando: ${file.name}...`; // Mensaje mientras carga
                imagePreviewContainer.innerHTML = '<span>Cargando...</span>';
                const reader = new FileReader();
                reader.onload = function (e) {
                    const dataUrl = e.target.result;
                    console.log("DEBUG: FileReader cargó la imagen como DataURL (tamaño aprox:", Math.round(dataUrl.length / 1024), "KB)");
                    if (dataUrl.length > 5 * 1024 * 1024) { // Advertencia si > 5MB (aproximado)
                        console.warn("ADVERTENCIA: La imagen es muy grande, podría llenar localStorage.");
                        alert("Advertencia: La imagen seleccionada es muy grande y podría causar problemas de almacenamiento.");
                    }
                    imagePreviewContainer.innerHTML = `<img src="${dataUrl}" alt="Previsualización">`;
                    imagenDataUrlInput.value = dataUrl; // Guardar DataURL temporalmente
                    imagenFilenameSpan.dataset.originalName = file.name; // Guardar nombre original
                    imagenFilenameSpan.textContent = `Nuevo archivo: ${file.name}`; // Actualizar span
                }
                reader.onerror = function (e) { 
                    console.error("DEBUG: Error de FileReader:", e);
                    imagenFilenameSpan.textContent = 'Error al leer archivo';
                    imagePreviewContainer.innerHTML = '<span>Error</span>';
                }
                reader.readAsDataURL(file);
            } else if (file) { 
                console.warn("DEBUG: Tipo de archivo no soportado:", file.type);
                imagenFilenameSpan.textContent = `Archivo ${file.name} no es una imagen.`;
                imagePreviewContainer.innerHTML = '<span>No es imagen</span>';
                imagenInput.value = '';
            } else { 
                console.log("DEBUG: No se seleccionó archivo.");
                imagenFilenameSpan.textContent = isEditMode ? imagenFilenameSpan.textContent : '';
                imagePreviewContainer.innerHTML = isEditMode ? imagePreviewContainer.innerHTML : '<span>Previsualización</span>';
            }
        });
    } else { console.warn("DEBUG: Faltan elementos para previsualización."); }

    // Nombre archivo principal
    if (archivoInput && archivoFilenameSpan) { 
        archivoInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const isEditMode = window.getIsEditMode ? window.getIsEditMode() : false;
            if (file) { archivoFilenameSpan.textContent = `Archivo seleccionado: ${file.name}`; }
            else { if (!isEditMode) { archivoFilenameSpan.textContent = ''; } }
        });
    }

    // Listas dinámicas (setupDynamicList is expected from utils.js)
    if (typeof setupDynamicList === 'function') {
        setupDynamicList('autores-container', 'add-autor', '.autor-item');
        setupDynamicList('etiquetas-container', 'add-etiqueta', '.etiqueta-item');
        setupDynamicList('enlaces-container', 'add-enlace', '.enlace-item');
        setupDynamicList('relaciones-container', 'add-relacion', '.relacion-item');
    } else {
        console.error("setupDynamicList is not defined. Ensure utils.js is loaded.");
    }
    

    // --- Lógica de Edición ---
    // populateFormForEdit is expected to be in ovcForm.js and attached to window.

    // --- Guardado (Crear y Actualizar) y Modal Confirmación ---
    // showConfirmationModal and hideConfirmationModal are expected to be in ovcForm.js and attached to window.

    // Submit del formulario (Maneja Crear y Actualizar con Base64)
    if (crearOvcForm) {
        crearOvcForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const isEditMode = window.getIsEditMode ? window.getIsEditMode() : false;
            const currentEditOvcId = window.getCurrentEditOvcId ? window.getCurrentEditOvcId() : null;
            console.log(`DEBUG: Formulario enviado. Modo Edición: ${isEditMode}`);

            const ovcs = window.getOvcsFromStorage ? window.getOvcsFromStorage() : [];
            let originalOvc = null;
            if (isEditMode && currentEditOvcId) {
                originalOvc = ovcs.find(ovc => ovc.id === Number(currentEditOvcId));
            }

            // --- Recolectar Imagen (Base64) ---
            let imagenData = null;
            const newDataUrl = imagenDataUrlInput.value; 
            const newFilename = imagenFilenameSpan.dataset.originalName; 

            if (newDataUrl && newFilename) {
                imagenData = { dataUrl: newDataUrl, filename: newFilename };
                console.log("DEBUG: Usando nueva imagen Base64.");
            } else if (isEditMode && originalOvc && originalOvc.imagen) {
                imagenData = originalOvc.imagen;
                console.log("DEBUG: Conservando imagen Base64 original.");
            } else {
                console.log("DEBUG: No hay imagen nueva ni original.");
            }

            // 1. Recolectar datos
            const formData = {
                id: isEditMode ? Number(currentEditOvcId) : Date.now(),
                titulo: document.getElementById('ovc-titulo')?.value || '',
                descripcion: document.getElementById('ovc-descripcion')?.value || '',
                imagen: imagenData, 
                autores: [],
                etiquetas: [],
                asignaturas: [],
                semestre: document.getElementById('ovc-semestre')?.value || '',
                licencia: document.getElementById('ovc-licencia')?.value || '',
                enlaces: [],
                archivo: archivoInput.files.length > 0 ? `Archivo seleccionado: ${archivoInput.files[0].name}` : (originalOvc ? originalOvc.archivo : ''),
                relaciones: [],
                fechaCreacion: isEditMode && originalOvc ? originalOvc.fechaCreacion : new Date().toISOString()
            };
            
            document.querySelectorAll('#autores-container .autor-item').forEach(item => { 
                const nombre = item.querySelector('input[name="autor_nombre[]"]')?.value || '';
                if (nombre.trim() !== '') {
                    formData.autores.push({
                        nombre: nombre,
                        rol: item.querySelector('input[name="autor_rol[]"]')?.value || '',
                        email: item.querySelector('input[name="autor_email[]"]')?.value || '',
                        participacion: item.querySelector('input[name="autor_participacion[]"]')?.value || ''
                    });
                }
            });
            document.querySelectorAll('#etiquetas-container .etiqueta-item input').forEach(input => { 
                if (input.value.trim()) formData.etiquetas.push(input.value.trim());
            });
            document.querySelectorAll('input[name="asignaturas[]"]:checked').forEach(checkbox => { 
                formData.asignaturas.push(checkbox.value);
            });
            document.querySelectorAll('#enlaces-container .enlace-item').forEach(item => { 
                const desc = item.querySelector('input[name="enlace_desc[]"]')?.value || '';
                const url = item.querySelector('input[name="enlace_url[]"]')?.value || '';
                if (desc.trim() && url.trim()) { formData.enlaces.push({ descripcion: desc, url: url }); }
            });
            document.querySelectorAll('#relaciones-container .relacion-item').forEach(item => { 
                const ovcRel = item.querySelector('input[name="relacion_ovc[]"]')?.value || '';
                const etiquetaRel = item.querySelector('input[name="relacion_etiqueta[]"]')?.value || '';
                const direccionRel = item.querySelector('select[name="relacion_direccion[]"]')?.value || '';
                if (ovcRel.trim() && etiquetaRel.trim()) { formData.relaciones.push({ ovc: ovcRel, etiqueta: etiquetaRel, direccion: direccionRel }); }
            });

            console.log("DEBUG: Datos recolectados finales:", formData);

            // 2. Guardar o Actualizar en localStorage
            if (isEditMode) {
                const index = ovcs.findIndex(ovc => ovc.id === formData.id);
                if (index !== -1) {
                    console.log(`DEBUG: Actualizando OVC en índice ${index}`);
                    ovcs[index] = formData;
                    if (window.saveOvcsToStorage) window.saveOvcsToStorage(ovcs);
                    if (window.showConfirmationModal) window.showConfirmationModal(true);
                    if (window.resetFormToCreateMode) window.resetFormToCreateMode();
                    if (window.showSection) window.showSection('listar');
                } else { 
                    console.error(`Error: No se encontró OVC con ID ${formData.id} para actualizar.`);
                    alert("Error al actualizar el OVC. No se encontró el original.");
                    if (window.resetFormToCreateMode) window.resetFormToCreateMode();
                }
            } else {
                console.log("DEBUG: Creando nuevo OVC.");
                ovcs.push(formData);
                if (window.saveOvcsToStorage) window.saveOvcsToStorage(ovcs);
                if (window.showConfirmationModal) window.showConfirmationModal(false);
                if (window.resetFormToCreateMode) window.resetFormToCreateMode();
            }
        });
    }

    // Cerrar modal de confirmación
    if (modalOverlay && window.hideConfirmationModal) modalOverlay.addEventListener('click', window.hideConfirmationModal);
    if (modalCloseButtonX && window.hideConfirmationModal) modalCloseButtonX.addEventListener('click', window.hideConfirmationModal);
    if (modalCloseButtonOk && window.hideConfirmationModal) modalCloseButtonOk.addEventListener('click', window.hideConfirmationModal);

    // --- Funcionalidad de Borrado (con Modal) ---
    // showDeleteConfirmModal and hideDeleteConfirmModal are expected to be in ovcForm.js and attached to window.

    // Listener para botones dentro del modal de borrado
    if (deleteCancelButton && window.hideDeleteConfirmModal) deleteCancelButton.addEventListener('click', window.hideDeleteConfirmModal);
    if (deleteModalOverlay && window.hideDeleteConfirmModal) deleteModalOverlay.addEventListener('click', window.hideDeleteConfirmModal);

    if (deleteConfirmButton) { 
        deleteConfirmButton.addEventListener('click', () => {
            const ovcIdToDeleteConfirm = window.getOvcIdToDeleteConfirm ? window.getOvcIdToDeleteConfirm() : null;
            if (ovcIdToDeleteConfirm) {
                console.log(`DEBUG: Confirmado borrado para ID: ${ovcIdToDeleteConfirm}`);
                const ovcs = window.getOvcsFromStorage ? window.getOvcsFromStorage() : [];
                const updatedOvcs = ovcs.filter(ovc => ovc.id !== Number(ovcIdToDeleteConfirm));
                if (ovcs.length === updatedOvcs.length) {
                    console.warn(`DEBUG: No se encontró OVC con ID ${ovcIdToDeleteConfirm} para borrar.`);
                } else {
                    if (window.saveOvcsToStorage) window.saveOvcsToStorage(updatedOvcs);
                    console.log("DEBUG: OVC eliminado. Renderizando tabla de nuevo...");
                    if (window.renderOvcTable) window.renderOvcTable();
                }
            } else { console.error("Error: No se encontró ID para borrar al confirmar."); }
            if (window.hideDeleteConfirmModal) window.hideDeleteConfirmModal();
        });
    }

    // Listener para clics en la tabla (Editar y Borrar)
    if (ovcTableBody) { 
        ovcTableBody.addEventListener('click', function (event) {
            const editButton = event.target.closest('.edit-ovc-btn');
            const deleteButton = event.target.closest('.delete-ovc-btn');
            const kanbanButton = event.target.closest('.kanban-ovc-btn');

            if (editButton) {
                event.preventDefault();
                const ovcIdToEdit = editButton.getAttribute('data-id');
                console.log(`DEBUG: Clic en Editar para ID: ${ovcIdToEdit}`);
                if (ovcIdToEdit) {
                    if (window.populateFormForEdit) window.populateFormForEdit(ovcIdToEdit);
                    if (window.showSection) window.showSection('crear');
                }
            } else if (deleteButton) {
                event.preventDefault();
                const ovcIdToDelete = deleteButton.getAttribute('data-id');
                console.log(`DEBUG: Clic en Borrar para ID: ${ovcIdToDelete}`);
                if (ovcIdToDelete) {
                    if (window.showDeleteConfirmModal) window.showDeleteConfirmModal(ovcIdToDelete);
                }
            } else if (kanbanButton) { 
                event.preventDefault();
                const ovcIdForKanban = kanbanButton.getAttribute('data-id');
                const ovcTitleForKanban = kanbanButton.getAttribute('data-title');
                console.log(`DEBUG: Clic en Kanban para ID: ${ovcIdForKanban}, Título: ${ovcTitleForKanban}`);
                if (ovcIdForKanban && ovcTitleForKanban) {
                    if (window.showSection) window.showSection('kanban', ovcIdForKanban, ovcTitleForKanban);
                } else {
                    console.error("Error: Missing data-id or data-title on Kanban button.");
                }
            }
        });
    } else { console.error("Error: Elemento #ovc-table-body no encontrado."); }


    // --- Inicialización ---
    let loadedFromUrlParams = false; 
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('initialTab');
    const editIndex = urlParams.get('editIndex');

    if (initialTab === 'designer') {
        const designerLink = document.querySelector('a.sidebar-link[href="disenar_rubrica.html"]');
        if (designerLink) {
            let targetUrl = 'disenar_rubrica.html';
            if (editIndex !== null && !isNaN(parseInt(editIndex))) {
                targetUrl += `?editIndex=${encodeURIComponent(editIndex)}`;
                console.log(`DEBUG: URL Params indicate loading designer with editIndex: ${editIndex}`);
            } else {
                console.log("DEBUG: URL Params indicate loading designer (no editIndex).");
            }
            if (typeof loadPageInContentArea === 'function') {
                loadPageInContentArea(targetUrl, designerLink);
            } else {
                console.error("loadPageInContentArea is not defined. Ensure navigation.js is loaded.");
            }
            loadedFromUrlParams = true; 
        } else {
            console.warn("DEBUG: initialTab=designer specified, but designer link not found.");
        }
    }

    if (!loadedFromUrlParams) {
        console.log("DEBUG: No relevant URL parameters found or processed, loading default section.");
        const initialActiveLink = document.querySelector('.sidebar-link.active[data-section]'); 
        if (initialActiveLink && window.showSection) {
            window.showSection(initialActiveLink.getAttribute('data-section'));
        } else if (window.showSection) {
            window.showSection('listar'); 
        } else {
            console.error("showSection is not defined. Cannot load default section.");
        }
    }

    if (window.history.replaceState) {
        const cleanUrl = window.location.pathname; 
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        console.log("DEBUG: Cleared URL parameters.");
    }
    console.log("DEBUG: Script inicializado.");

    // --- Lógica para Modal de Búsqueda Avanzada ---
    // showAdvancedSearchModal and hideAdvancedSearchModal are defined in the HTML.
    // For modularity, these could also be moved to a separate file or an object.
    // However, the task is to copy the existing block.

    if (advancedSearchTriggerBtn) {
        advancedSearchTriggerBtn.addEventListener('click', showAdvancedSearchModal);
    }
    if (advancedSearchModalOverlay) {
        advancedSearchModalOverlay.addEventListener('click', hideAdvancedSearchModal);
    }
    if (advancedSearchModalCloseXBtn) {
        advancedSearchModalCloseXBtn.addEventListener('click', hideAdvancedSearchModal);
    }
    if (advancedSearchModalCloseCancelBtn) {
        advancedSearchModalCloseCancelBtn.addEventListener('click', hideAdvancedSearchModal);
    }

    if (applyAdvancedSearchBtn) {
        applyAdvancedSearchBtn.addEventListener('click', function() {
            console.log("Aplicar búsqueda avanzada clickeado");
            const aiPrompt = aiSearchPromptInput.value.trim();
            const useFuzzy = fuzzySearchCheckbox.checked;
            const selectedFields = Array.from(filterFieldCheckboxes)
                                        .filter(cb => cb.checked)
                                        .map(cb => cb.value);

            console.log("AI Prompt:", aiPrompt);
            console.log("Usar Fuzzy:", useFuzzy);
            console.log("Campos seleccionados:", selectedFields);
            
            performFullSearch({ query: searchInput.value, advanced: { aiPrompt, useFuzzy, fields: selectedFields } });
            hideAdvancedSearchModal();
        });
    }

    const DEBUG_SIMPLE_SEARCH = true; 

    function performSimpleSearch_DEBUG(query, ovcs, fieldsToSearch = DEFAULT_SEARCH_FIELDS) {
        console.log(`[SS_DEBUG_ENTRY] Called with query: "${query}"`); 
        if (!query) return ovcs;
        const lowerCaseQuery = query.toLowerCase();
        if (DEBUG_SIMPLE_SEARCH) console.log(`[SS_DEBUG] Effective Query: "${lowerCaseQuery}", OVCs count: ${ovcs.length}, Fields:`, fieldsToSearch);

        return ovcs.filter(ovc => {
            if (DEBUG_SIMPLE_SEARCH) console.log(`[SS_DEBUG] --- Checking OVC ID: ${ovc.id} (Titulo: ${ovc.titulo}) ---`);
            
            return fieldsToSearch.some(fieldPath => {
                if (DEBUG_SIMPLE_SEARCH) console.log(`[SS_DEBUG]   FieldPath: ${fieldPath}`);
                const parts = fieldPath.split('.');
                let valueToTest; 

                if (parts.length === 1) { 
                    const fieldName = parts[0];
                    if (ovc.hasOwnProperty(fieldName)) {
                        valueToTest = ovc[fieldName];
                    }
                } else if (parts.length === 2) { 
                    const arrayName = parts[0];
                    const propertyName = parts[1];
                    if (ovc.hasOwnProperty(arrayName) && Array.isArray(ovc[arrayName])) {
                        const baseArray = ovc[arrayName];
                        valueToTest = baseArray.map(item => {
                            if (item && typeof item === 'object' && item.hasOwnProperty(propertyName)) {
                                return item[propertyName];
                            }
                            return undefined;
                        }).filter(val => val !== undefined && val !== null);
                    }
                }

                if (valueToTest === undefined || valueToTest === null || (Array.isArray(valueToTest) && valueToTest.length === 0) ) {
                    if (DEBUG_SIMPLE_SEARCH) console.log(`[SS_DEBUG]     No value or empty array for "${fieldPath}"`);
                    return false;
                }
                
                let matchThisField = false;
                const valuesArray = Array.isArray(valueToTest) ? valueToTest : [valueToTest];

                matchThisField = valuesArray.some(val => {
                    if (val === null || val === undefined) return false;
                    return val.toString().toLowerCase().includes(lowerCaseQuery);
                });
                
                if (DEBUG_SIMPLE_SEARCH) {
                    if (matchThisField) console.log(`[SS_DEBUG]     MATCH in "${fieldPath}" for query "${lowerCaseQuery}" (Values tested: ${JSON.stringify(valuesArray)})`);
                }
                return matchThisField;
            });
        });
    }
    
    function performSimpleSearch(query, ovcs, fieldsToSearch = DEFAULT_SEARCH_FIELDS) {
        if (!query) return ovcs;
        const lowerCaseQuery = query.toLowerCase();

        return ovcs.filter(ovc => {
            return fieldsToSearch.some(fieldPath => {
                const parts = fieldPath.split('.'); 
                let currentContext = ovc;

                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];
                    if (currentContext && typeof currentContext === 'object' && currentContext.hasOwnProperty(part)) {
                        currentContext = currentContext[part];
                    } else {
                        return false; 
                    }
                }

                if (currentContext === null || currentContext === undefined) return false;

                const finalPropertyKey = parts[parts.length - 1];

                if (Array.isArray(currentContext)) {
                    return currentContext.some(item => {
                        if (item && typeof item === 'object' && item.hasOwnProperty(finalPropertyKey)) {
                            const val = item[finalPropertyKey];
                            return val && val.toString().toLowerCase().includes(lowerCaseQuery);
                        } else if (typeof item === 'string' && parts.length === 1 && finalPropertyKey === fieldPath) {
                            return item.toString().toLowerCase().includes(lowerCaseQuery);
                        }
                        return false;
                    });
                }
                else if (typeof currentContext === 'object' && currentContext.hasOwnProperty(finalPropertyKey)) {
                    const val = currentContext[finalPropertyKey];
                    if (Array.isArray(val)) {
                        return val.some(s => s && s.toString().toLowerCase().includes(lowerCaseQuery));
                    }
                    return val && val.toString().toLowerCase().includes(lowerCaseQuery);
                }
                return false;
            });
        });
    }

    function performBooleanSearch(queryString, ovcs, fieldsToSearch = DEFAULT_SEARCH_FIELDS) {
        console.log("Boolean search for:", queryString, "in fields:", fieldsToSearch);
        let results = ovcs;
        const originalQuery = queryString;

        const notSplitRegex = /\s+NOT\s+/i;
        const notParts = originalQuery.split(notSplitRegex);
        let currentResults = ovcs; 

        if (notParts.length > 0 && notParts[0].trim() !== "") {
            currentResults = processAndOr(notParts[0].trim(), ovcs, fieldsToSearch);
        } else if (originalQuery.toUpperCase().startsWith("NOT ")) {
            if (notParts.length > 1 && notParts[1].trim() !== "") {
                const termToExclude = notParts[1].trim().toLowerCase();
                currentResults = ovcs.filter(ovc => !performSimpleSearch(termToExclude, [ovc], fieldsToSearch).length);
                for (let i = 2; i < notParts.length; i++) {
                    const termToExcludeFurther = notParts[i].trim().toLowerCase();
                    if (termToExcludeFurther) {
                        currentResults = currentResults.filter(ovc => !performSimpleSearch_DEBUG(termToExcludeFurther, [ovc], fieldsToSearch).length);
                    }
                }
                return currentResults;
            } else { 
                return ovcs; 
            }
        }

        for (let i = 1; i < notParts.length; i++) {
            const termToExcludeString = notParts[i].trim();
            if (termToExcludeString) {
                const exclusionTerms = termToExcludeString.toLowerCase().split(/\s+/).filter(t => t); 
                exclusionTerms.forEach(exTerm => {
                    if (exTerm) {
                        currentResults = currentResults.filter(ovc => !performSimpleSearch(exTerm, [ovc], fieldsToSearch).length);
                    }
                });
            }
        }
        return currentResults;
    }

    function processAndOr(subQuery, ovcs, fieldsToSearch) {
        let currentResults = ovcs;
        const andSplitRegex = /\s+AND\s+/i;

        if (subQuery.toUpperCase().includes(" AND ")) {
            const andTerms = subQuery.split(andSplitRegex);
            if (andTerms.length > 0 && andTerms[0].trim() !== "") {
                currentResults = performSimpleSearch_DEBUG(andTerms[0].trim(), ovcs, fieldsToSearch);
            } else if (andTerms.length > 1 && andTerms[0].trim() === "") {
                currentResults = performSimpleSearch_DEBUG(andTerms[1].trim(), ovcs, fieldsToSearch);
                andTerms.splice(0,1); 
            }

            for (let i = 1; i < andTerms.length; i++) {
                const term = andTerms[i].trim();
                if (term === "") continue;
                const termResults = performSimpleSearch_DEBUG(term, ovcs, fieldsToSearch);
                currentResults = currentResults.filter(ovc => termResults.includes(ovc));
            }
            return currentResults;

        } else if (subQuery.toUpperCase().includes(" OR ")) {
            const orSplitRegex = /\s+OR\s+/i;
            const orTerms = subQuery.split(orSplitRegex);
            const resultSet = new Set();
            orTerms.forEach(term => {
                const termToSearch = term.trim();
                if (termToSearch) {
                    performSimpleSearch_DEBUG(termToSearch, ovcs, fieldsToSearch).forEach(ovc => resultSet.add(ovc));
                }
            });
            return Array.from(resultSet);
        }
        return performSimpleSearch_DEBUG(subQuery, ovcs, fieldsToSearch);
    }


    async function searchWithAI(aiPrompt, ovcsToSearchIn, fieldsToSearch = DEFAULT_SEARCH_FIELDS) {
        if (!aiPrompt) return ovcsToSearchIn;
        if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_API_KEY_HERE' || GOOGLE_API_KEY.includes("YOUR_API_KEY") || GOOGLE_API_KEY.length < 30) {
            console.warn("Búsqueda con IA deshabilitada: GOOGLE_API_KEY no está configurada correctamente, es un placeholder evidente o es demasiado corta.");
            return ovcsToSearchIn;
        }

        console.log("Iniciando búsqueda con IA para prompt:", aiPrompt);
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL_NAME}:generateContent?key=${GOOGLE_API_KEY}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: `Dada la siguiente consulta de un usuario que busca Objetos Virtuales Creativos (OVCs): "${aiPrompt}". Extrae y devuelve una lista concisa de 3 a 5 palabras clave o conceptos de búsqueda principales y relevantes, separados por comas. Estas palabras clave se usarán para filtrar una base de datos de OVCs. Prioriza los términos más distintivos y útiles para la búsqueda. Si la consulta es muy vaga o no parece una búsqueda, devuelve una lista vacía o la palabra 'N/A'.`
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 60
            }
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Error en API de Gemini: ${response.status} ${response.statusText}`, errorBody);
                return ovcsToSearchIn; 
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                const rawKeywordsText = data.candidates[0].content.parts[0].text;
                console.log("Texto de palabras clave de IA:", rawKeywordsText);
                if (rawKeywordsText.trim().toUpperCase() === 'N/A' || rawKeywordsText.trim() === '') {
                    console.log("IA no devolvió palabras clave útiles.");
                    return ovcsToSearchIn; 
                }
                const keywords = rawKeywordsText.split(',').map(kw => kw.trim().toLowerCase()).filter(kw => kw.length > 1);
                
                if (keywords.length === 0) {
                     console.log("No se extrajeron palabras clave válidas de la respuesta de la IA.");
                     return ovcsToSearchIn;
                }
                console.log("Palabras clave procesadas de IA:", keywords);

                const matchedOvcs = ovcsToSearchIn.filter(ovc => {
                    return keywords.some(keyword => {
                        if (fieldsToSearch.includes('titulo') && ovc.titulo && ovc.titulo.toLowerCase().includes(keyword)) return true;
                        if (fieldsToSearch.includes('descripcion') && ovc.descripcion && ovc.descripcion.toLowerCase().includes(keyword)) return true;
                        if (fieldsToSearch.includes('etiquetas') && ovc.etiquetas && ovc.etiquetas.some(et => et.toLowerCase().includes(keyword))) return true;
                        return false;
                    });
                });
                console.log("OVCs coincidentes con IA:", matchedOvcs.length);
                return matchedOvcs;
            } else {
                console.warn("Respuesta de IA no contenía palabras clave esperadas:", data);
                return ovcsToSearchIn;
            }
        } catch (error) {
            console.error("Error durante la llamada fetch a la API de Gemini:", error);
            return ovcsToSearchIn; 
        }
    }

    async function performFullSearch(criteria) { 
        console.log("Performing full search with criteria:", criteria);
        let allOvcs = window.getOvcsFromStorage ? window.getOvcsFromStorage() : [];
        let filteredOvcs = allOvcs;
        const rawMainQuery = criteria.query ? criteria.query.trim() : ""; 

        let fieldsForMainQuery = DEFAULT_SEARCH_FIELDS; 

        if (criteria.advanced) {
            console.log("Criterios avanzados recibidos:", criteria.advanced);
            const adv = criteria.advanced;

            if (adv.fields && adv.fields.length > 0) {
                fieldsForMainQuery = adv.fields;
                console.log("Buscando query principal solo en campos:", fieldsForMainQuery);
            }
            
            if (adv.aiPrompt) {
                console.log("Aplicando búsqueda con AI Prompt:", adv.aiPrompt);
                filteredOvcs = await searchWithAI(adv.aiPrompt, filteredOvcs, fieldsForMainQuery);
            }

            if (rawMainQuery) {
                if (adv.useFuzzy && typeof Fuse === 'function') { // Ensure Fuse is available
                    console.log("Aplicando Fuzzy Search para query principal:", rawMainQuery, "en campos:", fieldsForMainQuery);
                    // Note: performFuzzySearch was not fully defined in the provided HTML, this is a placeholder
                    // Assuming performFuzzySearch would be similar to simple/boolean but use Fuse.js
                    // For now, let's fall back to simple search if performFuzzySearch isn't robustly defined.
                     console.warn("performFuzzySearch logic might be incomplete, using simple search as fallback for now if Fuse not fully integrated.");
                     const fuse = new Fuse(filteredOvcs, { keys: fieldsForMainQuery, includeScore: true, threshold: 0.4 });
                     filteredOvcs = fuse.search(rawMainQuery).map(result => result.item);

                } else if (rawMainQuery.includes(" AND ") || rawMainQuery.includes(" OR ") || rawMainQuery.toUpperCase().includes(" NOT ")) {
                    console.log("Detectada query booleana en input principal:", rawMainQuery, "en campos:", fieldsForMainQuery);
                    filteredOvcs = performBooleanSearch(rawMainQuery, filteredOvcs, fieldsForMainQuery);
                } else {
                    console.log("Aplicando búsqueda simple para query principal:", rawMainQuery, "en campos:", fieldsForMainQuery);
                    filteredOvcs = performSimpleSearch(rawMainQuery, filteredOvcs, fieldsForMainQuery);
                }
            } else if (adv.useFuzzy) {
                console.log("Fuzzy search activado en modal pero no hay query principal en el input.");
            }

        } else if (rawMainQuery) {
            if (rawMainQuery.includes(" AND ") || rawMainQuery.includes(" OR ") || rawMainQuery.toUpperCase().includes(" NOT ")) {
                console.log("Detectada query booleana en input principal.");
                filteredOvcs = performBooleanSearch(rawMainQuery, filteredOvcs, fieldsForMainQuery); 
            } else {
                filteredOvcs = performSimpleSearch_DEBUG(rawMainQuery, filteredOvcs, fieldsForMainQuery);
            }
        } else {
            filteredOvcs = allOvcs;
        }
        
        if (window.renderOvcTable) window.renderOvcTable(filteredOvcs);
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = searchInput.value; 
            performFullSearch({ query: query });
        });
    }

    if (applyAdvancedSearchBtn) { // This listener was defined earlier, ensure it's not duplicated or handle correctly
        // The earlier definition of applyAdvancedSearchBtn's listener is fine and calls performFullSearch.
        // This check is more for awareness during refactoring.
    }

    // Auto completado
    document.addEventListener('DOMContentLoaded', function () { // This is a nested DOMContentLoaded, which is fine.
        function setupAutocomplete(input) {
            input.addEventListener('input', function () {
                const query = input.value.toLowerCase();
                const ovcs = window.getOvcsFromStorage ? window.getOvcsFromStorage() : [];
                const match = ovcs.find(ovc => ovc.titulo && ovc.titulo.toLowerCase().startsWith(query));

                if (match) {
                    input.value = match.titulo; 
                }
            });
        }

        function initializeAutocomplete() {
            const relacionOvcInputs = document.querySelectorAll('input[name="relacion_ovc[]"]');
            relacionOvcInputs.forEach(input => {
                if (!input.dataset.autocompleteInitialized) {
                    setupAutocomplete(input);
                    input.dataset.autocompleteInitialized = true; 
                }
            });
        }
        initializeAutocomplete();

        const relacionesContainer = document.getElementById('relaciones-container');
        if (relacionesContainer) { // Check if container exists
            const observer = new MutationObserver(() => {
                initializeAutocomplete(); 
            });
            observer.observe(relacionesContainer, { childList: true, subtree: true });
        }
    });


    // Combined Escape Key Listener
    window.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            // OVC Modals
            if (confirmationModal && !confirmationModal.classList.contains('hidden') && window.hideConfirmationModal) window.hideConfirmationModal();
            else if (deleteConfirmModal && !deleteConfirmModal.classList.contains('hidden') && window.hideDeleteConfirmModal) window.hideDeleteConfirmModal();
            // The summaryModal hide function (hideSummaryModal) seems to be defined locally in the first DOMContentLoaded.
            // It should be checked if summaryModal is defined and visible.
            // else if (summaryModal && !summaryModal.classList.contains('hidden') && typeof hideSummaryModal === 'function') hideSummaryModal();


            // Kanban Modals / States
            // Note: KanbanApp related escape logic is removed as KanbanApp itself is removed.
            // If any Kanban modals were intended to be controlled from here independently, that logic would also need adjustment.
        }
    });

    // Initial render of OVC table, if window.renderOvcTable is available
    // This was in a separate script tag at the end of index.html
    // It's generally better to have one main DOMContentLoaded or ensure dependent functions are loaded.
    // If renderOvcTable is defined in ovcDisplay.js (loaded with defer), it should be available.
    console.log('Renderizando tabla de OVCs al cargar la página (desde indexPageLogic.js)...');
    if (typeof window.renderOvcTable === 'function') {
        window.renderOvcTable();
    } else {
        console.error('renderOvcTable no está definido en el contexto de indexPageLogic.js al final del DOMContentLoaded. Asegúrese de que ovcDisplay.js se cargue y defina window.renderOvcTable.');
    }
});
