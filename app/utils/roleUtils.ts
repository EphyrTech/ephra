/**
 * Role Utility Functions
 * 
 * Centralized role checking logic to handle different role formats
 * from the backend (USER, CARE_PROVIDER, ADMIN vs user, care, admin)
 */

import { User } from '../services/api/auth';

export type UserRole = 'USER' | 'CARE_PROVIDER' | 'ADMIN' | 'user' | 'care_provider' | 'care' | 'admin';

/**
 * Check if a user has a care provider role
 * Handles various role formats: 'CARE_PROVIDER', 'care_provider', 'care', 'CARE'
 */
export const isCareProvider = (user: User | null | undefined): boolean => {
  if (!user?.role) return false;
  
  const role = user.role.toLowerCase();
  return role.includes('care') || role === 'care_provider';
};

/**
 * Check if a user has an admin role
 * Handles various role formats: 'ADMIN', 'admin'
 */
export const isAdmin = (user: User | null | undefined): boolean => {
  if (!user?.role) return false;
  
  const role = user.role.toLowerCase();
  return role === 'admin';
};

/**
 * Check if a user has a regular user role
 * Handles various role formats: 'USER', 'user'
 */
export const isRegularUser = (user: User | null | undefined): boolean => {
  if (!user?.role) return true; // Default to regular user if no role
  
  const role = user.role.toLowerCase();
  return role === 'user';
};

/**
 * Check if a user has admin or care provider privileges
 */
export const hasElevatedPrivileges = (user: User | null | undefined): boolean => {
  return isCareProvider(user) || isAdmin(user);
};

/**
 * Get a normalized role string for display purposes
 */
export const getNormalizedRole = (user: User | null | undefined): string => {
  if (!user?.role) return 'User';
  
  if (isCareProvider(user)) return 'Care Provider';
  if (isAdmin(user)) return 'Administrator';
  return 'User';
};

/**
 * Get role-specific navigation target for appointment creation
 */
export const getAppointmentCreationTarget = (user: User | null | undefined): string => {
  if (isCareProvider(user)) {
    return 'CreateAppointment'; // Care providers create appointments for users
  }
  return 'SpecialistType'; // Regular users select specialist type first
};

/**
 * Get role-specific screen title for the Coach tab
 */
export const getCoachScreenTitle = (user: User | null | undefined): string => {
  if (isCareProvider(user)) {
    return 'Appointments';
  }
  return 'Health Specialists';
};

/**
 * Debug function to log role information
 */
export const debugUserRole = (user: User | null | undefined, context: string = ''): void => {
  console.log(`[Role Debug${context ? ` - ${context}` : ''}]`, {
    user: user ? { id: user.id, email: user.email } : null,
    role: user?.role,
    roleType: typeof user?.role,
    roleLowercase: user?.role?.toLowerCase(),
    isCareProvider: isCareProvider(user),
    isAdmin: isAdmin(user),
    isRegularUser: isRegularUser(user),
    normalizedRole: getNormalizedRole(user),
  });
};

/**
 * Validate that a user has the required role for an action
 */
export const validateUserRole = (
  user: User | null | undefined,
  requiredRoles: UserRole[],
  actionName: string = 'this action'
): boolean => {
  if (!user?.role) {
    console.warn(`User role validation failed: No role found for ${actionName}`);
    return false;
  }

  const userRole = user.role.toLowerCase();
  const normalizedRequiredRoles = requiredRoles.map(role => role.toLowerCase());
  
  // Check for exact matches or care provider variations
  const hasRole = normalizedRequiredRoles.some(requiredRole => {
    if (requiredRole.includes('care')) {
      return userRole.includes('care') || userRole === 'care_provider';
    }
    return userRole === requiredRole;
  });

  if (!hasRole) {
    console.warn(`User role validation failed: User has role "${user.role}" but requires one of: ${requiredRoles.join(', ')} for ${actionName}`);
  }

  return hasRole;
};

export default {
  isCareProvider,
  isAdmin,
  isRegularUser,
  hasElevatedPrivileges,
  getNormalizedRole,
  getAppointmentCreationTarget,
  getCoachScreenTitle,
  debugUserRole,
  validateUserRole,
};
