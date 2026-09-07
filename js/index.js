import { OET_ADMIN_EMAIL, STORAGE_KEYS } from "./config.js";
import { defaultLessons, finalQuestions } from "./course-data.js";
import {
  getAuthAvailabilityError,
  sendAdminPasswordReset,
  signInAdmin,
} from "./firebase-auth.js";

const state = {
  lessons: structuredClone(defaultLessons),
  activeLesson: 0,
  completed: [],
  answers: {},
  finalAnswers: [],
  showCertificate: false,
  menuOpen: false,
  authMode: null,
  message: "",
};

const lessonLinks = document.getElementById("lesson-links");
const lessonPanel = document.getElementById("lesson-panel");
const progressCopy = document.getElementById("progress-copy");
const progressBar = document.getElementById("progress-bar");
const scoreCopy = document.getElementById("score-copy");
const quiz = document.getElementById("quiz");
const mobileNav = document.getElementById("mobile-nav");
const authModalShell = document.getElementById("auth-modal-shell");
const authForm = document.getElementById("auth-form");
const registerFields = document.getElementById("register-fields");
const authEyebrow = document.getElementById("auth-eyebrow");
const authTitle = document.getElementById("auth-title");
const authSubmit = document.getElementById("auth-submit");
const authMessage = document.getElementById("auth-message");
const adminNote = document.getElementById("admin-note");
const passwordLabel = document.getElementById("password-label");
const certificate = document.getElementById("certificate");
const certificateName = document.getElementById("certificate-name");
const certificateDate = document.getElementById("certificate-date");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeVideoUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) ? url : "";
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEYS.progress);
  if (saved) {
    try {
      state.completed = JSON.parse(saved);
    } catch {
      state.completed = [];
    }
  }
  const course = localStorage.getItem(STORAGE_KEYS.course);
  if (course) {
    try {
      const parsed = JSON.parse(course);
      if (parsed.lessons?.length) state.lessons = parsed.lessons;
    } catch {
      state.lessons = structuredClone(defaultLessons);
    }
  }
}

function saveCompletion(value) {
  state.completed = value;
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(value));
}

function getFinalScore() {
  return finalQuestions.reduce(
    (score, question, index) => score + Number(state.finalAnswers[index] === question[1]),
    0,
  );
}

function isCourseComplete() {
  return state.completed.length === state.lessons.length && getFinalScore() >= 3;
}

function renderLessons() {
  lessonLinks.innerHTML = "";
  state.lessons.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = state.activeLesson === index ? "lesson-link active" : "lesson-link";
    const isComplete = state.completed.includes(index);
    button.innerHTML = `
      <span>${isComplete ? "✓" : String(index + 1).padStart(2, "0")}</span>
      <b>${escapeHtml(item.title)}</b>
      <small>${escapeHtml(item.duration)}</small>
    `;
    button.addEventListener("click", () => {
      state.activeLesson = index;
      render();
    });
    lessonLinks.appendChild(button);
  });
}

function renderLessonPanel() {
  const lesson = state.lessons[state.activeLesson];
  const materials = lesson.materials
    .map(
      (material, index) => `
        <div class="material">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>${escapeHtml(material.title)}</h3>
            <p>${escapeHtml(material.detail)}</p>
          </div>
        </div>
      `,
    )
    .join("");

  lessonPanel.innerHTML = `
    <div class="lesson-number">CHAPTER ${String(state.activeLesson + 1).padStart(2, "0")}</div>
    <h2>${escapeHtml(lesson.title)}</h2>
    <p class="lesson-goal">${escapeHtml(lesson.goal)}</p>
    <div class="materials">${materials}</div>
    ${
      sanitizeVideoUrl(lesson.videoUrl)
        ? `<div class="lesson-video"><iframe src="${escapeHtml(sanitizeVideoUrl(lesson.videoUrl))}" title="${escapeHtml(lesson.title)} video" allowfullscreen></iframe></div>`
        : ""
    }
    <div class="knowledge-check">
      <span>📝</span>
      <div>
        <p class="eyebrow">KNOWLEDGE CHECK</p>
        <h3>${escapeHtml(lesson.question)}</h3>
        <input aria-label="Your answer" id="lesson-answer" placeholder="Type your answer" value="${
          escapeHtml(state.answers[state.activeLesson] || "")
        }" />
        <p class="hint">Check your knowledge, then reveal the answer.</p>
        <details><summary>Reveal answer</summary><p>${escapeHtml(lesson.answer)}</p></details>
      </div>
    </div>
    <button class="primary" id="chapter-complete">
      ${state.completed.includes(state.activeLesson) ? "Chapter complete" : "Mark chapter complete"}
    </button>
  `;

  document.getElementById("chapter-complete").addEventListener("click", () => {
    saveCompletion([...new Set([...state.completed, state.activeLesson])]);
    render();
  });

  document.getElementById("lesson-answer").addEventListener("input", (event) => {
    state.answers[state.activeLesson] = event.target.value;
  });
}

