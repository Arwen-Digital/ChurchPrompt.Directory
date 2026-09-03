import type { AstroGlobal } from 'astro';

interface RuntimeLocals {
  runtime?: {
    env?: {
      PUBLIC_CONVEX_URL?: string;
    };
  };
}

interface ConvexUserResult {
  value?: {
    role?: string;
  };
}

// Helper to extract auth context in Astro server-side code.
// Returns null if not authenticated, otherwise returns auth data
export async function requireAuth(Astro: AstroGlobal) {
  try {
    // Clerk middleware sets auth() function in locals
    const authFn = Astro.locals.auth;
    
    if (!authFn || typeof authFn !== 'function') {
      return null;
    }
    
    const authData = authFn();
    
    if (!authData?.userId) {
      return null;
    }
    
    return authData;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export function requireSignIn(Astro: AstroGlobal) {
  const { userId, redirectToSignIn } = Astro.locals.auth();
  if (!userId) {
    return redirectToSignIn();
  }
  return undefined;
}

export async function requireAdmin(Astro: AstroGlobal) {
  const signInResponse = requireSignIn(Astro);
  if (signInResponse) {
    return signInResponse;
  }

  const { userId } = Astro.locals.auth();
  const convexUrl =
    (Astro.locals as RuntimeLocals).runtime?.env?.PUBLIC_CONVEX_URL ||
    import.meta.env.PUBLIC_CONVEX_URL;

  if (!convexUrl || !userId) {
    return Astro.redirect('/?error=unauthorized');
  }

  try {
    const response = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: 'users:getUserByClerkId',
        args: { clerkId: userId },
        format: 'json',
      }),
    });

    if (!response.ok) {
      return Astro.redirect('/?error=unauthorized');
    }

    const result = (await response.json()) as ConvexUserResult;
    if (!result.value || result.value.role !== 'admin') {
      return Astro.redirect('/?error=unauthorized');
    }
  } catch (error) {
    console.error('[Auth] Error checking admin role:', error);
    return Astro.redirect('/?error=unauthorized');
  }

  return undefined;
}
