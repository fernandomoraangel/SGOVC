# Documento de Casos de Uso - SGOVC

## 1. Introducción

Este documento describe los casos de uso para el Sistema de Gestión de Objetos Virtuales Creativos (SGOVC), una aplicación diseñada para apoyar el proceso de creación, gestión y evaluación de OVCs en el contexto de un programa de pregrado en creación digital. El sistema facilita la interacción entre estudiantes, profesores, administradores e invitados, proporcionando herramientas para la gestión de proyectos (Kanban), visualización de relaciones (Rizoma), comunicación (Foro), y un sistema robusto de evaluación basado en rúbricas.

## 2. Actores

Los actores principales que interactúan con el sistema son:

*   **Estudiante:** Usuario que crea y gestiona sus propios Objetos Virtuales Creativos (OVCs), utiliza el tablero Kanban para el seguimiento de su proyecto, visualiza el Rizoma y participa en los foros asociados a los OVCs.
*   **Profesor:** Usuario que supervisa el proceso de creación de OVCs, diseña y utiliza rúbricas para la evaluación, visualiza promedios de evaluación, resume rúbricas, visualiza el Rizoma y participa en los foros. Tiene visibilidad sobre todos los OVCs.
*   **Administrador:** Usuario con control total sobre todas las funcionalidades del sistema, incluyendo la gestión de usuarios, OVCs, rúbricas, evaluaciones, tableros Kanban y foros.
*   **Invitado:** Usuario externo que puede visualizar los OVCs públicos y participar en el proceso de evaluación utilizando rúbricas designadas para invitados.

## 3. Casos de Uso

### 3.1. Gestión de OVCs

**UC-101: Crear OVC**

*   **Goal:** El Estudiante desea registrar un nuevo Objeto Virtual Creativo en el sistema.
*   **Actor(s):** Estudiante
*   **Preconditions:** El Estudiante ha iniciado sesión en el sistema.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Estudiante accede a la sección de creación de OVCs.
        2.  El sistema presenta un formulario para ingresar los detalles del OVC (título, descripción, archivos, etc.).
        3.  El Estudiante completa el formulario y envía la información.
        4.  El sistema valida los datos y crea el nuevo OVC asociado al Estudiante.
        5.  El sistema muestra un mensaje de confirmación y redirige al Estudiante a la vista de su OVC recién creado o a la lista de sus OVCs.
*   **Postconditions:** Se ha creado un nuevo OVC en el sistema, asociado al Estudiante.

**UC-102: Ver Lista de OVCs**

*   **Goal:** Un Actor desea visualizar la lista de OVCs disponibles en el sistema.
*   **Actor(s):** Estudiante, Profesor, Administrador, Invitado
*   **Preconditions:** El Actor ha accedido a la sección de OVCs.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede a la sección de OVCs.
        2.  El sistema recupera la lista de OVCs a los que el Actor tiene permiso de acceso (Estudiante: propios; Profesor, Administrador, Invitado: todos).
        3.  El sistema muestra la lista de OVCs, incluyendo información relevante como título, autor (para roles con permiso), y posiblemente una breve descripción o miniatura.
*   **Postconditions:** El Actor puede visualizar la lista de OVCs según sus permisos.

**UC-103: Ver Detalles de OVC**

*   **Goal:** Un Actor desea ver la información detallada de un OVC específico.
*   **Actor(s):** Estudiante, Profesor, Administrador, Invitado
*   **Preconditions:** El Actor está visualizando una lista de OVCs o tiene acceso directo a un OVC. El Actor tiene permisos para ver el OVC.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor selecciona un OVC de la lista o accede a él directamente.
        2.  El sistema recupera los detalles completos del OVC seleccionado (descripción, archivos adjuntos, metadatos, etc.).
        3.  El sistema muestra la vista detallada del OVC.
*   **Postconditions:** El Actor puede visualizar toda la información detallada del OVC.

**UC-104: Editar OVC**

*   **Goal:** Un Actor desea modificar la información de un OVC existente.
*   **Actor(s):** Estudiante, Administrador
*   **Preconditions:** El Actor ha iniciado sesión y tiene permisos para editar el OVC (Estudiante: propio; Administrador: cualquiera). El Actor está visualizando los detalles del OVC.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor, desde la vista de detalles del OVC, selecciona la opción de editar.
        2.  El sistema presenta un formulario pre-llenado con la información actual del OVC.
        3.  El Actor realiza las modificaciones necesarias en el formulario.
        4.  El Actor guarda los cambios.
        5.  El sistema valida los datos y actualiza la información del OVC.
        6.  El sistema muestra un mensaje de confirmación y redirige a la vista de detalles del OVC actualizado.
