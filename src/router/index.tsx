import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type MouseEvent
} from 'react';

export interface LocationState {
  pathname: string;
  search: string;
  hash: string;
}

interface RouterContextType {
  location: LocationState;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | null>(null);

function getCurrentLocation(): LocationState {
  return {
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
    hash: window.location.hash || ''
  };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState>(getCurrentLocation);

  useEffect(() => {
    const handlePopState = () => {
      setLocation(getCurrentLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    setLocation(getCurrentLocation());
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <RouterContext.Provider value={{ location, navigate, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
}

export function useLocation() {
  return useRouter().location;
}

export function useNavigate() {
  return useRouter().navigate;
}

export function useSearchParams(): [URLSearchParams, (params: Record<string, string>) => void] {
  const { location, navigate } = useRouter();
  const searchParams = new URLSearchParams(location.search);

  const setSearchParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(newParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, v);
      }
    });
    const qs = params.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ''}`);
  };

  return [searchParams, setSearchParams];
}

// Route pattern matcher supporting :paramName
function matchPath(
  pattern: string,
  pathname: string
): { matches: boolean; params: Record<string, string> } {
  const patternSegments = pattern.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pattern === '/' && pathname === '/') {
    return { matches: true, params: {} };
  }

  if (patternSegments.length !== pathSegments.length) {
    return { matches: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const pat = patternSegments[i];
    const seg = pathSegments[i];

    if (pat.startsWith(':')) {
      const paramName = pat.slice(1);
      params[paramName] = decodeURIComponent(seg);
    } else if (pat !== seg) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}

// Route component
export interface RouteProps {
  path: string;
  element: ReactNode;
}

export function Route({
  path,
  element
}: RouteProps) {
  const { location, navigate } = useRouter();
  const { matches, params } = matchPath(path, location.pathname);

  if (!matches) return null;

  return (
    <RouterContext.Provider value={{ location, navigate, params }}>
      {element}
    </RouterContext.Provider>
  );
}

// useParams hook
export function useParams<T extends Record<string, string>>(): T {
  const ctx = useContext(RouterContext);
  return (ctx?.params || {}) as T;
}

// Routes wrapper
export function Routes({ children }: { children: ReactNode }) {
  const { location, navigate } = useRouter();
  const childrenArray = React.Children.toArray(children);

  for (const child of childrenArray) {
    if (React.isValidElement<RouteProps>(child) && child.props.path) {
      const { matches, params } = matchPath(child.props.path, location.pathname);
      if (matches) {
        return (
          <RouterContext.Provider value={{ location, navigate, params }}>
            {child.props.element}
          </RouterContext.Provider>
        );
      }
    }
  }

  // Fallback 404 or redirect to /
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--void)',
        color: 'var(--bone)',
        padding: '24px',
        textAlign: 'center'
      }}
    >
      <span className="eyebrow" style={{ color: 'var(--rust-glow)' }}>
        ERROR 404 // SECTOR NOT FOUND
      </span>
      <h1 className="title-display h-hero" style={{ margin: '16px 0 24px' }}>
        UNKNOWN COORDINATES
      </h1>
      <p className="hero-desc">
        The requested orbital or surface coordinate does not exist in the Settlement Zero navigation grid.
      </p>
      <button
        onClick={() => navigate('/')}
        className="btn-primary"
        style={{ marginTop: '20px' }}
      >
        RETURN TO FLEET GATEWAY
      </button>
    </div>
  );
}

// Link component
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

export function Link({ to, replace, onClick, children, ...rest }: LinkProps) {
  const { navigate, location } = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Let browser handle modifier keys (new tab, etc)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
      return;
    }

    e.preventDefault();
    if (location.pathname + location.search !== to) {
      navigate(to, { replace });
    }
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
