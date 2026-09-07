import { OET_ADMIN_PASSWORD, STORAGE_KEYS } from "./config.js";
import { defaultLessons } from "./course-data.js";

const state = {
  password: "",
  lessons: [],
  selected: 0,
  message: "",
  ready: false,
};

const root = document.getElementById("admin-root");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function blankLesson() {
  return {
    title: "New chapter",
    duration: "30 min",
    goal: "Describe the learning outcome.",
    materials: [{ title: "New material", detail: "Add study material for this chapter." }],
    question: "Add a knowledge-check question.",
    answer: "Add the answer.",
    videoUrl: "",
  };
}

function readCourseLessons() {
  try {
    const course = JSON.parse(localStorage.getItem(STORAGE_KEYS.course) || "{}");
    return Array.isArray(course.lessons) && course.lessons.length ? course.lessons : structuredClone(defaultLessons);
  } catch {
    return structuredClone(defaultLessons);
  }
}

function updateLesson(key, value) {
  state.lessons = state.lessons.map((lesson, index) =>
    index === state.selected ? { ...lesson, [key]: value } : lesson,
  );
}

function updateMaterial(materialIndex, key, value) {
  state.lessons = state.lessons.map((lesson, index) =>
    index === state.selected
      ? {
          ...lesson,
          materials: lesson.materials.map((material, current) =>
            current === materialIndex ? { ...material, [key]: value } : material,
          ),
        }
      : lesson,
  );
}

function renderLogin() {
  root.innerHTML = `
    <a href="./index.html" class="back">← Back to study site</a>
    <form class="admin-login" id="unlock-form">
      <p class="eyebrow">ADMIN PORTAL</p>
      <h1>Course control room</h1>
      <p>Enter your administrator password to update lessons and add teaching videos.</p>
      <label>
        Admin password
        <input type="password" name="password" required />
      </label>
      <button class="primary">Continue</button>
      ${state.message ? `<p class="form-message">${state.message}</p>` : ""}
    </form>
  `;

  document.getElementById("unlock-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.password = String(form.get("password") || "");
    if (!OET_ADMIN_PASSWORD) {
      state.message =
        "Admin access is not configured. Add OET_ADMIN_PASSWORD to your deployment environment.";
      render();
      return;
    }
    if (state.password !== OET_ADMIN_PASSWORD) {
      state.message = "Incorrect administrator password.";
      render();
      return;
    }
    state.lessons = readCourseLessons();
    state.ready = true;
    state.message = "";
    render();
  });
}

