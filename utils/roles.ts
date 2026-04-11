import type { UserProfile } from '../types';

export type AppRole = UserProfile['role'];

export function getRoles(user: UserProfile | null | undefined): AppRole[] {
  if (!user) return [];
  const roles = (user as any).roles as AppRole[] | undefined;
  if (Array.isArray(roles) && roles.length > 0) return roles;
  return [user.role];
}

export function hasRole(user: UserProfile | null | undefined, role: AppRole): boolean {
  return getRoles(user).includes(role);
}
