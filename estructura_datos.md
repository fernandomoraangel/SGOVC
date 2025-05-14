# Estructura de Datos del Sistema SGOVC

Este documento describe las estructuras propuestas para almacenar los datos del Sistema de Gestión de Objetos Virtuales Creativos (SGOVC) utilizando archivos JSON. Las estructuras se basan en el análisis de `index.html`, `diagrama_clases_sgovc.md` y `use_cases.md`.

## 1. Estructura JSON para OVCs

Representa la información principal de cada Objeto Virtual Creativo. Se almacenará como un array de objetos OVC.

```json
[
  {
    "id": "string", // Identificador único del OVC
    "titulo": "string",
    "descripcion": "string",
    "imagen_portada": "string", // URL o ruta relativa a la imagen de portada
    "fecha_creacion": "string", // Fecha de creación del OVC (formato ISO 8601 recomendado)
    "semestre": "string", // Semestre académico asociado (Ej: "2025-1")
    "tipo_licenciamiento": "string", // Tipo de licencia (Ej: "CC BY")
    "visibilidad": "string", // Nivel de visibilidad (Ej: "Privado", "Público", "Miembros del Curso", "Institucional")
    "asignaturas_ids": ["string"], // Array de IDs de los cursos a los que está asociado el OVC
    "etiquetas": ["string"], // Array de etiquetas/palabras clave
    "autores": [
      {
        "nombre": "string",
        "rol": "string",
        "email": "string",
        "participacion": "number" // Porcentaje de participación
      }
    ],
    "enlaces_externos": [
      {
        "descripcion": "string",
        "url": "string"
      }
    ],
    "archivo_principal": { // Estructura detallada del archivo principal
      "nombre": "string",
      "tipo": "string",
      "url": "string" // URL o ruta relativa al archivo
    },
    "relaciones": [
      {
        "ovc_relacionado_id": "string", // ID del OVC relacionado
        "etiqueta": "string", // Descripción de la relación (Ej: "Se basa en")
        "direccion": "string" // Dirección de la relación ("saliente", "entrante", "bidireccional")
      }
    ],
    "historial_versiones": [ // Historial de versiones del OVC
      {
        "id": "string", // ID único de la versión
        "ovc_id": "string", // ID del OVC al que pertenece esta versión
        "fecha_creacion": "string", // Fecha en que se creó esta versión (formato ISO 8601)
        "autor_id": "string", // ID del usuario que creó esta versión
        "descripcion": "string", // Descripción o etiqueta de la versión
        "contenido_ovc": {} // Objeto que representa el estado del OVC en esta versión (puede ser una instantánea parcial o total de los datos del OVC, excluyendo datos versionados externamente como Kanban y Foro)
      }
    ],
    "colaboradores": [ // Lista de colaboradores del OVC
      {
        "usuario_id": "string", // ID del usuario colaborador
        "rol": "string", // Rol del colaborador (Ej: "Editor")
        "fecha_adicion": "string" // Fecha en que se añadió como colaborador (formato ISO 8601)
      }
    ],
    "estado_exportacion_videojuego": "string", // Estado actual del proceso de exportación al videojuego
    "fitness_score": "number", // Puntuación de aptitud (concepto memético/evolutivo)
    "generation": "number", // Generación evolutiva (concepto memético/evolutivo)
    "parent_ovc_ids": ["string"], // IDs de los OVCs de los cuales este OVC fue derivado (concepto memético/evolutivo)
    "memetic_code": "string", // Código memético/genético (concepto memético/evolutivo)
    "objetivos_aprendizaje": ["string"], // Objetivos de aprendizaje (concepto OVA)
    "audiencia_meta": ["string"], // Audiencia a la que está dirigido (concepto OVA)
    "requisitos_previos": ["string"], // Requisitos previos para su uso (concepto OVA)
    "tiempo_estimado_aprendizaje": "string", // Tiempo estimado para el aprendizaje (concepto OVA)
    "metadatos_educativos": {} // Objeto para metadatos educativos estandarizados (concepto OVA)
  }
]
```

## 2. Estructura JSON para Datos de Kanban

Representa el estado del tablero Kanban para una versión específica de un OVC. Se almacenará como un array de objetos Kanban.