*   **Postconditions:** La información del OVC ha sido actualizada en el sistema.

**UC-105: Eliminar OVC**

*   **Goal:** El Administrador desea eliminar un OVC del sistema.
*   **Actor(s):** Administrador
*   **Preconditions:** El Administrador ha iniciado sesión y tiene permisos para eliminar el OVC. El Administrador está visualizando los detalles del OVC o una lista de OVCs.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Administrador selecciona la opción de eliminar para un OVC específico.
        2.  El sistema solicita confirmación para la eliminación.
        3.  El Administrador confirma la eliminación.
        4.  El sistema elimina el OVC y toda la información asociada (evaluaciones, tareas de Kanban, temas de foro relacionados, etc.).
        5.  El sistema muestra un mensaje de confirmación y redirige a la lista de OVCs.
*   **Postconditions:** El OVC y su información asociada han sido eliminados del sistema.

### 3.2. Sistema de Evaluación

**UC-201: Diseñar Rúbrica**

*   **Goal:** Un Actor desea crear una nueva rúbrica de evaluación.
*   **Actor(s):** Profesor, Administrador
*   **Preconditions:** El Actor ha iniciado sesión y tiene permisos para diseñar rúbricas.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede a la sección de diseño de rúbricas.
        2.  El sistema presenta una interfaz para definir los criterios de evaluación, niveles de desempeño y puntuaciones.
        3.  El Actor define la estructura y contenido de la rúbrica.
        4.  El Actor guarda la rúbrica.
        5.  El sistema valida la rúbrica y la guarda en el sistema.
        6.  El sistema muestra un mensaje de confirmación y redirige a la lista de rúbricas.
    *   **Alternative Flow - Generar con IA:**
        *   3a. El Actor utiliza la opción de generar rúbrica con IA, proporcionando un tema o descripción.
        *   3b. El sistema interactúa con la API de Google Gemini para generar una propuesta de rúbrica.
        *   3c. El Actor revisa y ajusta la rúbrica generada por IA.
        *   (Continúa en el paso 4 del flujo básico)
*   **Postconditions:** Se ha creado una nueva rúbrica en el sistema.

**UC-202: Evaluar OVC Usando Rúbrica**

*   **Goal:** Un Actor desea evaluar un OVC utilizando una rúbrica existente.
*   **Actor(s):** Profesor, Administrador, Invitado
*   **Preconditions:** El Actor tiene permisos para evaluar OVCs. Existe al menos un OVC y una rúbrica disponible para la evaluación.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede a la sección de evaluación de OVCs.
        2.  El sistema presenta una lista de OVCs a evaluar y las rúbricas disponibles.
        3.  El Actor selecciona un OVC y una rúbrica.
        4.  El sistema muestra la interfaz de evaluación, presentando el OVC (o un enlace a él) y la rúbrica seleccionada.
        5.  El Actor revisa el OVC y selecciona los niveles de desempeño para cada criterio de la rúbrica.
        6.  El Actor guarda la evaluación.
        7.  El sistema calcula la puntuación de la evaluación y la guarda asociada al OVC, la rúbrica y el Actor evaluador.
        8.  El sistema muestra un mensaje de confirmación.
*   **Postconditions:** Se ha registrado una evaluación para el OVC utilizando la rúbrica seleccionada.

**UC-203: Ver Promedios de Evaluación de OVC**

*   **Goal:** Un Actor desea ver las puntuaciones promedio de las evaluaciones de un OVC.
*   **Actor(s):** Profesor, Administrador
*   **Preconditions:** El Actor ha iniciado sesión y tiene permisos para ver promedios de evaluación. Existen OVCs con evaluaciones registradas.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede a la sección de promedios de evaluación.
        2.  El sistema presenta una lista de OVCs.
        3.  El Actor selecciona un OVC.
        4.  El sistema calcula y muestra las puntuaciones promedio del OVC, posiblemente desglosadas por rúbrica o criterio.
*   **Postconditions:** El Actor puede visualizar los promedios de evaluación del OVC seleccionado.

**UC-204: Resumir Rúbricas**

