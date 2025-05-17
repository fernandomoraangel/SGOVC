// Crear un mapa de asignaturas a colores
const asignaturasColorMap = {};
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Asignar colores a todas las asignaturas únicas
const todasAsignaturas = new Set();
ovcs.forEach(ovc => {
    if (Array.isArray(ovc.asignaturas)) {
        ovc.asignaturas.forEach(asignatura => todasAsignaturas.add(asignatura));
    }
});

// Asignar un color a cada asignatura
Array.from(todasAsignaturas).forEach((asignatura, index) => {
    asignaturasColorMap[asignatura] = colorScale(index);
});

// Función para mezclar colores
function blendColors(colors) {
    if (!colors || colors.length === 0) return '#999'; // Color gris por defecto
    if (colors.length === 1) return colors[0];
    
    // Convertir colores hexadecimales a RGB y promediar
    const rgbColors = colors.map(color => {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
    });
    
    // Calcular el promedio de cada componente
    const avgColor = rgbColors.reduce((acc, [r, g, b]) => {
        return [acc[0] + r, acc[1] + g, acc[2] + b];
    }, [0, 0, 0]).map(c => Math.round(c / rgbColors.length));
    
    // Convertir de nuevo a hexadecimal
    return `#${avgColor[0].toString(16).padStart(2, '0')}${avgColor[1].toString(16).padStart(2, '0')}${avgColor[2].toString(16).padStart(2, '0')}`;
}

// Convertir los OVCs a nodos para el grafo
const nodes = ovcs.map((ovc, index) => {
    // Determinar el color basado en las asignaturas
    let nodeColor = '#999'; // Color gris por defecto
    if (Array.isArray(ovc.asignaturas) && ovc.asignaturas.length > 0) {
        const asignaturaColors = ovc.asignaturas.map(asig => asignaturasColorMap[asig] || '#999');
        nodeColor = blendColors(asignaturaColors);
    }
    
    return {
        id: `ovc-${ovc.id}`,
        name: ovc.titulo || `OVC ${ovc.id}`,
        color: nodeColor,
        asignaturas: Array.isArray(ovc.asignaturas) ? [...ovc.asignaturas] : [],
        data: ovc, // Guardar los datos completos del OVC para uso posterior
        semestre: ovc.semestre || 'No definido' // Guardar el semestre para determinar la forma
    };
});
