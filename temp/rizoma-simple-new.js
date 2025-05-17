// Función para renderizar el grafo de rizoma
window.renderRizoma = function() {
    console.log('DEBUG: Iniciando renderizado del rizoma');
    
    // Obtener el elemento SVG
    const svgElement = document.getElementById('rizoma-graph');
    if (!svgElement) {
        console.error('ERROR: No se encontró el elemento SVG para el rizoma');
        return;
    }
    
    // Limpiar el SVG antes de renderizar
    svgElement.innerHTML = '';
    
    // Dimensiones del SVG
    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 600;
    
    // Crear el objeto SVG de D3
    const svg = d3.select(svgElement)
        .attr('width', width)
        .attr('height', height);
    
    // Obtener los OVCs
    let ovcs = [];
    try {
        // Intentar obtener los OVCs desde el almacenamiento
        ovcs = window.getOvcsFromStorage ? window.getOvcsFromStorage() : [];
        console.log(`DEBUG: Se obtuvieron ${ovcs.length} OVCs para el rizoma`);
    } catch (error) {
        console.error('ERROR: No se pudieron obtener los OVCs:', error);
        ovcs = [];
    }
    
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
    
    // Si no hay OVCs, mostrar algunos nodos de ejemplo
    if (nodes.length === 0) {
        console.log('DEBUG: No hay OVCs, mostrando nodos de ejemplo');
        nodes.push(
            { id: 'node1', name: 'Ejemplo OVC 1', group: 1 },
            { id: 'node2', name: 'Ejemplo OVC 2', group: 2 },
            { id: 'node3', name: 'Ejemplo OVC 3', group: 3 },
            { id: 'node4', name: 'Ejemplo OVC 4', group: 4 },
            { id: 'node5', name: 'Ejemplo OVC 5', group: 5 }
        );
    }
    
    // Crear enlaces entre nodos
    let links = [];
    if (nodes.length > 0 && nodes[0].data) {
        // Si tenemos datos reales de OVCs, crear enlaces basados en las relaciones
        links = ovcs.flatMap(ovc => {
            if (!Array.isArray(ovc.relaciones) || ovc.relaciones.length === 0) return [];
            
            return ovc.relaciones.map(rel => {
                // Buscar el nodo destino basado en el ID del OVC relacionado
                const targetId = `ovc-${rel.ovcId}`;
                return {
                    source: `ovc-${ovc.id}`,
                    target: targetId,
                    label: rel.etiqueta || 'relacionado'
                };
            }).filter(link => {
                // Filtrar enlaces a nodos que no existen
                return nodes.some(node => node.id === link.target);
            });
        });
    } else {
        // Si no hay datos reales, crear algunos enlaces de ejemplo
        links = [
            { source: 'node1', target: 'node2' },
            { source: 'node2', target: 'node3' },
            { source: 'node3', target: 'node4' },
            { source: 'node4', target: 'node5' },
            { source: 'node5', target: 'node1' }
        ];
    }
    
    // Crear la simulación de fuerzas
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));
    
    // Función para arrastrar nodos
    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
    
    // Crear los enlaces
    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', 2);
    
    // Añadir etiquetas a los enlaces
    const linkLabels = svg.append('g')
        .selectAll('text')
        .data(links)
        .join('text')
        .attr('class', 'link-label')
        .attr('dy', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d => d.label || '')
        .attr('fill', '#555')
        .attr('opacity', 0.8);
    
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
        .on('mouseover', function(event, d) {
            // Destacar el nodo actual
            d3.select(this)
                .attr('transform', 'scale(1.5)')
                .attr('stroke-width', 2);
            
            // Destacar los enlaces conectados a este nodo
            link.attr('stroke-width', l => 
                (l.source.id === d.id || l.target.id === d.id) ? 4 : 2
            );
            
            // Mostrar tooltip con información del OVC
            if (d.data) {
                const tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .style('position', 'absolute')
                    .style('background', 'rgba(255, 255, 255, 0.9)')
                    .style('padding', '10px')
                    .style('border-radius', '5px')
                    .style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.1)')
                    .style('pointer-events', 'none')
                    .style('z-index', '1000')
                    .style('opacity', 0);
                
                // Contenido del tooltip
                let tooltipContent = `<strong>${d.data.titulo || 'OVC sin título'}</strong><br>`;
                tooltipContent += `<span>Semestre: ${d.data.semestre || 'No definido'}</span><br>`;
                
                if (Array.isArray(d.data.asignaturas) && d.data.asignaturas.length > 0) {
                    tooltipContent += `<span>Asignaturas: ${d.data.asignaturas.join(', ')}</span><br>`;
                }
                
                if (d.data.descripcion) {
                    const desc = d.data.descripcion.length > 100 ? 
                        d.data.descripcion.substring(0, 97) + '...' : 
                        d.data.descripcion;
                    tooltipContent += `<span>${desc}</span>`;
                }
                
                tooltip.html(tooltipContent)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 30) + 'px')
                    .transition()
                    .duration(200)
                    .style('opacity', 1);
                
                // Guardar referencia al tooltip en el nodo
                d.tooltip = tooltip;
            }
        })
        .on('mouseout', function(event, d) {
            // Restaurar el nodo
            d3.select(this)
                .attr('transform', 'scale(1)')
                .attr('stroke-width', 1.5);
            
            // Restaurar los enlaces
            link.attr('stroke-width', 2);
            
            // Ocultar y eliminar el tooltip
            if (d.tooltip) {
                d.tooltip.transition()
                    .duration(200)
                    .style('opacity', 0)
                    .remove();
                delete d.tooltip;
            }
        })
        .on('click', function(event, d) {
            // Al hacer clic en un nodo, mostrar el modal de resumen del OVC
            if (d.data && d.data.id) {
                console.log('Clicked on OVC:', d.data);
                
                // Verificar si la función showSummaryModal está disponible
                if (typeof window.showSummaryModal === 'function') {
                    // Mostrar el modal de resumen del OVC
                    window.showSummaryModal(d.data.id);
                } else {
                    console.error('ERROR: La función showSummaryModal no está disponible');
                    
                    // Intentar cargar dinámicamente ovcDisplay.js si es necesario
                    const script = document.createElement('script');
                    script.src = '../js/ovcDisplay.js';
                    script.onload = function() {
                        console.log('ovcDisplay.js cargado dinámicamente');
                        if (typeof window.showSummaryModal === 'function') {
                            window.showSummaryModal(d.data.id);
                        } else {
                            console.error('ERROR: La función showSummaryModal sigue sin estar disponible');
                            alert(`OVC: ${d.data.titulo}
Semestre: ${d.data.semestre || 'No definido'}
Descripción: ${d.data.descripcion || 'No disponible'}`);
                        }
                    };
                    document.body.appendChild(script);
                }
            }
        });
    
    // Añadir etiquetas de texto a los nodos
    const text = svg.append('g')
        .attr('stroke', 'none')
        .attr('font-family', 'Arial')
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('dx', 15)
        .attr('dy', '.35em')
        .text(d => d.name);
    
    // Actualizar la posición de los elementos en cada tick de la simulación
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        // Actualizar posición de las etiquetas de los enlaces
        linkLabels
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2);
        
        node
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
        
        text
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    // Añadir leyenda para las formas de los nodos (por semestre) y colores (por asignatura)
    const legendShapeData = [
        { semestre: 'Primer semestre', symbol: d3.symbolCircle },
        { semestre: 'Segundo semestre', symbol: d3.symbolSquare },
        { semestre: 'Tercer semestre', symbol: d3.symbolTriangle },
        { semestre: 'Cuarto semestre', symbol: d3.symbolDiamond },
        { semestre: 'Quinto semestre', symbol: d3.symbolStar },
        { semestre: 'Sexto semestre', symbol: d3.symbolCross },
        { semestre: 'Séptimo semestre', symbol: d3.symbolWye },
        { semestre: 'Octavo semestre', symbol: d3.symbolSquare }
    ];
    
    // Crear leyenda para las formas
    const shapeLegend = svg.append('g')
        .attr('class', 'shape-legend')
        .attr('transform', `translate(${width - 180}, 20)`);
    
    // Título de la leyenda de formas
    shapeLegend.append('text')
        .attr('x', 0)
        .attr('y', -5)
        .attr('font-weight', 'bold')
        .text('Año-Semestre:');
    
    // Elementos de la leyenda de formas
    const shapeLegendItems = shapeLegend.selectAll('.shape-legend-item')
        .data(legendShapeData)
        .enter()
        .append('g')
        .attr('class', 'shape-legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20 + 15})`);
    
    // Símbolos de la leyenda de formas
    shapeLegendItems.append('path')
        .attr('d', d => d3.symbol().type(d.symbol).size(100)())
        .attr('fill', '#666')
        .attr('stroke', '#333')
        .attr('stroke-width', 1);
    
    // Texto de la leyenda de formas
    shapeLegendItems.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .attr('font-size', '12px')
        .text(d => d.semestre);
    
    // Crear leyenda para los colores (asignaturas)
    const colorLegendData = Array.from(todasAsignaturas).map(asignatura => ({
        asignatura,
        color: asignaturasColorMap[asignatura]
    }));
    
    // Limitar a las 10 primeras asignaturas para que no sea demasiado grande
    const colorLegendDataLimited = colorLegendData.slice(0, 10);
    
    // Crear leyenda para los colores
    const colorLegend = svg.append('g')
        .attr('class', 'color-legend')
        .attr('transform', `translate(${width - 180}, ${legendShapeData.length * 20 + 50})`);
    
    // Título de la leyenda de colores
    colorLegend.append('text')
        .attr('x', 0)
        .attr('y', -5)
        .attr('font-weight', 'bold')
        .text('Asignaturas:');
    
    // Elementos de la leyenda de colores
    const colorLegendItems = colorLegend.selectAll('.color-legend-item')
        .data(colorLegendDataLimited)
        .enter()
        .append('g')
        .attr('class', 'color-legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20 + 15})`);
    
    // Círculos de color para la leyenda
    colorLegendItems.append('circle')
        .attr('r', 6)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', d => d.color)
        .attr('stroke', '#333')
        .attr('stroke-width', 1);
    
    // Texto de la leyenda de colores
    colorLegendItems.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .attr('font-size', '12px')
        .text(d => d.asignatura.length > 20 ? d.asignatura.substring(0, 17) + '...' : d.asignatura);
    
    // Si hay más asignaturas de las que mostramos, añadir una nota
    if (colorLegendData.length > colorLegendDataLimited.length) {
        colorLegend.append('text')
            .attr('x', 0)
            .attr('y', colorLegendDataLimited.length * 20 + 25)
            .attr('font-size', '12px')
            .attr('font-style', 'italic')
            .text(`+ ${colorLegendData.length - colorLegendDataLimited.length} más...`);
    }
    
    // Implementar funcionalidad de búsqueda
    const searchInput = document.getElementById('rizoma-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (!searchTerm) {
                // Si no hay término de búsqueda, restaurar todos los nodos y enlaces
                node.attr('opacity', 1);
                link.attr('opacity', 0.6);
                text.attr('opacity', 1);
                return;
            }
            
            // Filtrar nodos que coinciden con el término de búsqueda
            const matchingNodes = nodes.filter(n => 
                (n.name && n.name.toLowerCase().includes(searchTerm)) ||
                (n.data && n.data.descripcion && n.data.descripcion.toLowerCase().includes(searchTerm)) ||
                (n.data && Array.isArray(n.data.etiquetas) && n.data.etiquetas.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                (n.data && Array.isArray(n.data.asignaturas) && n.data.asignaturas.some(asig => asig.toLowerCase().includes(searchTerm)))
            );
            
            const matchingNodeIds = new Set(matchingNodes.map(n => n.id));
            
            // Destacar nodos y enlaces que coinciden
            node.attr('opacity', d => matchingNodeIds.has(d.id) ? 1 : 0.2);
            link.attr('opacity', d => 
                matchingNodeIds.has(d.source.id) && matchingNodeIds.has(d.target.id) ? 0.8 : 0.1
            );
            text.attr('opacity', d => matchingNodeIds.has(d.id) ? 1 : 0.2);
        });
    }
    
    // Verificar si la sección del rizoma está visible y ajustar el tamaño del SVG
    function checkRizomaVisibility() {
        const rizomaSection = document.getElementById('rizoma-section');
        if (rizomaSection && !rizomaSection.classList.contains('hidden')) {
            // La sección del rizoma está visible, ajustar el tamaño del SVG
            const newWidth = svgElement.clientWidth;
            const newHeight = svgElement.clientHeight;
            
            if (newWidth > 0 && newHeight > 0) {
                svg.attr('width', newWidth).attr('height', newHeight);
                simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
                simulation.alpha(0.3).restart();
            }
        }
    }
    
    // Verificar la visibilidad inicial y ajustar el tamaño
    checkRizomaVisibility();
    
    // Agregar un listener para el evento de cambio de tamaño de la ventana
    window.addEventListener('resize', checkRizomaVisibility);
    
    console.log('DEBUG: Rizoma renderizado correctamente');
};

// Verificar si la sección del rizoma está visible al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const rizomaSection = document.getElementById('rizoma-section');
    if (rizomaSection && !rizomaSection.classList.contains('hidden')) {
        // Si la sección del rizoma está visible, renderizar el grafo
        setTimeout(() => {
            window.renderRizoma();
        }, 500); // Pequeño retraso para asegurar que todos los elementos estén cargados
    }
});