*   **Goal:** Un Actor desea obtener un resumen o análisis de las rúbricas existentes.
*   **Actor(s):** Profesor, Administrador
*   **Preconditions:** El Actor ha iniciado sesión y tiene permisos para resumir rúbricas. Existen rúbricas en el sistema.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede a la sección de resumen de rúbricas.
        2.  El sistema presenta una lista de rúbricas o una interfaz para seleccionar criterios de resumen.
        3.  El Actor selecciona las rúbricas a resumir o los criterios de resumen.
        4.  El sistema genera y muestra un resumen de las rúbricas seleccionadas (ej. número de rúbricas, criterios comunes, etc.).
*   **Postconditions:** El Actor obtiene un resumen de las rúbricas.

**UC-205: Ver Lista de Rúbricas**

*   **Goal:** Un Actor desea visualizar la lista de rúbricas disponibles en el sistema.
*   **Actor(s):** Profesor, Administrador, Invitado
*   **Preconditions:** El Actor ha accedido a la sección de rúbricas o evaluación.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede a la sección de rúbricas.
        2.  El sistema recupera la lista de rúbricas a las que el Actor tiene permiso de acceso (Profesor, Administrador: todas; Invitado: posiblemente solo las designadas para evaluación de invitados).
        3.  El sistema muestra la lista de rúbricas, incluyendo información relevante como título y autor (para roles con permiso).
*   **Postconditions:** El Actor puede visualizar la lista de rúbricas según sus permisos.

**UC-206: Ver Detalles de Rúbrica**

*   **Goal:** Un Actor desea ver la información detallada de una rúbrica específica.
*   **Actor(s):** Profesor, Administrador, Invitado
*   **Preconditions:** El Actor está visualizando una lista de rúbricas o tiene acceso directo a una rúbrica. El Actor tiene permisos para ver la rúbrica.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor selecciona una rúbrica de la lista o accede a ella directamente.
        2.  El sistema recupera los detalles completos de la rúbrica seleccionada (criterios, niveles de desempeño, puntuaciones).
        3.  El sistema muestra la vista detallada de la rúbrica.
*   **Postconditions:** El Actor puede visualizar toda la información detallada de la rúbrica.

**UC-207: Eliminar Rúbrica**

*   **Goal:** El Administrador desea eliminar una rúbrica del sistema.
*   **Actor(s):** Administrador
*   **Preconditions:** El Administrador ha iniciado sesión y tiene permisos para eliminar la rúbrica. El Administrador está visualizando los detalles de la rúbrica o una lista de rúbricas.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Administrador selecciona la opción de eliminar para una rúbrica específica.
        2.  El sistema solicita confirmación para la eliminación.
        3.  El Administrador confirma la eliminación.
        4.  El sistema elimina la rúbrica. (Nota: La eliminación de una rúbrica podría afectar evaluaciones existentes que la utilizaron; el sistema podría requerir manejo de esta situación, como archivar evaluaciones o desvincular la rúbrica).
        5.  El sistema muestra un mensaje de confirmación y redirige a la lista de rúbricas.
*   **Postconditions:** La rúbrica ha sido eliminada del sistema.

**UC-208: Realizar Evaluación como Invitado**

*   **Goal:** Un Invitado desea evaluar un OVC utilizando una rúbrica designada para invitados.
*   **Actor(s):** Invitado
*   **Preconditions:** El Invitado tiene acceso al sistema (posiblemente a través de un enlace público) y existe al menos un OVC y una rúbrica designada para evaluación de invitados.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Invitado accede a la sección de evaluación para invitados (posiblemente a través de un enlace específico).
        2.  El sistema presenta la lista de OVCs disponibles para evaluación de invitados y las rúbricas correspondientes.
        3.  El Invitado selecciona un OVC y una rúbrica.
        4.  El sistema muestra la interfaz de evaluación, presentando el OVC (o un enlace a él) y la rúbrica seleccionada.
        5.  El Invitado revisa el OVC y selecciona los niveles de desempeño para cada criterio de la rúbrica.
        6.  El Invitado guarda la evaluación.
        7.  El sistema calcula la puntuación de la evaluación y la guarda asociada al OVC, la rúbrica y registrando que fue una evaluación de invitado (posiblemente sin identificar al invitado individualmente a menos que se implemente un registro básico).
        8.  El sistema muestra un mensaje de confirmación.
*   **Postconditions:** Se ha registrado una evaluación de invitado para el OVC utilizando la rúbrica seleccionada.

### 3.3. Tablero Kanban

**UC-301: Usar Tablero Kanban**

