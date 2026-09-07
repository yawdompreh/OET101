import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const coursePath = path.join(process.cwd(), "data", "course.json");

export async function GET() {
  try {
    return Response.json(JSON.parse(await readFile(coursePath, "utf8")));
  } catch {
    return Response.json({ lessons: [] });
  }
}

export async function PUT(request: Request) {
  const { password, lessons } = await request.json();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD)
    return Response.json(
      { message: "Administrator authentication failed." },
      { status: 401 },
    );
  if (
    !Array.isArray(lessons) ||
    lessons.some(
      (lesson) =>
        !lesson.title || !lesson.goal || !Array.isArray(lesson.materials),
    )
  )
    return Response.json(
      { message: "Each chapter needs a title, objective, and materials." },
      { status: 400 },
    );
  await mkdir(path.dirname(coursePath), { recursive: true });
  await writeFile(
    coursePath,
    JSON.stringify({ lessons, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
  return Response.json({ message: "Course updates have been published." });
}