function renderProgress() {
  progressCopy.textContent = `${state.completed.length} / ${state.lessons.length} chapters complete`;
  progressBar.style.width = `${(state.completed.length / state.lessons.length) * 100}%`;
  scoreCopy.textContent = `${getFinalScore()}/4`;
}

function renderAssessment() {
  quiz.innerHTML = `${finalQuestions
    .map((question, index) => {
      const options = question
        .slice(1)
        .map(
          (option) => `
            <label>
              <input type="radio" name="question-${index}" value="${option}" ${
                state.finalAnswers[index] === option ? "checked" : ""
              } />
              ${escapeHtml(option)}
            </label>
          `,
        )
        .join("");
      return `<fieldset><legend>${index + 1}. ${escapeHtml(question[0])}</legend>${options}</fieldset>`;
    })
    .join("")}
    <button class="primary" id="view-certificate" ${isCourseComplete() ? "" : "disabled"}>View certificate</button>
    ${
      isCourseComplete()
        ? ""
        : '<p class="qualification">Complete all chapters and score 3/4 to unlock your certificate.</p>'
    }
  `;

  finalQuestions.forEach((_, index) => {
    quiz.querySelectorAll(`input[name="question-${index}"]`).forEach((input) => {
      input.addEventListener("change", (event) => {
        state.finalAnswers[index] = event.target.value;
        renderProgress();
        renderAssessment();
      });
    });
  });

  document.getElementById("view-certificate").addEventListener("click", () => {
    state.showCertificate = true;
    renderCertificate();
  });
}

function setAuthMode(mode) {
  state.authMode = mode;
  state.message = "";
  renderAuthModal();
}

function renderRegisterFields() {
  if (state.authMode === "admin") {
    registerFields.innerHTML = `
      <label>
        Admin email
        <input name="email" type="email" value="${escapeHtml(OET_ADMIN_EMAIL)}" required />
      </label>
      <button class="text-button admin-forgot" id="admin-forgot-link" type="button">
        Forgot password?
      </button>
    `;
    return;
  }

  if (state.authMode !== "register") {
    registerFields.innerHTML = "";
    return;
  }
  registerFields.innerHTML = `
    <div class="field-row">
      <label>
        First name
        <input name="firstName" required />
      </label>
      <label>
        Last name
        <input name="lastName" required />
      </label>
    </div>
    <label>
      Username
      <input name="username" required />
    </label>
    <label>
      Email
      <input name="email" type="email" required />
    </label>
    <label>
      Telephone number
      <input name="telephone" type="tel" required />
    </label>
  `;
}

