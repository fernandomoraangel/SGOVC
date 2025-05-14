# Plan Detallado: Migración del Almacenamiento a Archivos JSON

El objetivo de este plan es reemplazar el sistema de almacenamiento actual por uno basado en archivos JSON locales, implementando la persistencia de datos de forma incremental, empezando por los OVCs, seguido por las Rúbricas y Evaluaciones.

## Fase 1: Implementación del Almacenamiento para OVCs

1.  **Preparación del Entorno de Datos:**
    *   Crear el directorio `./data/` en la raíz del proyecto si no existe.
    *   Crear el archivo `./data/ovcs.json` con un array JSON vacío `[]` inicialmente.

2.  **Carga de Datos de OVCs:**
    *   Identificar el código JavaScript responsable de inicializar y gestionar los datos de los OVCs (probablemente en `js/main.js` o un archivo similar).
    *   Modificar este código para que, al cargar la aplicación, intente leer el contenido del archivo `./data/ovcs.json`.
    *   Si el archivo existe y contiene JSON válido, cargar los datos en una variable global o en un objeto de gestión de datos en memoria (ej. un array de objetos JavaScript).
    *   Si el archivo no existe o está vacío, inicializar la estructura de datos en memoria como un array vacío.

3.  **Guardado de Datos de OVCs:**
    *   Implementar una función JavaScript que tome el array de OVCs en memoria, lo serialice a una cadena JSON y lo escriba en el archivo `./data/ovcs.json` utilizando la herramienta `write_to_file`.
    *   Esta función debe ser llamada cada vez que se realice una operación que modifique el array de OVCs en memoria (crear, editar, eliminar).

4.  **Integración con la Interfaz de Usuario (UI) de OVCs:**
    *   Adaptar las funciones JavaScript que manejan la visualización de la lista de OVCs (`listar-section` en `pages/index.html`) para que lean los datos desde la estructura de datos de OVCs cargada en memoria.
    *   Modificar las funciones que manejan el formulario de creación y edición de OVCs (`crear-section` en `pages/index.html`) para que:
        *   Al cargar para edición, pueblen el formulario con los datos del OVC correspondiente desde la memoria.
        *   Al guardar (crear o actualizar), modifiquen la estructura de datos de OVCs en memoria y luego llamen a la función de guardado en `./data/ovcs.json`.
    *   Adaptar la función de eliminación de OVCs para que elimine el OVC de la estructura en memoria y luego llame a la función de guardado.

5.  **Generación de IDs Únicos para OVCs:**
    *   Implementar una lógica simple para generar IDs únicos para los nuevos OVCs creados (ej. usando `Date.now()`, una combinación de fecha/hora y un contador, o una librería simple para UUIDs si se considera necesario).

6.  **Verificación de la Persistencia de OVCs:**
    *   Ejecutar la aplicación.
    *   Crear varios OVCs utilizando el formulario.
    *   Recargar la aplicación (cerrar y volver a abrir).
    *   Verificar que los OVCs creados previamente se cargan y se muestran correctamente en la lista.
    *   Editar y eliminar algunos OVCs.
    *   Recargar la aplicación nuevamente y verificar que los cambios (ediciones y eliminaciones) persisten.

## Fase 2: Implementación del Almacenamiento para Rúbricas

1.  **Preparación del Archivo JSON de Rúbricas:**
    *   Crear el archivo `./data/rubricas.json` con un array JSON vacío `[]` inicialmente.

2.  **Carga y Guardado de Datos de Rúbricas:**
    *   Implementar la carga de datos desde `./data/rubricas.json` al iniciar la aplicación, similar al paso 2 de la Fase 1.
    *   Implementar una función de guardado para serializar y escribir el array de Rúbricas en memoria a `./data/rubricas.json`, similar al paso 3 de la Fase 1.

