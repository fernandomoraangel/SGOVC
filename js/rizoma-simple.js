// rizoma.js

/**
 * Obtiene y procesa los datos de OVCs desde localStorage para el formato D3.
 * @returns {Promise<{nodes: Array, links: Array}>} Una promesa que resuelve al objeto de datos para D3.
 */
async function getGraphDataForD3() {
    return new Promise((resolve, reject) => {
      try {
        console.log('DEBUG: Obteniendo datos de OVCs desde localStorage...');
        const rawData = localStorage.getItem("ovcData");
        if (!rawData) {
          console.warn(
            "No se encontraron datos de OVCs en localStorage ('ovcData')."
          );
          // Devolver datos vacíos pero válidos
          resolve({ nodes: [], links: [], originalOvcs: [] });
          return;
        }
  
        const ovcs = JSON.parse(rawData);
        if (!Array.isArray(ovcs) || ovcs.length === 0) {
          console.warn(
            "Los datos en 'ovcData' no son un array válido o están vacíos."
          );
          resolve({ nodes: [], links: [] });
          return;
        }
  
        const titleToIdMap = new Map();
        ovcs.forEach((ovc) => {
          if (ovc.id && ovc.titulo) {
            titleToIdMap.set(ovc.titulo, ovc.id);
          } else {
            console.warn("OVC encontrado sin id o título:", ovc);
          }
        });
  
        const nodes = ovcs.map((ovc) => ({
          id: ovc.id,
          label: ovc.titulo || "Sin Título",
          primeraAsignatura:
            ovc.asignaturas && ovc.asignaturas.length > 0
              ? ovc.asignaturas[0]
              : "Sin Asignatura",
          descripcion: ovc.descripcion,
          fechaCreacion: ovc.fechaCreacion,
          autores: ovc.autores,
          semestre: ovc.semestre || "Sin Semestre", // Añadir semestre
        }));
  
        const links = [];
        ovcs.forEach((ovc) => {
          if (ovc.relaciones && Array.isArray(ovc.relaciones)) {
            ovc.relaciones.forEach((rel) => {
              const targetTitle = rel.ovc;
              const targetId = titleToIdMap.get(targetTitle);
              const sourceId = ovc.id;
  
              if (sourceId && targetId) {
                let finalSourceId = null;
                let finalTargetId = null;
  
                if (rel.direccion === "saliente") {
                  finalSourceId = sourceId;
                  finalTargetId = targetId;
                } else if (rel.direccion === "entrante") {
                  finalSourceId = targetId;
                  finalTargetId = sourceId;
                } else {
                  // Incluye bidireccional o no especificado
                  // Para bidireccional, podríamos añadir dos enlaces o uno sin flecha.
                  // Por ahora, trataremos bidireccional como saliente para la flecha.
                  finalSourceId = sourceId;
                  finalTargetId = targetId;
                  if (rel.direccion === "bidireccional") {
                    // Opcional: Podríamos añadir un segundo enlace inverso aquí
                    // o modificar el estilo/marcador para bidireccional.
                  } else {
                    console.warn(
                      `Dirección de relación no especificada o desconocida para ${ovc.titulo} -> ${targetTitle}. Asumiendo 'saliente'.`
                    );
                  }
                }
  
                if (finalSourceId && finalTargetId) {
                  links.push({
                    source: finalSourceId,
                    target: finalTargetId,
                    label: rel.etiqueta || "Relacionado",
                    tipoRelacion: rel.etiqueta || "Relacionado",
                    direccion: rel.direccion, // Añadir dirección para flechas bidireccionales
                  });
                } else {
                  console.warn(
                    `No se pudo crear enlace: ${
                      rel.direccion === "entrante" ? targetTitle : ovc.titulo
                    } -> ${
                      rel.direccion === "entrante" ? ovc.titulo : targetTitle
                    }. IDs: ${finalSourceId}, ${finalTargetId}`
                  );
                }
              } else {
                console.warn(
                  `No se pudo encontrar ID para OVC en relación: ${targetTitle} (relacionado con ${ovc.titulo})`
                );
              }
            });
          }
        });
  
        const validNodes = nodes.filter((node) => node.id);
        const validNodeIds = new Set(validNodes.map((n) => n.id));
        const validLinks = links.filter(
          (link) => validNodeIds.has(link.source) && validNodeIds.has(link.target)
        );
  
        console.log(`DEBUG: Datos procesados para D3: ${validNodes.length} nodos, ${validLinks.length} enlaces`);
        resolve({ nodes: validNodes, links: validLinks, originalOvcs: ovcs }); // Devolver también los OVCs originales
      } catch (error) {
        console.error("Error al obtener o procesar datos de OVCs:", error);
        // Devolver datos vacíos pero válidos en caso de error
        resolve({ nodes: [], links: [], originalOvcs: [] });
      }
    });
  }
  
  /**
   * Genera una visualización de rizoma interactiva usando D3.js.
   * @param {string} containerId El ID del elemento SVG contenedor.
   */
  async function verRizoma(containerId) {
    console.log(`DEBUG: Iniciando verRizoma con contenedor: ${containerId}`);
    
    // Verificar que el contenedor exista
    if (!document.querySelector(containerId)) {
      console.error(`ERROR: No se encontró el contenedor ${containerId}`);
      return;
    }
    
    let data;
    try {
      console.log('DEBUG: Obteniendo datos para el rizoma...');
      data = await getGraphDataForD3();
      console.log('DEBUG: Datos obtenidos correctamente:', data);
    } catch (error) {
      console.error('ERROR al cargar los datos del rizoma:', error);
      const container = d3.select(containerId);
      container.html(
        `<div style="color: red; padding: 10px;">Error al cargar los datos: ${error.message}</div>`
      );
      return;
    }
  
    const { nodes, links, originalOvcs } = data; // Obtener los OVCs originales
    const container = d3.select(containerId);
    const svgElement = container.node();
  
    // Limpiar contenedor previo
    container.selectAll("*").remove();
    
    // Calcular dimensiones dinámicamente
    const parentDiv = svgElement.parentElement;
    const width = parentDiv ? parentDiv.getBoundingClientRect().width : 600;
    const height = parentDiv ? parentDiv.getBoundingClientRect().height : 400;
    
    // Establecer dimensiones del SVG
    container.attr("width", "100%")
            .attr("height", "100%")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${width} ${height}`);
    
    console.log(`DEBUG: Dimensiones usadas para el grafo: ${width}x${height}`);
    console.log(`DEBUG: Número de nodos a renderizar: ${nodes.length}`);
    console.log(`DEBUG: Número de enlaces a renderizar: ${links.length}`);
  
    if (nodes.length === 0) {
      container
        .append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .text("No hay OVCs para visualizar.");
      return;
    }
  
    // Crear escala de colores para las asignaturas
    // Extraer TODAS las asignaturas únicas de TODOS los OVCs originales
    const asignaturaMap = new Map();
    originalOvcs.forEach((ovc) => {
      if (ovc.asignaturas && Array.isArray(ovc.asignaturas)) {
        ovc.asignaturas.forEach((asignaturaOriginal) => {
          if (asignaturaOriginal && asignaturaOriginal !== "Sin Asignatura") {
            const asignaturaKey = asignaturaOriginal.trim().toLowerCase(); // Clave normalizada
            if (!asignaturaMap.has(asignaturaKey)) {
              asignaturaMap.set(asignaturaKey, asignaturaOriginal); // Guardar valor original
            }
          }
        });
      }
    });
    const asignaturas = Array.from(asignaturaMap.values()); // Array COMPLETO de asignaturas únicas
    
    // Crear una escala de colores vibrantes para las asignaturas
    const colorScale = d3.scaleOrdinal()
      .domain(asignaturas)
      .range([
        "#1f77b4", // azul
        "#ff7f0e", // naranja
        "#2ca02c", // verde
        "#d62728", // rojo
        "#9467bd", // morado
        "#8c564b", // marrón
        "#e377c2", // rosa
        "#7f7f7f", // gris
        "#bcbd22", // oliva
        "#17becf", // cian
        "#aec7e8", // azul claro
        "#ffbb78", // naranja claro
        "#98df8a", // verde claro
        "#ff9896", // rojo claro
        "#c5b0d5"  // morado claro
      ]);
      
    // Función para convertir color hexadecimal a RGB
    function hexToRgb(hex) {
      // Eliminar # si está presente
      hex = hex.replace(/^#/, '');
      
      // Convertir a formato largo si es formato corto (ej: #abc -> #aabbcc)
      if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
      }
      
      // Convertir a valores RGB
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      return { r, g, b };
    }
    
    // Función para convertir RGB a hexadecimal
    function rgbToHex(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    // Función para mezclar colores (promedio de valores RGB)
    function blendColors(colors) {
      if (!colors || colors.length === 0) return "#cccccc"; // Color por defecto si no hay colores
      if (colors.length === 1) return colors[0]; // Si solo hay un color, devolverlo
      
      // Convertir todos los colores a RGB y calcular el promedio
      const rgbColors = colors.map(color => hexToRgb(color));
      
      const r = Math.round(rgbColors.reduce((sum, color) => sum + color.r, 0) / rgbColors.length);
      const g = Math.round(rgbColors.reduce((sum, color) => sum + color.g, 0) / rgbColors.length);
      const b = Math.round(rgbColors.reduce((sum, color) => sum + color.b, 0) / rgbColors.length);
      
      return rgbToHex(r, g, b);
    }
    
    // Calcular colores mezclados para cada nodo basado en sus asignaturas
    nodes.forEach(node => {
      // Obtener el OVC original completo
      const originalOvc = originalOvcs.find(ovc => ovc.id === node.id);
      
      if (originalOvc && originalOvc.asignaturas && originalOvc.asignaturas.length > 0) {
        // Filtrar asignaturas válidas
        const validAsignaturas = originalOvc.asignaturas.filter(
          asig => asig && asig !== "Sin Asignatura"
        );
        
        if (validAsignaturas.length > 0) {
          // Obtener colores para cada asignatura
          const asignaturaColors = validAsignaturas.map(asig => colorScale(asig));
          
          // Mezclar colores y asignar al nodo
          node.color = blendColors(asignaturaColors);
          
          // Guardar las asignaturas para mostrarlas en el tooltip
          node.asignaturas = validAsignaturas;
        } else {
          node.color = "#cccccc"; // Gris por defecto
          node.asignaturas = ["Sin Asignatura"];
        }
      } else {
        node.color = "#cccccc"; // Gris por defecto
        node.asignaturas = ["Sin Asignatura"];
      }
    });
  
    // --- Definición de formas por semestre ---
    const semestres = [...new Set(nodes.map((d) => d.semestre))]
      .filter((s) => s !== "Sin Semestre")
      .sort();
    const shapes = [
      d3.symbolCircle, // Círculo
      d3.symbolSquare, // Cuadrado
      d3.symbolTriangle, // Triángulo
      d3.symbolDiamond, // Diamante
      d3.symbolStar, // Estrella
      d3.symbolCross, // Cruz
      d3.symbolWye, // Wye (Y)
    ];
    const shapeScale = d3
      .scaleOrdinal()
      .domain(semestres)
      .range(shapes.slice(0, semestres.length)); // Asigna formas disponibles
  
    const defaultShape = d3.symbolCircle; // Forma por defecto si no hay semestre o se acaban las formas
    const nodeShapeSize = 100; // Tamaño base para los símbolos d3 (área)
    const effectiveRadius = Math.sqrt(nodeShapeSize / Math.PI); // Radio aproximado para colisiones/offsets
  
    // --- Definir funciones auxiliares ANTES de usarlas ---
  
    // Función 'ticked' para actualizar posiciones
    let tickCounter = 0;
    function ticked() {
      // Mantener los nodos dentro de los límites del SVG
      nodes.forEach(d => {
        // Aplicar límites con un margen
        const margin = effectiveRadius * 2;
        d.x = Math.max(margin, Math.min(width - margin, d.x));
        d.y = Math.max(margin, Math.min(height - margin, d.y));
      });
      
      // Actualizar líneas
      link.attr("d", linkLine);
  
      // Actualizar posición de los paths de nodos
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  
      // Ajustar posición de etiquetas de nodo según el radio efectivo
      nodeLabel.attr("x", (d) => d.x + effectiveRadius + 2).attr("y", (d) => d.y);
  
      // Posicionar y rotar etiquetas de enlace para legibilidad
      linkLabel.attr("transform", (d) => {
        if (!d.source.x || !d.source.y || !d.target.x || !d.target.y) return ""; // Evitar errores si faltan coords
        const midX = (d.source.x + d.target.x) / 2;
        const midY = (d.source.y + d.target.y) / 2;
        const angle =
          (Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x) * 180) /
          Math.PI;
        const rotate = angle > 90 || angle < -90 ? 180 : 0; // Rotar si está invertido
        return `translate(${midX},${midY}) rotate(${rotate})`;
      });
  
      if (tickCounter % 50 === 0 && nodes.length > 0) {
        console.log(
          `DEBUG Tick ${tickCounter}: Nodo 0 pos: (${nodes[0].x?.toFixed(
            1
          )}, ${nodes[0].y?.toFixed(1)})`
        );
      }
      tickCounter++;
    }
  
    // Función para calcular la ruta de la LÍNEA para los enlaces, acortándola para no tocar el nodo
    function linkLine(d) {
      if (
        d.source.x == null ||
        d.source.y == null ||
        d.target.x == null ||
        d.target.y == null
      ) {
        console.warn("DEBUG: Coordenadas faltantes para enlace:", d);
        return "M0,0L0,0";
      }
  
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance === 0)
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`; // Evitar división por cero
  
      // Calcular punto final acortado (restar radio efectivo + un pequeño margen)
      const padding = effectiveRadius + 2; // Margen para que la flecha no toque
      const ratio = (distance - padding) / distance;
      const targetX = d.source.x + dx * ratio;
      const targetY = d.source.y + dy * ratio;
  
      // Calcular punto inicial acortado (solo si es bidireccional)
      let sourceX = d.source.x;
      let sourceY = d.source.y;
      if (d.direccion === "bidireccional") {
        const startRatio = padding / distance;
        sourceX = d.source.x + dx * startRatio;
        sourceY = d.source.y + dy * startRatio;
      }
  
      return `M${sourceX},${sourceY}L${targetX},${targetY}`;
    }
  
    // Funcionalidad de arrastre
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  
    // --- Fin definiciones auxiliares ---
  
    // Inicializar posiciones de nodos en el centro del SVG
    nodes.forEach((node) => {
      // Distribuir los nodos más uniformemente alrededor del centro
      node.x = width / 2 + (Math.random() * 100 - 50);
      node.y = height / 2 + (Math.random() * 100 - 50);
    });
  
    // Crear simulación de fuerzas con parámetros ajustados
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100) // Reducir distancia para un grafo más compacto
      )
      .force("charge", d3.forceManyBody().strength(-300)) // Ajustar repulsión
      .force("center", d3.forceCenter(width / 2, height / 2).strength(1)) // Aumentar fuerza de centrado
      .force("collide", d3.forceCollide().radius(effectiveRadius + 5).strength(0.7)) // Mejorar colisión
      .force("x", d3.forceX(width / 2).strength(0.2)) // Aumentar fuerza para mantener nodos en el centro X
      .force("y", d3.forceY(height / 2).strength(0.2)) // Aumentar fuerza para mantener nodos en el centro Y
      .on("tick", ticked)
      .alphaTarget(0.1) // Mantener una simulación más activa
      .alphaDecay(0.02); // Disminuir la velocidad de decaimiento para estabilización más lenta
  
    // Crear el elemento SVG principal
    const svg = container;
    
    // Agregar un rectángulo de fondo para capturar eventos
    svg.append("rect")
       .attr("width", width)
       .attr("height", height)
       .attr("fill", "transparent")
       .attr("pointer-events", "all");

    // Definir marcadores de flecha (end y start)
    const defs = svg.append("defs");
  
    // Marcador final (flecha normal)
    defs
      .append("marker")
      .attr("id", "end")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 6) // Posición relativa a la punta de la línea acortada
      .attr("refY", 0)
      .attr("markerWidth", 4) // Reducir tamaño
      .attr("markerHeight", 4) // Reducir tamaño
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");
  
    // Marcador inicial (para flechas bidireccionales)
    defs
      .append("marker")
      .attr("id", "start")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 4) // Posición relativa al inicio de la línea acortada
      .attr("refY", 0)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto-start-reverse") // Orientación inversa
      .append("path")
      .attr("d", "M10,-5L0,0L10,5") // Flecha apuntando hacia atrás
      .attr("fill", "#999");
  
    // Grupo principal para zoom/pan
    const g = svg.append("g").attr("class", "everything");
  
    // Crear enlaces (paths como líneas)
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("path") // Seleccionar path, aunque dibujemos líneas
      .data(links)
      .enter()
      .append("path") // Usar path para poder aplicar marcadores
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .attr("fill", "none") // Importante para que sea una línea
      .attr("marker-end", "url(#end)")
      .attr("marker-start", (d) =>
        d.direccion === "bidireccional" ? "url(#start)" : null
      ); // Añadir marcador inicial si es bidireccional
  
    // Crear etiquetas para los enlaces usando textPath
    const linkLabel = g
      .append("g")
      .attr("class", "link-labels")
      .selectAll("text") // Seleccionamos text, aunque añadiremos textPath dentro
      .data(links)
      .enter()
      .append("text") // Añadimos el elemento text
      .attr("class", "link-label")
      .attr("text-anchor", "middle") // Anchor en el <text> padre
      .style("font-size", "6px") // Reducir tamaño de fuente
      .style("fill", "#555")
      .append("textPath") // Añadimos textPath dentro del text
      .attr("href", (d, i) => `#link-path-${i}`) // Referencia al ID del path del enlace
      .attr("startOffset", "50%") // Centrar texto en el path
      .attr("dy", "-0.5em") // Mueve el texto ligeramente hacia arriba
      .text((d) => d.label);
  
    // IDs en los paths (útil si se necesita textPath, aunque no lo usemos ahora)
    link.attr("id", (d, i) => `link-path-${i}`);
  
    // Crear nodos (paths con formas según semestre)
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("path") // Cambiar a path
      .data(nodes)
      .enter()
      .append("path")
      .attr("class", "node")
      .attr("d", (d) => {
        // Asignar forma según semestre
        const shapeFunc = shapeScale(d.semestre) || defaultShape;
        return d3.symbol().type(shapeFunc).size(nodeShapeSize)();
      })
      .attr("fill", (d) => d.color || "#cccccc") // Usar el color mezclado calculado
      .attr("stroke", "#fff") // Borde blanco
      .attr("stroke-width", 1.5) // Grosor borde
      .call(drag(simulation))
      .on("click", function (event, d) {
        // Añadir manejador de clic
        event.stopPropagation(); // Detener propagación para no interferir con zoom/pan
        if (typeof showSummaryModal === "function") {
          // Usar el nombre correcto de la función
          showSummaryModal(d.id); // Llamar a la función modal con el ID del nodo
        } else {
          console.error("La función showSummaryModal no está definida.");
          alert(`Resumen para OVC ID: ${d.id}\n(Función modal no encontrada)`); // Fallback
        }
      });
  
    // Añadir tooltips
    node
      .append("title")
      .text((d) => {
        const asignaturasText = d.asignaturas && d.asignaturas.length > 0 
          ? `Asignaturas: ${d.asignaturas.join(", ")}` 
          : "Asignatura: Sin Asignatura";
        return `${d.label}
Semestre: ${d.semestre}
${asignaturasText}
Desc: ${d.descripcion || "N/A"}`;
      });
  
    // Crear etiquetas para los nodos
    const nodeLabel = g
      .append("g")
      .attr("class", "node-labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "node-label")
      // dx se ajusta en la función ticked ahora
      .attr("dy", ".35em") // Mantener alineación vertical
      .style("font-size", "8px") // Reducir tamaño de fuente
      .text((d) => d.label);
  
    // Funcionalidad de zoom y paneo
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform); // Aplicar transformación al grupo 'g'
      });
      
    // Aplicar zoom al SVG y deshabilitar doble clic
    svg.call(zoom)
       .on("dblclick.zoom", null);
       
    // Aplicar un zoom inicial para centrar el grafo
    const initialTransform = d3.zoomIdentity.translate(width/2, height/2).scale(0.8);
    svg.call(zoom.transform, initialTransform);
  
    // --- Zoom Inicial para Ajustar el Grafo ---
    // Aplicamos un enfoque simplificado para el zoom inicial
    setTimeout(() => {
      try {
        // Calcular el centro del SVG
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Aplicar un zoom fijo que centre el grafo
        const fixedScale = 0.7; // Escala fija para asegurar que todo sea visible
        
        // Crear la transformación
        const transform = d3.zoomIdentity
          .translate(centerX, centerY)
          .scale(fixedScale)
          .translate(-centerX, -centerY);
        
        // Aplicar la transformación con una transición suave
        svg.transition()
           .duration(500)
           .call(zoom.transform, transform);
           
        console.log("DEBUG: Zoom inicial aplicado con enfoque simplificado.");
      } catch (error) {
        console.error("Error aplicando el zoom inicial:", error);
      }
    }, 500); // Reducir el tiempo de espera para una respuesta más rápida
  
    // --- Leyendas (Colores y Formas) ---
    const legendGroup = svg
      .append("g")
      .attr("class", "legends")
      .attr("transform", "translate(10, 10)"); // Posicionar en la esquina superior izquierda
  
    let currentLegendY = 0; // Para rastrear la posición vertical actual de la leyenda
  
    // Leyenda de Colores (Asignaturas)
    if (asignaturas.length > 0) {
      const colorLegend = legendGroup
        .append("g")
        .attr("class", "legend legend-color")
        .attr("transform", `translate(0, ${currentLegendY})`);
  
      colorLegend
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "-0.5em")
        .style("font-weight", "bold")
        .style("font-size", "10px")
        .text("Asignaturas (Colores Base):");
  
      currentLegendY += 15; // Espacio para el título
      
      // Limitar a 10 asignaturas en la leyenda para no ocupar demasiado espacio
      const maxAsignaturasToShow = Math.min(10, asignaturas.length);
      const displayAsignaturas = asignaturas.slice(0, maxAsignaturasToShow);
      
      // Mostrar colores base de asignaturas
      displayAsignaturas.forEach((asignatura, i) => {
        const legendItem = colorLegend
          .append("g")
          .attr("transform", `translate(0, ${i * 16})`);
        legendItem
          .append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", colorScale(asignatura))
          .attr("stroke", "#000")
          .attr("stroke-width", 0.5);
        legendItem
          .append("text")
          .attr("x", 16)
          .attr("y", 6)
          .attr("dy", ".35em")
          .style("font-size", "9px")
          .text(asignatura);
        currentLegendY += 16;
      });
      
      // Mostrar mensaje si hay más asignaturas
      if (asignaturas.length > maxAsignaturasToShow) {
        colorLegend
          .append("text")
          .attr("x", 0)
          .attr("y", maxAsignaturasToShow * 16)
          .attr("dy", ".35em")
          .style("font-size", "9px")
          .style("font-style", "italic")
          .text(`... y ${asignaturas.length - maxAsignaturasToShow} más`);
        currentLegendY += 20;
      }
      
      // Añadir ejemplos de colores mezclados
      currentLegendY += 8; // Espacio adicional
      
      // Título para ejemplos de mezclas
      colorLegend
        .append("text")
        .attr("x", 0)
        .attr("y", currentLegendY)
        .style("font-weight", "bold")
        .style("font-size", "10px")
        .text("Ejemplos de Mezclas:");
      currentLegendY += 20;
      
      // Crear algunos ejemplos de mezclas si hay suficientes asignaturas
      if (asignaturas.length >= 2) {
        // Ejemplo 1: Mezcla de dos asignaturas
        const ejemplo1 = colorLegend
          .append("g")
          .attr("transform", `translate(0, ${currentLegendY})`);
        
        const color1 = colorScale(asignaturas[0]);
        const color2 = colorScale(asignaturas[1]);
        const mezcla1 = blendColors([color1, color2]);
        
        ejemplo1
          .append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", mezcla1)
          .attr("stroke", "#000")
          .attr("stroke-width", 0.5);
        ejemplo1
          .append("text")
          .attr("x", 16)
          .attr("y", 6)
          .attr("dy", ".35em")
          .style("font-size", "9px")
          .text(`${asignaturas[0]} + ${asignaturas[1]}`);
        currentLegendY += 16;
        
        // Ejemplo 2: Mezcla de tres asignaturas (si hay suficientes)
        if (asignaturas.length >= 3) {
          const ejemplo2 = colorLegend
            .append("g")
            .attr("transform", `translate(0, ${currentLegendY})`);
          
          const color3 = colorScale(asignaturas[2]);
          const mezcla2 = blendColors([color1, color2, color3]);
          
          ejemplo2
            .append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", mezcla2)
            .attr("stroke", "#000")
            .attr("stroke-width", 0.5);
          ejemplo2
            .append("text")
            .attr("x", 16)
            .attr("y", 6)
            .attr("dy", ".35em")
            .style("font-size", "8px") // Reducir tamaño de fuente
            .text(`${asignaturas[0]} + ${asignaturas[1]} + ${asignaturas[2]}`);
          currentLegendY += 18;
        }
      }
    }
  
    currentLegendY += 15; // Espacio entre leyendas
  
    // Leyenda de Formas (Semestres)
    if (semestres.length > 0) {
      const shapeLegend = legendGroup
        .append("g")
        .attr("class", "legend legend-shape")
        .attr("transform", `translate(0, ${currentLegendY})`);
  
      shapeLegend
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "-0.5em")
        .style("font-weight", "bold")
        .style("font-size", "10px")
        .text("Semestres:");
  
      currentLegendY += 20; // Espacio para el título
  
      semestres.slice(0, shapes.length).forEach((semestre, i) => {
        // Iterar sobre semestres con forma asignada
        const shapeFunc = shapeScale(semestre);
        if (!shapeFunc) return; // Saltar si no hay forma asignada
  
        const legendItem = shapeLegend
          .append("g")
          .attr("transform", `translate(0, ${i * 16})`); // Más espacio vertical para formas
  
        // Dibujar la forma de la leyenda
        legendItem
          .append("path")
          .attr("d", d3.symbol().type(shapeFunc).size(50)()) // Tamaño más pequeño para leyenda
          .attr("transform", "translate(6, 6)") // Centrar un poco la forma
          .attr("fill", "#ccc"); // Usar un color neutro para la forma
  
        legendItem
          .append("text")
          .attr("x", 16) // Ajustar posición X del texto
          .attr("y", 6)
          .attr("dy", ".35em")
          .style("font-size", "9px")
          .text(semestre);
        currentLegendY += 16;
      });
    }
  
    // Resaltado al pasar el cursor (hover)
    node
      .on("mouseover", function (event, d) {
        d3.select(this).raise().attr("stroke-width", 3).attr("stroke", "black");
        link
          .style("stroke-opacity", (l) =>
            l.source === d || l.target === d ? 1 : 0.1
          )
          .style("stroke", (l) =>
            l.source === d || l.target === d ? "black" : "#999"
          )
          .style("stroke-width", (l) =>
            l.source === d || l.target === d ? 2.5 : 1.5
          );
        linkLabel.style("opacity", (l) =>
          l.source === d || l.target === d ? 1 : 0.3
        );
        node.style("opacity", (n) => {
          if (n === d) return 1;
          let isNeighbor = false;
          links.forEach((l) => {
            if (
              (l.source.id === d.id && l.target.id === n.id) ||
              (l.target.id === d.id && l.source.id === n.id)
            ) {
              isNeighbor = true;
            }
          });
          return isNeighbor ? 1 : 0.3;
        });
        nodeLabel.style("opacity", (n) => {
          if (n === d) return 1;
          let isNeighbor = false;
          links.forEach((l) => {
            if (
              (l.source.id === d.id && l.target.id === n.id) ||
              (l.target.id === d.id && l.source.id === n.id)
            ) {
              isNeighbor = true;
            }
          });
          return isNeighbor ? 1 : 0.3;
        });
      })
      .on("mouseout", function (event, d) {
        node.attr("stroke-width", 1.5).attr("stroke", "#fff").style("opacity", 1);
        link
          .style("stroke-opacity", 0.6)
          .style("stroke", "#999")
          .style("stroke-width", 1.5);
        linkLabel.style("opacity", 1);
        nodeLabel.style("opacity", 1);
      }); // Fin del .on('mouseout');
  }
  
  // Ejemplo de cómo llamarlo (asegúrate de que exista un <svg id="rizoma-container"></svg> en tu HTML)
  // verRizoma('#rizoma-container');
  // O si quieres que se ejecute al cargar la página:
  // document.addEventListener('DOMContentLoaded', () => {
  //     verRizoma('#rizoma-container');
  // });
  
  // Función para renderizar el grafo de rizoma
  function renderRizomaGraph() {
    console.log('DEBUG: Ejecutando renderRizomaGraph');
    // Verificar que D3 esté disponible
    if (typeof d3 === 'undefined') {
      console.error('ERROR: D3.js no está disponible. Asegúrate de que se haya cargado correctamente.');
      return;
    }
    
    // Verificar que el elemento SVG exista
    const svgElement = document.getElementById('rizoma-graph');
    if (!svgElement) {
      console.error('ERROR: No se encontró el elemento SVG con ID rizoma-graph');
      return;
    }
    
    console.log('DEBUG: D3 y elemento SVG disponibles, llamando a verRizoma');
    // Usar el ID correcto del elemento SVG en el HTML
    verRizoma('#rizoma-graph');
  }
  
  // Exportar las funciones globalmente
  window.renderRizomaGraph = renderRizomaGraph;
  window.verRizoma = verRizoma;
  
  // Ejemplo de cómo llamarlo (asegúrate de que exista un <svg id="rizoma-container"></svg> en tu HTML)
  // verRizoma('#rizoma-container');
  // window.verRizoma ya se exportó en renderRizomaGraph
  