function renderEditor() {
  const lesson = state.lessons[state.selected];
  const chapterList = state.lessons
    .map(
      (item, index) => `
        <button class="${index === state.selected ? "chapter-tab active" : "chapter-tab"}" data-select="${index}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          ${escapeHtml(item.title)}
        </button>
      `,
    )
    .join("");

  const materials = lesson.materials
    .map(
      (material, index) => `
        <div class="material-edit">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <input value="${escapeHtml(material.title)}" data-material-title="${index}" placeholder="Material title" />
            <textarea data-material-detail="${index}" placeholder="Material details">${escapeHtml(material.detail)}</textarea>
          </div>
          <button class="icon-button" data-remove-material="${index}" title="Remove material">✕</button>
        </div>
      `,
    )
    .join("");

  root.className = "editor";
  root.innerHTML = `
    <header class="editor-header">
      <div>
        <p class="eyebrow">ADMIN PORTAL</p>
        <h1>Course editor</h1>
      </div>
      <div>
        <a href="./index.html" class="back">View student site</a>
        <button class="primary" id="publish">Publish updates</button>
      </div>
    </header>
    <p class="save-message">${state.message || "Edits are staged locally. Publish when you are ready."}</p>
    <div class="editor-layout">
      <aside class="chapter-list">
        <button class="add-chapter" id="add-chapter">Add chapter</button>
        ${chapterList}
      </aside>
      <section class="editor-form">
        <div class="editor-title">
          <div>
            <p class="eyebrow">EDITING CHAPTER ${String(state.selected + 1).padStart(2, "0")}</p>
            <h2>${escapeHtml(lesson.title)}</h2>
          </div>
          <button class="icon-button" id="delete-chapter" title="Delete chapter">✕</button>
        </div>

        <div class="edit-grid">
          <label>
            Chapter title
            <input id="lesson-title" value="${escapeHtml(lesson.title)}" />
          </label>
          <label>
            Estimated study time
            <input id="lesson-duration" value="${escapeHtml(lesson.duration)}" />
          </label>
        </div>

        <label>
          Learning objective
          <textarea id="lesson-goal">${escapeHtml(lesson.goal)}</textarea>
        </label>

        <div class="editor-section">
          <div class="section-heading">
            <h3>Study materials</h3>
            <button class="secondary" id="add-material">Add material</button>
          </div>
          ${materials}
        </div>

        <div class="video-panel">
          <span>📹</span>
          <div>
            <h3>Course video</h3>
            <p>Paste a YouTube or Vimeo embed URL. It will appear with this chapter for learners.</p>
            <input id="lesson-video" value="${escapeHtml(lesson.videoUrl || "")}" placeholder="https://www.youtube.com/embed/..." />
          </div>
        </div>

        <div class="edit-grid">
          <label>
            Knowledge-check question
            <textarea id="lesson-question">${escapeHtml(lesson.question)}</textarea>
          </label>
          <label>
            Correct answer
            <textarea id="lesson-answer">${escapeHtml(lesson.answer)}</textarea>
          </label>
        </div>
      </section>
    </div>
  `;

  document.getElementById("add-chapter").addEventListener("click", () => {
    state.lessons = [...state.lessons, blankLesson()];
    state.selected = state.lessons.length - 1;
    render();
  });

  root.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selected = Number(button.getAttribute("data-select"));
      render();
    });
  });

  document.getElementById("delete-chapter").addEventListener("click", () => {
    if (state.lessons.length === 1) return;
    state.lessons = state.lessons.filter((_, index) => index !== state.selected);
    state.selected = Math.max(0, state.selected - 1);
    render();
  });

  document.getElementById("lesson-title").addEventListener("input", (event) => {
    updateLesson("title", event.target.value);
    render();
  });
  document.getElementById("lesson-duration").addEventListener("input", (event) => {
    updateLesson("duration", event.target.value);
  });
  document.getElementById("lesson-goal").addEventListener("input", (event) => {
    updateLesson("goal", event.target.value);
  });
  document.getElementById("lesson-video").addEventListener("input", (event) => {
    updateLesson("videoUrl", event.target.value);
  });
  document.getElementById("lesson-question").addEventListener("input", (event) => {
    updateLesson("question", event.target.value);
  });
  document.getElementById("lesson-answer").addEventListener("input", (event) => {
    updateLesson("answer", event.target.value);
  });

  document.getElementById("add-material").addEventListener("click", () => {
    updateLesson("materials", [...lesson.materials, { title: "New material", detail: "" }]);
    render();
  });

  root.querySelectorAll("[data-material-title]").forEach((input) => {
    input.addEventListener("input", (event) => {
      updateMaterial(Number(input.getAttribute("data-material-title")), "title", event.target.value);
      render();
    });
  });
  root.querySelectorAll("[data-material-detail]").forEach((textarea) => {
    textarea.addEventListener("input", (event) => {
      updateMaterial(
        Number(textarea.getAttribute("data-material-detail")),
        "detail",
        event.target.value,
      );
    });
  });

  root.querySelectorAll("[data-remove-material]").forEach((button) => {
    button.addEventListener("click", () => {
      updateLesson(
        "materials",
        lesson.materials.filter((_, index) => index !== Number(button.getAttribute("data-remove-material"))),
      );
      render();
    });
  });

  document.getElementById("publish").addEventListener("click", () => {
    if (
      !Array.isArray(state.lessons) ||
      state.lessons.some((currentLesson) => !currentLesson.title || !currentLesson.goal || !Array.isArray(currentLesson.materials))
    ) {
      state.message = "Each chapter needs a title, objective, and materials.";
      render();
      return;
    }

    localStorage.setItem(
      STORAGE_KEYS.course,
      JSON.stringify({ lessons: state.lessons, updatedAt: new Date().toISOString() }),
    );
    state.message = "Course updates have been published.";
    render();
  });
}

function render() {
  if (!state.ready) {
    root.className = "admin-shell";
    renderLogin();
    return;
  }
  renderEditor();
}

render();