3.  **Integración con la UI de Rúbricas:**
    *   Adaptar las funciones JavaScript que manejan el diseño de rúbricas (probablemente en `pages/disenar_rubrica.html` y su JS asociado) para que utilicen los datos de rúbricas cargados en memoria y llamen a la función de guardado después de crear, editar o eliminar rúbricas.
    *   Implementar la generación de IDs únicos para las nuevas Rúbricas.

4.  **Verificación de la Persistencia de Rúbricas:**
    *   Ejecutar la aplicación.
    *   Crear, editar y eliminar Rúbricas utilizando la interfaz.
    *   Recargar la aplicación y verificar que los cambios persisten.

## Fase 3: Implementación del Almacenamiento para Evaluaciones

1.  **Preparación del Archivo JSON de Evaluaciones:**
    *   Crear el archivo `./data/evaluaciones.json` con un array JSON vacío `[]` inicialmente.

2.  **Carga y Guardado de Datos de Evaluaciones:**
    *   Implementar la carga de datos desde `./data/evaluaciones.json` al iniciar la aplicación.
    *   Implementar una función de guardado para serializar y escribir el array de Evaluaciones en memoria a `./data/evaluaciones.json`.

3.  **Integración con la UI de Evaluaciones:**
    *   Adaptar las funciones JavaScript que manejan la evaluación de OVCs (probablemente en `pages/evaluar_ovc.html` y su JS asociado) para que:
        *   Carguen las rúbricas disponibles desde la estructura de datos de Rúbricas en memoria.
        *   Al guardar una evaluación, creen un nuevo objeto Evaluación con los IDs correctos (`ovc_id`, `rubrica_id`, `evaluador_id`), la fecha, los resultados, el porcentaje y el feedback, lo añadan a la estructura de datos de Evaluaciones en memoria y llamen a la función de guardado.
    *   Implementar la generación de IDs únicos para las nuevas Evaluaciones.

4.  **Integración con la Visualización de Promedios:**
    *   Adaptar las funciones JavaScript que manejan la visualización de promedios (probablemente en `pages/ver_promedios.html` y su JS asociado) para que calculen los promedios a partir de los datos de Evaluaciones cargados en memoria, relacionándolos con los OVCs y Rúbricas según los IDs.

5.  **Verificación de la Persistencia de Evaluaciones y Promedios:**
    *   Ejecutar la aplicación.
    *   Realizar varias evaluaciones para diferentes OVCs utilizando distintas rúbricas, incluyendo feedback y porcentajes.
    *   Recargar la aplicación y verificar que las evaluaciones persisten.
    *   Verificar que la sección de promedios muestra los cálculos correctos basados en los datos persistidos.

## Fase 4: Consideración Inicial de otras Entidades (Usuarios, Cursos, Foros, Versiones, Colaboradores)

1.  **Preparación de Archivos JSON:**
    *   Crear los archivos `./data/usuarios.json`, `./data/cursos.json`, y `./data/foros.json` con arrays JSON vacíos `[]`.

2.  **Carga Inicial:**
    *   Incluir la carga de estos archivos JSON vacíos al inicio de la aplicación (Paso 2 de la Fase 1).

3.  **Estructuras en Memoria:**
    *   Mantener estructuras de datos en memoria (arrays vacíos por ahora) para Usuarios, Cursos y Foros.

4.  **Relaciones en OVCs:**
    *   Asegurar que la estructura de datos de OVCs en memoria pueda manejar los campos `asignaturas_ids`, `historial_versiones`, y `colaboradores` según lo definido en `estructura_datos.md`. La lógica para manipular estas sub-estructuras se implementará en esta fase para OVCs, aunque la lógica completa de las entidades relacionadas (crear usuarios, gestionar versiones completas, etc.) se pospondrá.

## Fase 5: Kanban (Posponer)

*   La implementación del almacenamiento y la lógica para los datos de Kanban (`./data/kanban.json`) se pospondrá para una fase posterior.