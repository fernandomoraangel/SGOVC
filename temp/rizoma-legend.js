// Au00f1adir leyenda para las formas de los nodos (por semestre) y colores (por asignatura)
const legendShapeData = [
    { semestre: 'Primer semestre', symbol: d3.symbolCircle },
    { semestre: 'Segundo semestre', symbol: d3.symbolSquare },
    { semestre: 'Tercer semestre', symbol: d3.symbolTriangle },
    { semestre: 'Cuarto semestre', symbol: d3.symbolDiamond },
    { semestre: 'Quinto semestre', symbol: d3.symbolStar },
    { semestre: 'Sexto semestre', symbol: d3.symbolCross },
    { semestre: 'Su00e9ptimo semestre', symbol: d3.symbolWye },
    { semestre: 'Octavo semestre', symbol: d3.symbolSquare }
];

// Crear leyenda para las formas
const shapeLegend = svg.append('g')
    .attr('class', 'shape-legend')
    .attr('transform', `translate(${width - 180}, 20)`);

// Tu00edtulo de la leyenda de formas
shapeLegend.append('text')
    .attr('x', 0)
    .attr('y', -5)
    .attr('font-weight', 'bold')
    .text('Au00f1o-Semestre:');

// Elementos de la leyenda de formas
const shapeLegendItems = shapeLegend.selectAll('.shape-legend-item')
    .data(legendShapeData)
    .enter()
    .append('g')
    .attr('class', 'shape-legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20 + 15})`);

// Su00edmbolos de la leyenda de formas
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

// Tu00edtulo de la leyenda de colores
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

// Cu00edrculos de color para la leyenda
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

// Si hay mu00e1s asignaturas de las que mostramos, au00f1adir una nota
if (colorLegendData.length > colorLegendDataLimited.length) {
    colorLegend.append('text')
        .attr('x', 0)
        .attr('y', colorLegendDataLimited.length * 20 + 25)
        .attr('font-size', '12px')
        .attr('font-style', 'italic')
        .text(`+ ${colorLegendData.length - colorLegendDataLimited.length} mu00e1s...`);
}
