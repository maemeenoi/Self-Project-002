export async function GET() {
  return Response.json([
    { id: 1, name: "Toyota" },
    { id: 2, name: "Honda" },
  ])
}
