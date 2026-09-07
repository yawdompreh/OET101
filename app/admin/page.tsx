"use client";

import {
  ArrowLeft,
  ChevronDown,
  CirclePlus,
  Save,
  ShieldCheck,
  Trash2,
  Video,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

type Material = { title: string; detail: string };
type Lesson = {
  title: string;
  duration: string;
  goal: string;
  materials: Material[];
  question: string;
  answer: string;
  videoUrl?: string;
};
const blankLesson = (): Lesson => ({
  title: "New chapter",
  duration: "30 min",
  goal: "Describe the learning outcome.",
  materials: [
    { title: "New material", detail: "Add study material for this chapter." },
  ],
  question: "Add a knowledge-check question.",
  answer: "Add the answer.",
  videoUrl: "",
});

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const starterLessons: Lesson[] = [
    { title: "OET Test overview", duration: "30 min", goal: "Understand the format, delivery modes and results.", materials: [{ title: "The four sub-tests", detail: "Listening (45 minutes), Reading (60 minutes), Writing (45 minutes), and Speaking (20 minutes)." }, { title: "Delivery modes", detail: "OET is available on paper at a venue, on computer at a venue, and as OET@Home." }], question: "Which OET sub-test takes 60 minutes?", answer: "Reading" },
    { title: "Getting OET Ready", duration: "25 min", goal: "Build a useful preparation routine.", materials: [{ title: "Intro to OET Course", detail: "Choose the free interactive course for nurses, doctors, or allied health professionals." }, { title: "OET Pulse", detail: "Use the diagnostic to check your current English level and focus your study plan." }], question: "Which tool helps identify your current English level?", answer: "OET Pulse" },
    { title: "Reading", duration: "70 min", goal: "Use the right approach for Parts A, B and C.", materials: [{ title: "Part A: Expeditious reading", detail: "Locate specific information quickly across four short texts." }, { title: "Parts B and C", detail: "Read workplace extracts and longer healthcare articles for meaning, purpose and inference." }], question: "Which Reading part is designed for fast location of information?", answer: "Part A" },
    { title: "Listening", duration: "60 min", goal: "Recognise details, purpose and opinions in spoken healthcare English.", materials: [{ title: "Part A: Consultation notes", detail: "Listen to two patient consultations and complete notes while listening." }, { title: "Parts B and C", detail: "Interpret short workplace exchanges and longer presentations or interviews." }], question: "Which Listening part contains patient consultations?", answer: "Part A" },
    { title: "Writing", duration: "55 min", goal: "Write a purposeful, reader-centred healthcare letter.", materials: [{ title: "The task", detail: "Write one letter, typically to another healthcare professional, using supplied case notes." }, { title: "Assessment focus", detail: "Plan during reading time, select relevant information and communicate clearly for the reader." }], question: "What is the usual OET Writing task?", answer: "A letter" },
    { title: "Speaking", duration: "50 min", goal: "Build clear clinical communication in role plays.", materials: [{ title: "Two role plays", detail: "You are the healthcare professional; the interlocutor is a patient, relative or carer." }, { title: "Clinical communication", detail: "Practise relationship-building, structure, information-giving, empathy and checking understanding." }], question: "How many role plays are in the OET Speaking sub-test?", answer: "Two" },
    { title: "Booking and test day", duration: "20 min", goal: "Choose a delivery format and arrive prepared.", materials: [{ title: "Book your test", detail: "Select the date and venue that suit you through the official OET booking service." }, { title: "Test day guides", detail: "Review the specific guide for paper, computer, or OET@Home before your test date." }], question: "Name one place you can take OET.", answer: "At a venue" },
  ];
  async function unlock(event: FormEvent) {
    event.preventDefault();
    const result = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!result.ok) {
      setMessage((await result.json()).message);
      return;
    }
    const course = await fetch("/api/course").then((response) =>
      response.json(),
    );
    setLessons(course.lessons.length ? course.lessons : starterLessons);
    setReady(true);
  }
  const updateLesson = (key: keyof Lesson, value: string | Material[]) =>
    setLessons(
      lessons.map((lesson, index) =>
        index === selected ? { ...lesson, [key]: value } : lesson,
      ),
    );
  const updateMaterial = (
    materialIndex: number,
    key: keyof Material,
    value: string,
  ) =>
    setLessons(
      lessons.map((lesson, index) =>
        index === selected
          ? {
              ...lesson,
              materials: lesson.materials.map((material, current) =>
                current === materialIndex
                  ? { ...material, [key]: value }
                  : material,
              ),
            }
          : lesson,
      ),
    );
  async function publish() {
    const response = await fetch("/api/course", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, lessons }),
    });
    setMessage((await response.json()).message);
  }
  if (!ready)
    return (
      <main className="admin-shell">
        <Link href="/" className="back">
          <ArrowLeft size={17} /> Back to study site
        </Link>
        <form className="admin-login" onSubmit={unlock}>
          <ShieldCheck />
          <p className="eyebrow">ADMIN PORTAL</p>
          <h1>Course control room</h1>
          <p>
            Enter your administrator password to update lessons and add teaching
            videos.
          </p>
          <label>
            Admin password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="primary">Continue</button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </main>
    );
  const lesson = lessons[selected];
  return (
    <main className="editor">
      <header className="editor-header">
        <div>
          <p className="eyebrow">ADMIN PORTAL</p>
          <h1>Course editor</h1>
        </div>
        <div>
          <Link href="/" className="back">
            View student site
          </Link>
          <button className="primary" onClick={publish}>
            <Save size={17} /> Publish updates
          </button>
        </div>
      </header>
      <p className="save-message">
        {message || "Edits are staged locally. Publish when you are ready."}
      </p>
      <div className="editor-layout">
        <aside className="chapter-list">
          <button
            className="add-chapter"
            onClick={() => {
              setLessons([...lessons, blankLesson()]);
              setSelected(lessons.length);
            }}
          >
            <CirclePlus size={18} /> Add chapter
          </button>
          {lessons.map((item, index) => (
            <button
              key={`${item.title}-${index}`}
              className={
                index === selected ? "chapter-tab active" : "chapter-tab"
              }
              onClick={() => setSelected(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.title}
            </button>
          ))}
        </aside>
        <section className="editor-form">
          <div className="editor-title">
            <div>
              <p className="eyebrow">
                EDITING CHAPTER {String(selected + 1).padStart(2, "0")}
              </p>
              <h2>{lesson.title}</h2>
            </div>
            <button
              className="icon-button"
              onClick={() => {
                if (lessons.length === 1) return;
                setLessons(lessons.filter((_, index) => index !== selected));
                setSelected(Math.max(0, selected - 1));
              }}
              title="Delete chapter"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="edit-grid">
            <label>
              Chapter title
              <input
                value={lesson.title}
                onChange={(event) => updateLesson("title", event.target.value)}
              />
            </label>
            <label>
              Estimated study time
              <input
                value={lesson.duration}
                onChange={(event) =>
                  updateLesson("duration", event.target.value)
                }
              />
            </label>
          </div>
          <label>
            Learning objective
            <textarea
              value={lesson.goal}
              onChange={(event) => updateLesson("goal", event.target.value)}
            />
          </label>
          <div className="editor-section">
            <div className="section-heading">
              <h3>Study materials</h3>
              <button
                className="secondary"
                onClick={() =>
                  updateLesson("materials", [
                    ...lesson.materials,
                    { title: "New material", detail: "" },
                  ])
                }
              >
                Add material
              </button>
            </div>
            {lesson.materials.map((material, index) => (
              <div className="material-edit" key={index}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <input
                    value={material.title}
                    onChange={(event) =>
                      updateMaterial(index, "title", event.target.value)
                    }
                    placeholder="Material title"
                  />
                  <textarea
                    value={material.detail}
                    onChange={(event) =>
                      updateMaterial(index, "detail", event.target.value)
                    }
                    placeholder="Material details"
                  />
                </div>
                <button
                  className="icon-button"
                  onClick={() =>
                    updateLesson(
                      "materials",
                      lesson.materials.filter(
                        (_, current) => current !== index,
                      ),
                    )
                  }
                  title="Remove material"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="video-panel">
            <Video size={23} />
            <div>
              <h3>Course video</h3>
              <p>
                Paste a YouTube or Vimeo embed URL. It will appear with this
                chapter for learners.
              </p>
              <input
                value={lesson.videoUrl || ""}
                onChange={(event) =>
                  updateLesson("videoUrl", event.target.value)
                }
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          </div>
          <div className="edit-grid">
            <label>
              Knowledge-check question
              <textarea
                value={lesson.question}
                onChange={(event) =>
                  updateLesson("question", event.target.value)
                }
              />
            </label>
            <label>
              Correct answer
              <textarea
                value={lesson.answer}
                onChange={(event) => updateLesson("answer", event.target.value)}
              />
            </label>
          </div>
        </section>
      </div>
    </main>
  );
}
