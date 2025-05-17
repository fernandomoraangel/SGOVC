// Crear los nodos con diferentes formas según el semestre
const node = svg.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('path')
    .data(nodes)
    .join('path')
    .attr('d', d => {
        // Determinar la forma según el año-semestre
        const semestre = d.semestre ? d.semestre.toString().toLowerCase() : '';
        const size = 12; // Tamaño base para todas las formas
        
        // Buscar patrones como "2023-1", "2023-2", etc.
        const yearSemesterPattern = /([0-9]{4})[\-\/\s]*(\d+)/;
        const match = semestre.match(yearSemesterPattern);
        
        if (match) {
            // Si encontramos un patrón de año-semestre, usamos el número de semestre
            const semester = parseInt(match[2]);
            
            switch(semester) {
                case 1:
                    return d3.symbol().type(d3.symbolCircle).size(size*size)(); // Círculo para primer semestre
                case 2:
                    return d3.symbol().type(d3.symbolSquare).size(size*size)(); // Cuadrado para segundo semestre
                case 3:
                    return d3.symbol().type(d3.symbolTriangle).size(size*size)(); // Triángulo para tercer semestre
                case 4:
                    return d3.symbol().type(d3.symbolDiamond).size(size*size)(); // Diamante para cuarto semestre
                case 5:
                    return d3.symbol().type(d3.symbolStar).size(size*size)(); // Estrella para quinto semestre
                case 6:
                    return d3.symbol().type(d3.symbolCross).size(size*size)(); // Cruz para sexto semestre
                case 7:
                    return d3.symbol().type(d3.symbolWye).size(size*size)(); // Hexágono para séptimo semestre
                case 8:
                    return d3.symbol().type(d3.symbolSquare).size(size*size)(); // Cuadrado para octavo semestre
                default:
                    return d3.symbol().type(d3.symbolCircle).size(size*size)(); // Círculo por defecto
            }
        } else if (semestre.includes('1') || semestre.includes('primero')) {
            return d3.symbol().type(d3.symbolCircle).size(size*size)();
        } else if (semestre.includes('2') || semestre.includes('segundo')) {
            return d3.symbol().type(d3.symbolSquare).size(size*size)();
        } else if (semestre.includes('3') || semestre.includes('tercero')) {
            return d3.symbol().type(d3.symbolTriangle).size(size*size)();
        } else if (semestre.includes('4') || semestre.includes('cuarto')) {
            return d3.symbol().type(d3.symbolDiamond).size(size*size)();
        } else if (semestre.includes('5') || semestre.includes('quinto')) {
            return d3.symbol().type(d3.symbolStar).size(size*size)();
        } else if (semestre.includes('6') || semestre.includes('sexto')) {
            return d3.symbol().type(d3.symbolCross).size(size*size)();
        } else if (semestre.includes('7') || semestre.includes('séptimo')) {
            return d3.symbol().type(d3.symbolWye).size(size*size)();
        } else if (semestre.includes('8') || semestre.includes('octavo')) {
            return d3.symbol().type(d3.symbolSquare).size(size*size)(); 
        } else {
            // Forma predeterminada para otros semestres
            return d3.symbol().type(d3.symbolCircle).size(size*size)();
        }
    })
    .attr('fill', d => d.color) // Usar el color calculado en base a las asignaturas
    .call(drag(simulation))
