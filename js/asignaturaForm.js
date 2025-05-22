document.addEventListener("DOMContentLoaded", () => {
  const asignaturaForm = document.getElementById("asignaturaForm");
  const nombreAsignaturaInput = document.getElementById("nombreAsignatura");
  const codigoAsignaturaInput = document.getElementById("codigoAsignatura");
  const messageElement = document.getElementById("message");

  if (
    !asignaturaForm ||
    !nombreAsignaturaInput ||
    !codigoAsignaturaInput ||
    !messageElement
  ) {
    console.error(
      "Error: No se encontraron todos los elementos del formulario."
    );
    return;
  }

  asignaturaForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    const nombre = nombreAsignaturaInput.value.trim();
    const codigo = codigoAsignaturaInput.value.trim();

    if (!nombre || !codigo) {
      showMessage("Por favor, complete todos los campos.", false);
      return;
    }

    // Asumiendo que 'supabase' está inicializado y disponible globalmente
    // Si no, necesitarías importarlo o inicializarlo aquí.
    if (typeof supabase === "undefined") {
      showMessage("Error: Supabase no está inicializado.", false);
      console.error("Supabase object is not available.");
      return;
    }

    try {
      // Insertar la nueva asignatura en la tabla 'asignaturas'
      const { data, error } = await supabase
        .from("asignaturas") // Asegúrate de que 'asignaturas' es el nombre correcto de tu tabla
        .insert([{ nombre: nombre, codigo: codigo }]);

      if (error) {
        throw error;
      }

      showMessage("Asignatura guardada con éxito.", true);
      asignaturaForm.reset(); // Limpiar el formulario después de guardar
    } catch (error) {
      console.error("Error al guardar la asignatura:", error.message);
      showMessage("Error al guardar la asignatura: " + error.message, false);
    }
  });

  function showMessage(text, isSuccess) {
    messageElement.textContent = text;
    messageElement.className = isSuccess ? "success" : "error";
    messageElement.classList.remove("hidden");
    // Opcional: ocultar el mensaje después de unos segundos
    // setTimeout(() => {
    //     messageElement.classList.add('hidden');
    // }, 5000);
  }
});
