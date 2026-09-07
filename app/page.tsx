"use client";

import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type Lesson = {
  title: string;
  duration: string;
  goal: string;
  materials: { title: string; detail: string }[];
  question: string;
  answer: string;
  videoUrl?: string;
};
const defaultLessons: Lesson[] = [
  {
    title: "OET Test overview",
    duration: "30 min",
    goal: "Understand the format, delivery modes and results.",
    materials: [
      {
        title: "The four sub-tests",
        detail:
          "Listening (45 minutes), Reading (60 minutes), Writing (45 minutes), and Speaking (20 minutes).",
      },
      {
        title: "Delivery modes",
        detail:
          "OET is available on paper at a venue, on computer at a venue, and as OET@Home.",
      },
    ],
    question: "Which OET sub-test takes 60 minutes?",
    answer: "Reading",
  },
  {
    title: "Getting OET Ready",
    duration: "25 min",
    goal: "Build a useful preparation routine.",
    materials: [
      {
        title: "Intro to OET Course",
        detail:
          "Choose the free interactive course for nurses, doctors, or allied health professionals.",
      },
      {
        title: "OET Pulse",
        detail:
          "Use the diagnostic to check your current English level and focus your study plan.",
      },
    ],
    question: "Which tool helps identify your current English level?",
    answer: "OET Pulse",
  },
  {
    title: "Reading",
    duration: "70 min",
    goal: "Use the right approach for Parts A, B and C.",
    materials: [
      {
        title: "Part A: Expeditious reading",
        detail: "Locate specific information quickly across four short texts.",
      },
      {
        title: "Parts B and C",
        detail:
          "Read workplace extracts and longer healthcare articles for meaning, purpose and inference.",
      },
    ],
    question:
      "Which Reading part is designed for fast location of information?",
    answer: "Part A",
  },
  {
    title: "Listening",
    duration: "60 min",
    goal: "Recognise details, purpose and opinions in spoken healthcare English.",
    materials: [
      {
        title: "Part A: Consultation notes",
        detail:
          "Listen to two patient consultations and complete notes while listening.",
      },
      {
        title: "Parts B and C",
        detail:
          "Interpret short workplace exchanges and longer presentations or interviews.",
      },
    ],
    question: "Which Listening part contains patient consultations?",
    answer: "Part A",
  },
  {
    title: "Writing",
    duration: "55 min",
    goal: "Write a purposeful, reader-centred healthcare letter.",
    materials: [
      {
        title: "The task",
        detail:
          "Write one letter, typically to another healthcare professional, using supplied case notes.",
      },
      {
        title: "Assessment focus",
        detail:
          "Plan during reading time, select relevant information and communicate clearly for the reader.",
      },
    ],
    question: "What is the usual OET Writing task?",
    answer: "A letter",
  },
  {
    title: "Speaking",
    duration: "50 min",
    goal: "Build clear clinical communication in role plays.",
    materials: [
      {
        title: "Two role plays",
        detail:
          "You are the healthcare professional; the interlocutor is a patient, relative or carer.",
      },
      {
        title: "Clinical communication",
        detail:
          "Practise relationship-building, structure, information-giving, empathy and checking understanding.",
      },
    ],
    question: "How many role plays are in the OET Speaking sub-test?",
    answer: "Two",
  },
  {
    title: "Booking and test day",
    duration: "20 min",
    goal: "Choose a delivery format and arrive prepared.",
    materials: [
      {
        title: "Book your test",
        detail:
          "Select the date and venue that suit you through the official OET booking service.",
      },
      {
        title: "Test day guides",
        detail:
          "Review the specific guide for paper, computer, or OET@Home before your test date.",
      },
    ],
    question: "Name one place you can take OET.",
    answer: "At a venue",
  },
];
const finalQuestions = [
  [
    "Which test assesses your clinical communication skills?",
    "Speaking",
    "Reading",
    "Listening",
  ],
  [
    "What does Reading Part B use?",
    "Six short workplace extracts",
    "Two consultations",
    "One referral letter",
  ],
  [
    "Who typically receives an OET Writing letter?",
    "Another healthcare professional",
    "A test assessor",
    "A family member",
  ],
  [
    "What should you use to prepare for a specific delivery mode?",
    "The relevant test-day guide",
    "Only the Reading Masterclass",
    "A social post",
  ],
] as const;

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[]>(defaultLessons);
  const [activeLesson, setActiveLesson] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finalAnswers, setFinalAnswers] = useState<string[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "admin" | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("oet-progress");
    if (saved) setCompleted(JSON.parse(saved));
    fetch("/api/course")
      .then((response) => response.json())
      .then((course) => {
        if (course.lessons?.length) setLessons(course.lessons);
      })
      .catch(() => undefined);
  }, []);
  const saveCompletion = (value: number[]) => {
    setCompleted(value);
    localStorage.setItem("oet-progress", JSON.stringify(value));
  };
  const lesson = lessons[activeLesson];
  const finalScore = finalQuestions.reduce(
    (score, question, index) =>
      score + Number(finalAnswers[index] === question[1]),
    0,
  );
  const courseComplete = completed.length === lessons.length && finalScore >= 3;
  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const endpoint = authMode === "admin" ? "/api/admin" : "/api/register";
    const body =
      authMode === "admin"
        ? { password: form.get("password") }
        : Object.fromEntries(form);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    setMessage(result.message || "Please try again.");
    if (response.ok && authMode === "admin") window.location.assign("/admin");
    if (response.ok && authMode === "register")
      localStorage.setItem("oet-student", String(form.get("firstName")));
  }
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">
          <span>OET</span> STUDY
        </a>
        <nav>
          <a href="#curriculum">Curriculum</a>
          <a href="#assessment">Assessment</a>
          <button className="text-button" onClick={() => setAuthMode("admin")}>
            <LockKeyhole size={15} /> Admin
          </button>
          <button
            className="primary small"
            onClick={() => setAuthMode("register")}
          >
            Create account
          </button>
        </nav>
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      {menuOpen && (
        <nav className="mobile-nav">
          <a href="#curriculum">Curriculum</a>
          <a href="#assessment">Assessment</a>
          <button onClick={() => setAuthMode("register")}>
            Create account
          </button>
        </nav>
      )}
      <section className="hero" id="top">
        <div>
          <p className="eyebrow">DDOMPREH STOCK PREDICT PRESENTS</p>
          <h1>
            Prepare with purpose.
            <br />
            <i>Perform with confidence.</i>
          </h1>
          <p className="hero-copy">
            A structured study path built from the official OET preparation
            guide, made for healthcare professionals.
          </p>
          <a href="#curriculum" className="primary">
            Begin the course <ChevronRight size={18} />
          </a>
        </div>
        <div className="hero-art">
          <div className="art-cross">+</div>
          <div className="art-card">
            <BookOpen size={72} />
            <span>OET</span>
            <strong>READY</strong>
          </div>
          <div className="art-orbit" />
        </div>
      </section>
      <section className="dashboard" id="curriculum">
        <div className="progress-header">
          <div>
            <p className="eyebrow">YOUR LEARNING PATH</p>
            <h2>Course curriculum</h2>
          </div>
          <div className="progress-box">
            <span>
              {completed.length} / {lessons.length} chapters complete
            </span>
            <div className="progress-track">
              <i
                style={{
                  width: `${(completed.length / lessons.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="course-layout">
          <aside>
            {lessons.map((item, index) => (
              <button
                className={
                  activeLesson === index ? "lesson-link active" : "lesson-link"
                }
                key={item.title}
                onClick={() => setActiveLesson(index)}
              >
                <span>
                  {completed.includes(index) ? (
                    <CheckCircle2 />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <b>{item.title}</b>
                <small>{item.duration}</small>
              </button>
            ))}
          </aside>
          <article className="lesson-panel">
            <div className="lesson-number">
              CHAPTER {String(activeLesson + 1).padStart(2, "0")}
            </div>
            <h2>{lesson.title}</h2>
            <p className="lesson-goal">{lesson.goal}</p>
            <div className="materials">
              {lesson.materials.map((material, index) => (
                <div className="material" key={material.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{material.title}</h3>
                    <p>{material.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            {lesson.videoUrl && (
              <div className="lesson-video">
                <iframe
                  src={lesson.videoUrl}
                  title={`${lesson.title} video`}
                  allowFullScreen
                />
              </div>
            )}
            <div className="knowledge-check">
              <ClipboardCheck size={25} />
              <div>
                <p className="eyebrow">KNOWLEDGE CHECK</p>
                <h3>{lesson.question}</h3>
                <input
                  aria-label="Your answer"
                  placeholder="Type your answer"
                  value={answers[activeLesson] || ""}
                  onChange={(event) =>
                    setAnswers({
                      ...answers,
                      [activeLesson]: event.target.value,
                    })
                  }
                />
                <p className="hint">
                  Check your knowledge, then reveal the answer.
                </p>
                <details>
                  <summary>Reveal answer</summary>
                  <p>{lesson.answer}</p>
                </details>
              </div>
            </div>
            <button
              className="primary"
              onClick={() =>
                saveCompletion([...new Set([...completed, activeLesson])])
              }
            >
              {completed.includes(activeLesson)
                ? "Chapter complete"
                : "Mark chapter complete"}
              <CheckCircle2 size={18} />
            </button>
          </article>
        </div>
      </section>
      <section className="assessment" id="assessment">
        <div className="assessment-intro">
          <p className="eyebrow">FINAL ASSESSMENT</p>
          <h2>Show what you know.</h2>
          <p>
            Complete every chapter, then score at least 3 out of 4 on the final
            questions to earn your course certificate.
          </p>
          <div className="stat">
            <Award />
            <span>
              <strong>{finalScore}/4</strong> current score
            </span>
          </div>
        </div>
        <div className="quiz">
          {finalQuestions.map((question, index) => (
            <fieldset key={question[0]}>
              <legend>
                {index + 1}. {question[0]}
              </legend>
              {question.slice(1).map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`question-${index}`}
                    checked={finalAnswers[index] === option}
                    onChange={() => {
                      const updated = [...finalAnswers];
                      updated[index] = option;
                      setFinalAnswers(updated);
                    }}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
          <button
            className="primary"
            onClick={() => setShowCertificate(true)}
            disabled={!courseComplete}
          >
            View certificate <Award size={18} />
          </button>
          {!courseComplete && (
            <p className="qualification">
              Complete all chapters and score 3/4 to unlock your certificate.
            </p>
          )}
        </div>
      </section>
      {showCertificate && courseComplete && (
        <section className="certificate">
          <button
            className="close"
            onClick={() => setShowCertificate(false)}
            aria-label="Close certificate"
          >
            <X />
          </button>
          <Sparkles />
          <p className="eyebrow">CERTIFICATE OF COMPLETION</p>
          <h2>OET Study Foundations</h2>
          <p>This certifies that</p>
          <h3>
            {typeof window !== "undefined"
              ? localStorage.getItem("oet-student") || "OET Learner"
              : "OET Learner"}
          </h3>
          <p>has successfully completed the OET Study Foundations programme.</p>
          <div>
            <span>DDOMPREH STOCK PREDICT</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <button className="primary print" onClick={() => window.print()}>
            Print certificate
          </button>
        </section>
      )}
      {authMode && (
        <div className="modal-backdrop" role="dialog">
          <form className="auth-modal" onSubmit={submitRegistration}>
            <button
              type="button"
              className="close"
              onClick={() => {
                setAuthMode(null);
                setMessage("");
              }}
              aria-label="Close"
            >
              <X />
            </button>
            <ShieldCheck />
            <p className="eyebrow">
              {authMode === "admin" ? "ADMIN PORTAL" : "STUDENT REGISTRATION"}
            </p>
            <h2>
              {authMode === "admin"
                ? "Manage the course"
                : "Create your account"}
            </h2>
            {authMode === "register" && (
              <>
                <div className="field-row">
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
              </>
            )}
            <label>
              {authMode === "admin" ? "Admin password" : "Password"}
              <input name="password" type="password" minLength={8} required />
            </label>
            <button className="primary" type="submit">
              {authMode === "admin" ? "Open admin portal" : "Register"}
              <ChevronRight size={18} />
            </button>
            {authMode === "admin" && (
              <p className="admin-note">
                Set <code>ADMIN_PASSWORD</code> in your environment before
                deployment.
              </p>
            )}
            {message && <p className="form-message">{message}</p>}
          </form>
        </div>
      )}
      <footer>
        <span>OET STUDY</span>
        <p>Study systematically. Communicate clearly. Take your next step.</p>
      </footer>
    </main>
  );
}
