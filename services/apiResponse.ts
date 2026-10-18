function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    if (origin === new URL(request.url).origin) return true;
  } catch {
    return false;
  }
  return allowedOrigins().includes(origin);
}

function headersForRequest(request: Request, initial?: HeadersInit) {
  const headers = new Headers(initial);
  const origin = request.headers.get('origin');
  if (origin && isAllowedOrigin(request)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    headers.set('Access-Control-Max-Age', '600');
    headers.append('Vary', 'Origin');
  }
  return headers;
}

export function apiJson(
  request: Request,
  body: unknown,
  init: ResponseInit = {},
) {
  return Response.json(body, {
    ...init,
    headers: headersForRequest(request, init.headers),
  });
}

export function apiOptions(request: Request) {
  if (!isAllowedOrigin(request)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, {
    status: 204,
    headers: headersForRequest(request),
  });
}

export function apiEmpty(request: Request, status = 204) {
  return new Response(null, {
    status,
    headers: headersForRequest(request),
  });
}

export function apiOriginError(request: Request) {
  return isAllowedOrigin(request)
    ? null
    : apiJson(request, { error: 'This website is not allowed to use the account service.' }, {
        status: 403,
      });
}