```json
[
  {
    "id": "string", // ID único para este estado de Kanban (opcional)
    "ovc_id": "string", // ID del OVC asociado
    "ovc_version_id": "string", // ID de la versión del OVC a la que pertenece este estado de Kanban
    "todo": [ // Array de tareas en la columna "Por hacer"
      {
        "id": "string", // ID único de la tarea
        "titulo": "string",
        "color": "string", // Color asociado a la tarea
        "subtareas": [ // Array de subtareas de la tarea
          {
            "id": "string", // ID único de la subtarea
            "descripcion": "string",
            "completada": "boolean" // Estado de completado de la subtarea
          }
        ],
        "responsables_ids": ["string"], // Array de IDs de los usuarios responsables de la tarea
        "fecha_limite": "string" // Fecha límite de la tarea (formato ISO 8601 recomendado)
      }
    ],
    "in_progress": [ // Array de tareas en la columna "En progreso"
       // Estructura similar a "todo"
    ],
    "done": [ // Array de tareas en la columna "Hecho"
       // Estructura similar a "todo"
    ]
    // Pueden añadirse otras columnas si el diseño del Kanban lo requiere
  }
]
```

## 3. Estructura JSON para Foros

Representa los foros de discusión asociados a las versiones de los OVCs. Se almacenará como un array de objetos Foro.

```json
[
  {
    "id": "string", // ID único del foro
    "ovc_id": "string", // ID del OVC asociado
    "ovc_version_id": "string", // ID de la versión del OVC a la que pertenece este foro
    "titulo": "string", // Título del foro (podría ser el título del OVC o específico del foro)
    "temas": [ // Array de temas de discusión en el foro
      {
        "id": "string", // ID único del tema
        "titulo": "string", // Título del tema
        "autor_id": "string", // ID del usuario que creó el tema
        "fecha_creacion": "string", // Fecha de creación del tema (formato ISO 8601)
        "mensajes": [ // Array de mensajes dentro del tema
          {
            "id": "string", // ID único del mensaje
            "autor_id": "string", // ID del usuario que publicó el mensaje
            "contenido": "string",
            "fecha_publicacion": "string", // Fecha de publicación del mensaje (formato ISO 8601)
            "mensaje_padre_id": "string" // ID del mensaje al que responde (para hilos), null si es mensaje principal
          }
        ]
      }
    ]
  }
]
```

## 4. Estructura JSON para Rúbricas

Representa una rúbrica de evaluación. Se almacenará como un array de objetos Rúbrica.

```json
[
  {
    "id": "string", // ID único de la rúbrica
    "nombre": "string",
    "descripcion": "string",
    "autor_id": "string", // ID del usuario que diseñó la rúbrica
    "criterios": [ // Array de criterios de evaluación
      {
        "nombre": "string", // Nombre del criterio
        "descripcion": "string", // Descripción del criterio
        "niveles": [ // Array de niveles de desempeño para el criterio
          {
            "nombre": "string", // Nombre del nivel (Ej: "Sobresaliente")
            "descripcion": "string", // Descripción del nivel
            "puntuacion": "number" // Puntuación asociada al nivel
          }
        ]
      }
    ]
  }
]
```

## 5. Estructura JSON para Evaluaciones

Representa una evaluación de un OVC utilizando una rúbrica. Se almacenará como un array de objetos Evaluación.

```json
[
  {
    "id": "string", // ID único de la evaluación
    "ovc_id": "string", // ID del OVC evaluado
    "rubrica_id": "string", // ID de la rúbrica utilizada
    "evaluador_id": "string", // ID del usuario que realizó la evaluación
    "fecha_evaluacion": "string", // Fecha de la evaluación (formato ISO 8601 recomendado)
    "resultados": {}, // Objeto con resultados detallados por criterio/nivel (ej: {"criterio1_id": "nivel_obtenido_id", ...})
    "puntuacion_total": "number", // Puntuación total obtenida en la evaluación
    "porcentaje_evaluacion": "number", // Porcentaje que esta evaluación representa del total del OVC
    "feedback": "string" // Campo para el feedback o comentarios de la evaluación
  }
]
```

## 6. Estructura JSON para Usuarios

Representa un usuario del sistema. Se almacenará como un array de objetos Usuario.

```json
[
  {
    "id": "string", // ID único del usuario
    "nombre": "string",
    "rol": "string", // Rol del usuario ("Estudiante", "Profesor", "Administrador", "Invitado")
    "email": "string"
    // Pueden añadirse otros datos del usuario si son necesarios
  }
]
```

## 7. Estructura JSON para Cursos

Representa un curso académico. Se almacenará como un array de objetos Curso.

```json
[
  {
    "id": "string", // ID único del curso
    "nombre": "string",
    "codigo": "string",
    "semestre": "string", // Semestre en que se imparte el curso (Ej: "2025-1")
    "profesor_id": "string", // ID del usuario profesor asociado al curso
    "estudiantes_ids": ["string"] // Array de IDs de los usuarios estudiantes matriculados en el curso
  }
]