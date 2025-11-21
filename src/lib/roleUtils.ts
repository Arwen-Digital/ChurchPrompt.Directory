/**
 * Role-based utilities for UI rendering and access control
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

export type UserRole = 'user' | 'admin';

/**
 * Check if a user has admin role
 */
export function isAdmin(role: string | undefined | null): boolean {
  return role === 'admin';
}

/**
 * Check if a user has at least the specified role level
 */
export function hasRole(userRole: string | undefined | null, requiredRole: UserRole): boolean {
  if (requiredRole === 'admin') {
    return isAdmin(userRole);
  }
  // All authenticated users have 'user' role
  return userRole === 'user' || userRole === 'admin';
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: string | undefined | null): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'user':
      return 'Member';
    default:
      return 'Guest';
  }
}

/**
 * Get role badge variant for consistent UI
 */
export function getRoleBadgeVariant(role: string | undefined | null): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'admin':
      return 'default';
    case 'user':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Features that require admin role
 */
export const ADMIN_FEATURES = {
  APPROVE_PROMPTS: 'approve_prompts',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  EDIT_ANY_PROMPT: 'edit_any_prompt',
  DELETE_ANY_PROMPT: 'delete_any_prompt',
} as const;

/**
 * Check if user can access a specific admin feature
 */
export function canAccessAdminFeature(
  userRole: string | undefined | null,
  feature: string
): boolean {
  return isAdmin(userRole) && Object.values(ADMIN_FEATURES).includes(feature as any);
}

/**
 * Get routes that should be visible based on user role
 */
export function getVisibleRoutes(
  isAuthenticated: boolean,
  userRole: string | undefined | null
): string[] {
  const baseRoutes = ['/', '/directory', '/subscribe'];
  
  if (!isAuthenticated) {
    return baseRoutes;
  }
  
  const authenticatedRoutes = [...baseRoutes, '/submit', '/profile'];
  
  if (isAdmin(userRole)) {
    return [...authenticatedRoutes, '/admin'];
  }
  
  return authenticatedRoutes;
}
