import { useMemo } from 'react';

const getParamsFromPath = () => {
  if (typeof window === 'undefined') {
    return {} as Record<string, string>;
  }

  const parts = window.location.pathname.split('/').filter(Boolean);
  const params: Record<string, string> = {};
  if (parts.length > 0) {
    params.slug = decodeURIComponent(parts[parts.length - 1]);
    params.id = decodeURIComponent(parts[parts.length - 1]);
  }
  return params;
};

export function useRouter() {
  return {
    push: (href: string) => {
      window.location.href = href;
    },
    replace: (href: string) => {
      window.location.replace(href);
    },
    back: () => {
      window.history.back();
    },
    forward: () => {
      window.history.forward();
    },
    refresh: () => {
      window.location.reload();
    },
    prefetch: async () => undefined,
  };
}

export function useParams<T extends Record<string, string>>() {
  return useMemo(() => getParamsFromPath() as T, []);
}
