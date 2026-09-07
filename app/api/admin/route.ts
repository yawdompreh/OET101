export async function POST(request: Request) {
  const { password } = await request.json();
  if (!process.env.ADMIN_PASSWORD) return Response.json({ message: "Admin access is not configured. Add ADMIN_PASSWORD to your deployment environment." }, { status: 503 });
  if (password !== process.env.ADMIN_PASSWORD) return Response.json({ message: "Incorrect administrator password." }, { status: 401 });
  return Response.json({ message: "Administrator access granted. Course content is managed in app/page.tsx." });
}