*   **Goal:** Un Actor desea visualizar y organizar las tareas relacionadas con un OVC utilizando un tablero Kanban.
*   **Actor(s):** Estudiante, Administrador
*   **Preconditions:** El Actor ha iniciado sesión y tiene permisos para acceder al tablero Kanban (Estudiante: para su OVC; Administrador: para cualquier OVC). Existe al menos un OVC con un tablero Kanban asociado.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede a la sección del tablero Kanban, seleccionando el OVC si es necesario.
        2.  El sistema muestra el tablero Kanban asociado al OVC, con columnas (ej. To Do, In Progress, Done) y las tareas existentes.
        3.  El Actor puede visualizar las tareas y su estado.
*   **Postconditions:** El Actor puede visualizar el tablero Kanban del OVC.

**UC-302: Gestionar Tareas en Kanban (Crear, Editar, Mover, Eliminar)**

*   **Goal:** Un Actor desea administrar las tareas en un tablero Kanban.
*   **Actor(s):** Estudiante, Administrador
*   **Preconditions:** El Actor está visualizando un tablero Kanban al que tiene permisos de gestión.
*   **Flow of Events:**
    *   **Basic Flow - Crear Tarea:**
        1.  El Actor selecciona la opción para añadir una nueva tarea en una columna específica.
        2.  El sistema presenta una interfaz para ingresar los detalles de la tarea (título, descripción, sub-tareas, color, etc.).
        3.  El Actor completa los detalles y guarda la tarea.
        4.  El sistema crea la tarea y la añade a la columna seleccionada en el tablero Kanban.
        5.  El sistema actualiza la vista del tablero.
    *   **Basic Flow - Editar Tarea:**
        1.  El Actor selecciona una tarea existente para editar.
        2.  El sistema presenta una interfaz con los detalles actuales de la tarea pre-llenados.
        3.  El Actor modifica los detalles de la tarea.
        4.  El Actor guarda los cambios.
        5.  El sistema actualiza la tarea en el tablero Kanban.
        6.  El sistema actualiza la vista del tablero.
    *   **Basic Flow - Mover Tarea:**
        1.  El Actor arrastra una tarea de una columna a otra.
        2.  El sistema actualiza el estado de la tarea según la nueva columna.
        3.  El sistema actualiza la vista del tablero.
    *   **Basic Flow - Eliminar Tarea:**
        1.  El Actor selecciona una tarea para eliminar.
        2.  El sistema solicita confirmación para la eliminación.
        3.  El Actor confirma la eliminación.
        4.  El sistema elimina la tarea del tablero Kanban.
        5.  El sistema actualiza la vista del tablero.
*   **Postconditions:** Las tareas en el tablero Kanban han sido modificadas según la acción del Actor.

### 3.4. Visualización Rizoma

**UC-401: Ver Visualización Rizoma**

*   **Goal:** Un Actor desea visualizar la red de relaciones entre los OVCs.
*   **Actor(s):** Estudiante, Profesor, Administrador
*   **Preconditions:** El Actor ha iniciado sesión. Existen OVCs con relaciones definidas (implícito en la funcionalidad del Rizoma).
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede a la sección de visualización Rizoma.
        2.  El sistema recupera los datos de los OVCs y sus relaciones.
        3.  El sistema genera y muestra la visualización interactiva del Rizoma.
        4.  El Actor puede interactuar con la visualización (zoom, pan, ver detalles al pasar el mouse, etc.).
*   **Postconditions:** El Actor puede visualizar la red de OVCs en formato Rizoma.

### 3.5. Foro

**UC-501: Ver Foro de OVC**

*   **Goal:** Un Actor desea ver las discusiones asociadas a un OVC específico.
*   **Actor(s):** Estudiante, Profesor, Administrador
*   **Preconditions:** El Actor ha iniciado sesión. Existe un OVC con un foro asociado.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor accede al foro de un OVC específico (posiblemente desde la vista de detalles del OVC o una lista de foros).
        2.  El sistema muestra la lista de temas de discusión creados para ese OVC.
        3.  El Actor puede ver los títulos de los temas y un resumen del primer mensaje.
*   **Postconditions:** El Actor puede visualizar los temas del foro para el OVC seleccionado.

**UC-502: Crear Tema en Foro**

*   **Goal:** Un Actor desea iniciar una nueva discusión en el foro de un OVC.
*   **Actor(s):** Estudiante, Profesor, Administrador
*   **Preconditions:** El Actor ha iniciado sesión y tiene permisos para crear temas en el foro. El Actor está visualizando el foro de un OVC.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor selecciona la opción para crear un nuevo tema.
        2.  El sistema presenta un formulario para ingresar el título del tema y el contenido del primer mensaje.
        3.  El Actor completa el formulario y envía la información.
        4.  El sistema crea el nuevo tema en el foro del OVC, incluyendo el primer mensaje asociado al Actor.
        5.  El sistema muestra el nuevo tema en la lista de temas del foro.
