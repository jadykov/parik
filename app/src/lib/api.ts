export function json(data: any, status = 200) {
  return Response.json(data, { status });
}
export function error(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
