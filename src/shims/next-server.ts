type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
};

class RequestCookies {
  private map = new Map<string, string>();

  constructor(cookieHeader: string | null) {
    if (!cookieHeader) return;

    for (const part of cookieHeader.split(';')) {
      const [rawName, ...rawValue] = part.trim().split('=');
      if (!rawName) continue;
      this.map.set(rawName, rawValue.join('='));
    }
  }

  get(name: string) {
    const value = this.map.get(name);
    if (value === undefined) return undefined;
    return { name, value };
  }
}

class ResponseCookies {
  constructor(private response: Response) {}

  set(name: string, value: string, options: CookieOptions = {}) {
    const attrs = [
      `${name}=${encodeURIComponent(value)}`,
      `Path=${options.path ?? '/'}`,
      options.httpOnly ? 'HttpOnly' : '',
      options.secure ? 'Secure' : '',
      options.sameSite ? `SameSite=${options.sameSite}` : '',
      typeof options.maxAge === 'number' ? `Max-Age=${options.maxAge}` : '',
    ].filter(Boolean);

    this.response.headers.append('Set-Cookie', attrs.join('; '));
  }

  delete(name: string, options: CookieOptions = {}) {
    this.set(name, '', { ...options, maxAge: 0 });
  }
}

export class NextRequest extends Request {
  cookies: RequestCookies;
  nextUrl: URL;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    const request = input instanceof Request ? input : new Request(input, init);
    super(request, init);
    this.cookies = new RequestCookies(request.headers.get('cookie'));
    this.nextUrl = new URL(request.url);
  }
}

export class NextResponse extends Response {
  cookies: ResponseCookies;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
    this.cookies = new ResponseCookies(this);
  }

  static json(data: unknown, init?: ResponseInit) {
    const headers = new Headers(init?.headers ?? {});
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    return new NextResponse(JSON.stringify(data), {
      ...init,
      headers,
    });
  }
}
