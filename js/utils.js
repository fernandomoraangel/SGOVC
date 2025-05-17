// <!-- Listas dinámicas (sin cambios) -->
function setupDynamicList(containerId, addButtonId, itemSelector) {
    const container = document.getElementById(containerId);
    const addButton = document.getElementById(addButtonId);
    if (!container || !addButton) return;

    let template = container.querySelector(itemSelector);
    if (!template) {
        console.error(`No se encontró el template con selector '${itemSelector}' en el contenedor '${containerId}'`);
        return;
    }
    // Clonar el template original para usarlo y mantener el original intacto en el DOM si es necesario
    template = template.cloneNode(true);
    // Asegurarse de que el template clonado no tenga valores que no deberían estar por defecto
    template.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
        else input.value = '';
    });


    addButton.addEventListener('click', () => {
        const newItem = template.cloneNode(true);
        container.appendChild(newItem);
        // Si hay una función de autocompletado global, aplicarla a los nuevos campos
        if (typeof initializeAutocompleteForElement === 'function') {
            initializeAutocompleteForElement(newItem);
        }
    });

    container.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-item-btn')) {
            // Asegurarse de no eliminar el primer elemento si es el template y no debe ser eliminado
            if (event.target.closest(itemSelector) !== container.querySelector(itemSelector) || container.querySelectorAll(itemSelector).length > 1) {
                event.target.closest(itemSelector).remove();
            }
        }
    });
}

// Helper para poblar listas dinámicas (sin cambios)
function populateDynamicListField(containerId, itemSelector, dataArray, fillFunction) { /* ... código sin cambios ... */
    const container = document.getElementById(containerId);
    if (!container) return;
    const template = container.querySelector(itemSelector);
    if (!template) return;
    container.querySelectorAll(`${itemSelector}:not(:first-child)`).forEach(el => el.remove());
    const firstItem = container.querySelector(itemSelector);
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        firstItem.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
            else input.value = '';
        });
    } else {
        dataArray.forEach((data, index) => {
            let currentItem = (index === 0) ? firstItem : template.cloneNode(true);
            if (index > 0) container.appendChild(currentItem);
            fillFunction(currentItem, data);
        });
    }
}
