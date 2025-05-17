// js/kanbanStorage.js

// Clave base para almacenar los tableros Kanban en localStorage
const KANBAN_STORAGE_KEY = 'kanbanBoards';

/**
 * Obtiene todos los tableros Kanban de localStorage
 * @returns {Object} Un objeto donde las claves son los IDs de OVC y los valores son los tableros Kanban
 */
function getAllKanbanBoards() {
    try {
        const kanbanBoardsJson = localStorage.getItem(KANBAN_STORAGE_KEY);
        return kanbanBoardsJson ? JSON.parse(kanbanBoardsJson) : {};
    } catch (e) {
        console.error("Error al analizar los datos de Kanban:", e);
        return {};
    }
}

/**
 * Guarda todos los tableros Kanban en localStorage
 * @param {Object} kanbanBoards - Objeto con los tableros Kanban a guardar
 */
function saveAllKanbanBoards(kanbanBoards) {
    try {
        if (!kanbanBoards || typeof kanbanBoards !== 'object') {
            throw new Error("Datos de Kanban no válidos");
        }
        localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(kanbanBoards));
    } catch (e) {
        console.error("Error al guardar los datos de Kanban:", e);
        if (e.name === 'QuotaExceededError') {
            alert('Error: No se pudo guardar. El almacenamiento local está lleno.');
        } else {
            alert('Error inesperado al guardar los datos del tablero Kanban.');
        }
    }
}

/**
 * Obtiene un tablero Kanban específico por ID de OVC
 * @param {string} ovcId - ID del OVC
 * @returns {Object|null} El tablero Kanban o null si no existe
 */
function getKanbanBoard(ovcId) {
    if (!ovcId) {
        console.error("Se requiere un ID de OVC válido");
        return null;
    }
    const allBoards = getAllKanbanBoards();
    return allBoards[ovcId] || null;
}

/**
 * Guarda o actualiza un tablero Kanban para un OVC específico
 * @param {string} ovcId - ID del OVC
 * @param {Object} boardData - Datos del tablero Kanban a guardar
 */
function saveKanbanBoard(ovcId, boardData) {
    if (!ovcId) {
        console.error("No se puede guardar el tablero: ID de OVC no proporcionado");
        return;
    }
    
    const allBoards = getAllKanbanBoards();
    allBoards[ovcId] = boardData;
    saveAllKanbanBoards(allBoards);
}

/**
 * Elimina un tablero Kanban específico
 * @param {string} ovcId - ID del OVC cuyo tablero se desea eliminar
 */
function deleteKanbanBoard(ovcId) {
    if (!ovcId) return;
    
    const allBoards = getAllKanbanBoards();
    if (allBoards[ovcId]) {
        delete allBoards[ovcId];
        saveAllKanbanBoards(allBoards);
    }
}

// Exportar funciones al objeto window para que estén disponibles globalmente
window.KanbanStorage = {
    getBoard: getKanbanBoard,
    saveBoard: saveKanbanBoard,
    deleteBoard: deleteKanbanBoard,
    getAllBoards: getAllKanbanBoards
};

// Inicializar el almacenamiento si no existe
if (!localStorage.getItem(KANBAN_STORAGE_KEY)) {
    localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify({}));
}