*   **Postconditions:** Se ha creado un nuevo tema de discusión en el foro del OVC.

**UC-503: Crear Mensaje en Tema de Foro**

*   **Goal:** Un Actor desea responder a un tema de discusión existente en el foro de un OVC.
*   **Actor(s):** Estudiante, Profesor, Administrador
*   **Preconditions:** El Actor ha iniciado sesión y tiene permisos para crear mensajes en el foro. El Actor está visualizando un tema de discusión en el foro de un OVC.
*   **Flow of Events:**
    *   **Basic Flow:**
        1.  El Actor, desde la vista de un tema de discusión, accede a la sección para añadir un nuevo mensaje.
        2.  El sistema presenta un área de texto para ingresar el contenido del mensaje.
        3.  El Actor escribe su mensaje y lo envía.
        4.  El sistema crea el nuevo mensaje y lo añade al tema de discusión, asociado al Actor.
        5.  El sistema actualiza la vista del tema de discusión para incluir el nuevo mensaje.
*   **Postconditions:** Se ha añadido un nuevo mensaje al tema de discusión en el foro del OVC.

**UC-504: Moderar Foro (Eliminar Temas/Mensajes)**

*   **Goal:** El Administrador desea eliminar temas o mensajes inapropiados del foro.
*   **Actor(s):** Administrador
*   **Preconditions:** El Administrador ha iniciado sesión y tiene permisos de moderación. El Administrador está visualizando un foro, tema o mensaje.
*   **Flow of Events:**
    *   **Basic Flow - Eliminar Tema:**
        1.  El Administrador selecciona un tema para eliminar.
        2.  El sistema solicita confirmación para eliminar el tema y todos sus mensajes asociados.
        3.  El Administrador confirma la eliminación.
        4.  El sistema elimina el tema y todos los mensajes relacionados del foro.
        5.  El sistema actualiza la vista del foro.
    *   **Basic Flow - Eliminar Mensaje:**
        1.  El Administrador selecciona un mensaje específico dentro de un tema para eliminar.
        2.  El sistema solicita confirmación para eliminar el mensaje.
        3.  El Administrador confirma la eliminación.
        4.  El sistema elimina el mensaje del tema de discusión.
        5.  El sistema actualiza la vista del tema.
*   **Postconditions:** El tema o mensaje seleccionado ha sido eliminado del foro.

### 3.6. Administración

**UC-601: Gestionar Usuarios (Crear, Editar, Eliminar)**

*   **Goal:** El Administrador desea administrar las cuentas de usuario en el sistema.
*   **Actor(s):** Administrador
*   **Preconditions:** El Administrador ha iniciado sesión y tiene permisos de administración de usuarios.
*   **Flow of Events:**
    *   **Basic Flow - Crear Usuario:**
        1.  El Administrador accede a la sección de gestión de usuarios.
        2.  El sistema presenta una interfaz para crear un nuevo usuario, incluyendo la asignación de rol (Estudiante, Profesor, Administrador, Invitado).
        3.  El Administrador ingresa los datos del nuevo usuario y guarda la cuenta.
        4.  El sistema crea la nueva cuenta de usuario con el rol especificado.
        5.  El sistema muestra un mensaje de confirmación y actualiza la lista de usuarios.
    *   **Basic Flow - Editar Usuario:**
        1.  El Administrador selecciona un usuario de la lista para editar.
        2.  El sistema presenta una interfaz con los datos del usuario pre-llenados.
        3.  El Administrador modifica los datos del usuario (incluyendo el rol si es necesario).
        4.  El Administrador guarda los cambios.
        5.  El sistema actualiza la información del usuario.
        6.  El sistema muestra un mensaje de confirmación y actualiza la lista de usuarios.
    *   **Basic Flow - Eliminar Usuario:**
        1.  El Administrador selecciona un usuario de la lista para eliminar.
        2.  El sistema solicita confirmación para la eliminación.
        3.  El Administrador confirma la eliminación.
        4.  El sistema elimina la cuenta de usuario y toda la información asociada a ese usuario (OVCs propios, evaluaciones realizadas, posts en foros, etc.).
        5.  El sistema muestra un mensaje de confirmación y actualiza la lista de usuarios.
*   **Postconditions:** Las cuentas de usuario han sido gestionadas según la acción del Administrador.