function renderAuthModal() {
  const open = Boolean(state.authMode);
  authModalShell.classList.toggle("hidden", !open);
  if (!open) {
    authForm.reset();
    authMessage.textContent = "";
    return;
  }

  const isAdmin = state.authMode === "admin";
  authEyebrow.textContent = isAdmin ? "ADMIN PORTAL" : "STUDENT REGISTRATION";
  authTitle.textContent = isAdmin ? "Manage the course" : "Create your account";
  authSubmit.textContent = isAdmin ? "Sign in as admin" : "Register";
  passwordLabel.textContent = isAdmin ? "Admin password" : "Password";
  adminNote.classList.toggle("hidden", !isAdmin);
  renderRegisterFields();
  if (isAdmin) {
    document.getElementById("admin-forgot-link").addEventListener("click", async () => {
      const emailInput = authForm.elements.namedItem("email");
      const email = emailInput ? emailInput.value : OET_ADMIN_EMAIL;
      const result = await sendAdminPasswordReset(email);
      state.message = result.message;
      renderAuthModal();
    });
  }
  authMessage.textContent = state.message;
}

function renderCertificate() {
  const open = state.showCertificate && isCourseComplete();
  certificate.classList.toggle("hidden", !open);
  if (!open) return;
  certificateName.textContent = localStorage.getItem(STORAGE_KEYS.studentName) || "OET Learner";
  certificateDate.textContent = new Date().toLocaleDateString();
}

function renderMenu() {
  mobileNav.style.display = state.menuOpen ? "flex" : "none";
  document.getElementById("mobile-menu-toggle").textContent = state.menuOpen ? "✕" : "☰";
}

function hexFromArrayBuffer(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomSaltHex(size = 16) {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return hexFromArrayBuffer(bytes.buffer);
}

function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-512",
      salt: hexToBytes(saltHex),
      iterations: 100000,
    },
    key,
    512,
  );
  return hexFromArrayBuffer(bits);
}

async function hashText(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
  return hexFromArrayBuffer(digest);
}

function readStudents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.students) || "[]");
  } catch {
    return [];
  }
}

async function submitRegistration(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  if (state.authMode === "admin") {
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const configError = getAuthAvailabilityError();
    if (configError) {
      state.message = configError;
    } else {
      const result = await signInAdmin(email, password);
      state.message = result.message;
      if (result.ok) {
        window.location.assign("./admin.html");
        return;
      }
    }
    renderAuthModal();
    return;
  }

  const payload = Object.fromEntries(form.entries());
  const required = ["username", "password", "firstName", "lastName", "email", "telephone"];
  if (
    required.some((key) => !String(payload[key] || "").trim()) ||
    String(payload.password || "").length < 8
  ) {
    state.message = "Please complete every field. Passwords must have at least 8 characters.";
    renderAuthModal();
    return;
  }

  const students = readStudents();
  const emailHash = await hashText(String(payload.email).trim().toLowerCase());
  if (students.some((student) => student.username === payload.username || student.emailHash === emailHash)) {
    state.message = "That username or email is already registered.";
    renderAuthModal();
    return;
  }

  const salt = randomSaltHex(16);
  const passwordHash = await hashPassword(String(payload.password), salt);
  students.push({
    username: String(payload.username),
    emailHash,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  localStorage.setItem(STORAGE_KEYS.studentName, String(payload.firstName));
  state.message = "Registration complete. Your progress is ready to track.";
  renderAuthModal();
}

function render() {
  renderLessons();
  renderLessonPanel();
  renderProgress();
  renderAssessment();
  renderAuthModal();
  renderMenu();
  renderCertificate();
}

function attachEvents() {
  document.getElementById("admin-open").addEventListener("click", () => setAuthMode("admin"));
  document.getElementById("register-open").addEventListener("click", () => setAuthMode("register"));
  document
    .getElementById("mobile-register-open")
    .addEventListener("click", () => setAuthMode("register"));
  document.getElementById("mobile-menu-toggle").addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    renderMenu();
  });
  document.getElementById("auth-close").addEventListener("click", () => setAuthMode(null));
  document.getElementById("certificate-close").addEventListener("click", () => {
    state.showCertificate = false;
    renderCertificate();
  });
  document.getElementById("certificate-print").addEventListener("click", () => window.print());
  authForm.addEventListener("submit", submitRegistration);
}

loadState();
attachEvents();
render();
