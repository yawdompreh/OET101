import { pbkdf2Sync, randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
const dataPath = path.join(process.cwd(), "data", "students.json");
type Student = { username: string; firstName: string; lastName: string; email: string; telephone: string; salt: string; passwordHash: string; createdAt: string };
export async function POST(request: Request) {
  const data = await request.json(); const required = ["username", "password", "firstName", "lastName", "email", "telephone"];
  if (required.some((key) => !String(data[key] || "").trim()) || String(data.password).length < 8) return Response.json({ message: "Please complete every field. Passwords must have at least 8 characters." }, { status: 400 });
  await mkdir(path.dirname(dataPath), { recursive: true }); let students: Student[] = [];
  try { students = JSON.parse(await readFile(dataPath, "utf8")); } catch { /* The first registration creates the data file. */ }
  if (students.some((student) => student.username === data.username || student.email === data.email)) return Response.json({ message: "That username or email is already registered." }, { status: 409 });
  const salt = randomBytes(16).toString("hex"); const passwordHash = pbkdf2Sync(String(data.password), salt, 100000, 64, "sha512").toString("hex");
  students.push({ username: String(data.username), firstName: String(data.firstName), lastName: String(data.lastName), email: String(data.email), telephone: String(data.telephone), salt, passwordHash, createdAt: new Date().toISOString() }); await writeFile(dataPath, JSON.stringify(students, null, 2), "utf8");
  return Response.json({ message: "Registration complete. Your progress is ready to track." }, { status: 201 });
}