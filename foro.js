// =============================================
// ========== Forum Functionality ==============
// =============================================

/**
 * Reusable function to get OVC data from localStorage.
 * Avoids duplicating the logic from rizoma.js if possible,
 * but for separation, we might need a simplified version here.
 */
function getOvcsFromStorageForForum() {
  const ovcsJson = localStorage.getItem("ovcData");
  try {
    return ovcsJson ? JSON.parse(ovcsJson) : [];
  } catch (e) {
    console.error("Error al analizar los datos de OVC:", e);
    return [];
  }
}

/**
 * Initializes the forum functionality on the foro.html page.
 */
async function initializeOvcForum() {
  console.log("Initializing OVC Forum...");
  const forumTitleElement = document.getElementById("ovc-forum-title");
  const topicsListElement = document.getElementById("topics-list");
  const newTopicForm = document.getElementById("new-topic-form");
  // Updated selectors for Tailwind version
  const topicModalElement = document.getElementById("topic-modal-placeholder"); // Changed ID
  // const topicModal = new bootstrap.Modal(topicModalElement); // Removed Bootstrap modal init
  const topicModalLabel = document.getElementById("topicModalLabel"); // Keep this ID
  const topicPostsElement = document.getElementById("topic-posts"); // Keep this ID
  const newPostForm = document.getElementById("new-post-form"); // Keep this ID
  // Add selectors for close buttons if managing modal from here
  // const closeModalBtn = document.getElementById('close-modal-btn');
  // const closeModalBtnFooter = document.getElementById('close-modal-btn-footer');
  const currentTopicIdInput = document.getElementById("current-topic-id");

  if (
    !forumTitleElement ||
    !topicsListElement ||
    !newTopicForm ||
    // !topicModalElement || // Check the new ID if needed
    !newPostForm ||
    !topicModalLabel || // Add checks for potentially missed elements
    !topicPostsElement ||
    !currentTopicIdInput
  ) {
    console.error(
      "One or more required forum elements not found in the DOM. Exiting forum initialization."
    );
    return;
  }

  // 1. Get OVC ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const ovcId = urlParams.get("ovcId");

  if (!ovcId) {
    forumTitleElement.textContent = "Error: No OVC ID specified.";
    topicsListElement.innerHTML =
      '<p class="text-danger">Cannot load forum without an OVC ID.</p>';
    newTopicForm.style.display = "none"; // Hide form if no OVC
    return;
  }

  const numericOvcId = Number(ovcId); // Ensure it's a number for comparison
  const FORUM_STORAGE_KEY = `forumData_${numericOvcId}`;

  // 2. Fetch OVC Title
  let ovcTitle = `OVC ID: ${numericOvcId}`; // Default title
  try {
    // Use the simplified local function
    const originalOvcs = getOvcsFromStorageForForum();
    const currentOvc = originalOvcs.find((ovc) => ovc.id === numericOvcId);
    if (currentOvc && currentOvc.titulo) {
      ovcTitle = currentOvc.titulo;
    } else {
      console.warn(`Could not find title for OVC ID: ${numericOvcId}`);
    }
  } catch (error) {
    console.error("Error fetching OVC data for title:", error);
  }

  // 3. Display OVC Title
  forumTitleElement.textContent = `Foro para: ${ovcTitle}`;

  // --- Forum Data Handling ---

  function getForumData() {
    const data = localStorage.getItem(FORUM_STORAGE_KEY);
    try {
      // Structure: { topics: [ {id, title, author, date, posts: [{id, author, date, content}] } ] }
      return data ? JSON.parse(data) : { topics: [] };
    } catch (e) {
      console.error("Error parsing forum data:", e);
      return { topics: [] };
    }
  }

  function saveForumData(data) {
    try {
      localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving forum data:", e);
      alert(
        "Error al guardar los datos del foro. ¿Quizás el almacenamiento está lleno?"
      );
    }
  }

  // --- Display Logic ---

  function renderTopics() {
    const forumData = getForumData();
    topicsListElement.innerHTML = ""; // Clear previous list

    if (forumData.topics.length === 0) {
      topicsListElement.innerHTML =
        "<p>No hay temas en este foro todavía. ¡Sé el primero en crear uno!</p>";
      return;
    }

    forumData.topics.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by newest first

    forumData.topics.forEach((topic) => {
      const topicElement = document.createElement("div");
      // Apply Tailwind classes matching the structure in foro.html comments
      topicElement.className =
        "border border-gray-200 p-4 rounded-md hover:shadow-lg transition-shadow duration-200 mb-4"; // Added mb-4 for spacing
      topicElement.innerHTML = `
                <h3 class="text-lg font-semibold text-pink-700 mb-1">${
                  topic.title
                }</h3>
                <p class="text-sm text-gray-600 mb-2">
                    Iniciado por: ${topic.author || "Anónimo"} el ${new Date(
        topic.date
      ).toLocaleString()}
                </p>
                <p class="text-gray-800 mb-3 line-clamp-2"> <!-- Added line-clamp for long first messages -->
                    ${
                      topic.posts && topic.posts.length > 0
                        ? escapeHtml(topic.posts[0].content.substring(0, 150)) +
                          (topic.posts[0].content.length > 150 ? "..." : "")
                        : "No hay mensajes iniciales."
                    }
                </p>
                <button class="text-sm text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md view-topic-btn" data-topic-id="${
                  topic.id
                }">
                    Ver Discusión (${topic.posts?.length || 0} mensajes)
                </button>
            `;
      topicsListElement.appendChild(topicElement);
    });

    // Add event listeners to the new buttons
    topicsListElement.querySelectorAll(".view-topic-btn").forEach((button) => {
      button.addEventListener("click", handleViewTopic);
    });
  }

  function renderPosts(topicId) {
    const forumData = getForumData();
    const topic = forumData.topics.find((t) => t.id === topicId);
    topicPostsElement.innerHTML = ""; // Clear previous posts

    if (!topic || !topic.posts || topic.posts.length === 0) {
      topicPostsElement.innerHTML =
        "<p>No hay mensajes en este tema todavía.</p>";
      return;
    }

    topic.posts.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by oldest first

    topic.posts.forEach((post) => {
      const postElement = document.createElement("div");
      // Apply Tailwind classes for posts within the modal
      postElement.className = "mb-4 border-b border-gray-200 pb-3"; // Tailwind classes
      // Basic sanitization for content display
      const safeContent = escapeHtml(post.content);
      postElement.innerHTML = `
                <p class="mb-1 text-gray-800">${safeContent}</p>
                <small class="text-gray-500 text-sm">Por: ${escapeHtml(
                  post.author || "Anónimo"
                )} - ${new Date(post.date).toLocaleString()}</small>
            `;
      topicPostsElement.appendChild(postElement);
    });
  }

  // --- Event Handlers ---

  function handleNewTopicSubmit(event) {
    event.preventDefault();
    const titleInput = document.getElementById("topic-title");
    const contentInput = document.getElementById("topic-content");
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    // TODO: Get actual author name (needs user authentication context)
    const author = "Usuario Actual"; // Placeholder

    if (!title || !content) {
      alert("Por favor, completa el título y el mensaje inicial.");
      return;
    }

    const forumData = getForumData();
    const newTopic = {
      id: Date.now(), // Simple unique ID
      title: title,
      author: author,
      date: new Date().toISOString(),
      posts: [
        {
          id: Date.now() + 1, // Simple unique ID for the post
          author: author,
          date: new Date().toISOString(),
          content: content,
        },
      ],
    };

    forumData.topics.push(newTopic);
    saveForumData(forumData);
    renderTopics();

    // Clear form
    titleInput.value = "";
    contentInput.value = "";
  }

  function handleViewTopic(event) {
    const topicId = Number(event.target.getAttribute("data-topic-id"));
    const forumData = getForumData();
    const topic = forumData.topics.find((t) => t.id === topicId);

    if (!topic) {
      alert("Error: No se pudo encontrar el tema.");
      return;
    }

    topicModalLabel.textContent = topic.title;
    currentTopicIdInput.value = topic.id;
    renderPosts(topic.id);
    // Use the basic modal functions defined in foro.html's inline script
    // Ensure these functions are globally accessible or move logic here.
    if (typeof openModal === "function") {
      openModal(); // Call the function to show the modal
    } else {
      console.error("openModal function not found. Cannot open topic modal.");
      // Fallback or alternative: directly manipulate the modal element's class
      // topicModalElement.classList.remove('hidden');
    }
  }

  function handleNewPostSubmit(event) {
    event.preventDefault();
    const contentInput = document.getElementById("post-content");
    const content = contentInput.value.trim();
    const topicId = Number(currentTopicIdInput.value);
    // TODO: Get actual author name
    const author = "Usuario Actual"; // Placeholder

    if (!content || !topicId) {
      alert("Por favor, escribe un mensaje.");
      return;
    }

    const forumData = getForumData();
    const topicIndex = forumData.topics.findIndex((t) => t.id === topicId);

    if (topicIndex === -1) {
      alert("Error: No se pudo encontrar el tema para añadir el mensaje.");
      return;
    }

    const newPost = {
      id: Date.now(),
      author: author,
      date: new Date().toISOString(),
      content: content,
    };

    if (!forumData.topics[topicIndex].posts) {
      forumData.topics[topicIndex].posts = [];
    }
    forumData.topics[topicIndex].posts.push(newPost);
    saveForumData(forumData);
    renderPosts(topicId); // Re-render posts in the modal
    contentInput.value = ""; // Clear textarea
  }

  // --- Initialization ---
  newTopicForm.addEventListener("submit", handleNewTopicSubmit);
  newPostForm.addEventListener("submit", handleNewPostSubmit);
  renderTopics(); // Initial load of topics
}

// Helper function to escape HTML characters (basic security measure)
function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"""') // Correct: Enclose the replacement string in quotes
    .replace(/'/g, "'&#039;'"); // Correct: Enclose the replacement string in quotes
}

// Use DOMContentLoaded to ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", initializeOvcForum);
