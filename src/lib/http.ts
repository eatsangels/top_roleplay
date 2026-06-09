export function relativeRedirect(path: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: path,
    },
  });
}

export function hasValidRequestOrigin(request: Request) {
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  if (!source) return true;

  try {
    return new URL(source).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
