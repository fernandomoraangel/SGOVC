// js/ovcStorage.js

// Exportamos la constante para que esté disponible globalmente
const OVC_STORAGE_KEY = 'ovcData';

/**
 * ADVERTENCIA IMPORTANTE SOBRE LOCALSTORAGE Y ARCHIVOS:
 * Guardar imágenes (o archivos grandes) como Base64 en localStorage
 * NO es recomendable para aplicaciones reales. localStorage tiene límites
 * de tamaño estrictos (5-10MB) que se alcanzan rápidamente.
 * La solución estándar es subir los archivos a un servidor y guardar
 * solo la URL en localStorage o en una base de datos.
 * Esta implementación con Base64 es solo para fines de DEMOSTRACIÓN
 * en este entorno limitado.
 */
// Función para obtener OVCs desde localStorage
function getOvcsFromStorage() {
    // Exportar la función globalmente de inmediato
    window.getOvcsFromStorage = getOvcsFromStorage;
    
    const ovcsJson = localStorage.getItem(OVC_STORAGE_KEY); // Usamos la constante
    try {
        return ovcsJson ? JSON.parse(ovcsJson) : [];
    } catch (e) {
        console.error("Error al analizar los datos de OVC:", e);
        return [];
    }
}

function saveOvcsToStorage(ovcs) {
    // Exportar la funciu00f3n globalmente de inmediato
    window.saveOvcsToStorage = saveOvcsToStorage;
    
    try {
        if (!Array.isArray(ovcs)) {
            console.error("Error: Not an array:", ovcs);
            return;
        }
        const dataToSave = JSON.stringify(ovcs);
        // console.log(`DEBUG: Guardando en localStorage (${OVC_STORAGE_KEY}):`, dataToSave); // Opcional: muy verboso con Base64
        localStorage.setItem(OVC_STORAGE_KEY, dataToSave);
        console.log("DEBUG: Guardado/Actualizado exitoso en localStorage.");
    } catch (e) {
        console.error("Error saving OVC data to localStorage:", e);
        // Podría ser un error de cuota si las imágenes son muy grandes
        if (e.name === 'QuotaExceededError') {
            alert('Error: No se pudo guardar. El almacenamiento local está lleno.\n(Guardar imágenes directamente tiene límites).');
        } else {
            alert('Error inesperado al guardar los datos.');
        }
    }
}

// Las funciones ya se exportaron globalmente
// window.getOvcsFromStorage = getOvcsFromStorage;
// window.saveOvcsToStorage = saveOvcsToStorage;
window.OVC_STORAGE_KEY = OVC_STORAGE_KEY;
