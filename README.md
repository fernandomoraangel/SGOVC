# SGOVC
Sistema de gestión de OVC, pregrado en creación digital

## Files

-   `index.html`: Main HTML file for the application.
    -   Uses Tailwind CSS for styling.
    -   Includes sections for creating, listing, and viewing OVCs (Objetos Virtuales Creativos).
    -   Includes JavaScript for handling form submissions, image previews, and dynamic content updates.
-   `kanban.html`: HTML file for the Kanban board feature.
    -   Uses Tailwind CSS for styling and SortableJS for drag-and-drop functionality.
    -   Implements columns for "To Do", "In Progress", and "Done".
    -   Allows adding, editing, and deleting tasks.
    -   Includes a context menu for changing the color of tasks and a modal for adding new tasks.
-   `logocd.png`: Logo image for Creación Digital.
-   `logoudea.png`: Logo image for Universidad de Antioquia.
-   `rizoma.js`: JavaScript file for the Rizoma functionality.
    -   Uses D3.js to generate an interactive "rizoma" visualization of OVCs and their relationships.
    -   Fetches OVC data from local storage.
    -   Includes zoom and pan functionality, tooltips, and legends for colors and shapes.
-   `rubrics.html`: HTML file for the rubric-based evaluation system.
    -   Uses HTML, CSS, and JavaScript with Alpine.js.
    -   Allows users to design rubrics, evaluate OVCs using those rubrics, view average scores for OVCs, and see a summary of saved rubrics.
    -   Includes functionality to generate rubrics using AI (Google Gemini API).
