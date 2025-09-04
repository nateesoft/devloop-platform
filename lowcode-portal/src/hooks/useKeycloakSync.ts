'use client';

import { useEffect, useState } from 'react';
import { useKeycloakAuth } from '@/contexts/KeycloakContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { KeycloakUserSyncRequest } from '@/lib/api';
import { getDefaultRedirectForRole } from '@/lib/routes';

export const useKeycloakSync = () => {
  const { user: keycloakUser, isAuthenticated: isKeycloakAuthenticated, token } = useKeycloakAuth();
  const { syncKeycloakUser, user: localUser, isAuthenticated: isLocalAuthenticated } = useAuth();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeycloakSync = async () => {
      // Only sync if user is authenticated with Keycloak but not locally
      if (isKeycloakAuthenticated && keycloakUser && !isLocalAuthenticated && !isSyncing) {
        setIsSyncing(true);
        setSyncError(null);

        try {
          console.log('Keycloak user detected, syncing to local database:', keycloakUser);
          
          // Do NOT send role to backend - role management is separate
          const syncData: KeycloakUserSyncRequest = {
            keycloakId: keycloakUser.id,
            email: keycloakUser.email,
            firstName: keycloakUser.firstName || 'Unknown',
            lastName: keycloakUser.lastName || 'User',
            // role: removed - let backend handle role from database
            emailVerified: keycloakUser.emailVerified
          };

          const response = await syncKeycloakUser(syncData);
          
          // Get redirect URL based on user role from backend response
          const redirectUrl = getDefaultRedirectForRole(response?.user?.role);
          console.log(`Keycloak sync successful, redirecting to ${redirectUrl} based on role: ${response?.user?.role}`);
          router.push(redirectUrl);
          
        } catch (error) {
          console.error('Failed to sync Keycloak user:', error);
          setSyncError(error instanceof Error ? error.message : 'Sync failed');
        } finally {
          setIsSyncing(false);
        }
      }
    };

    // Only run if Keycloak is ready and we have user data
    if (keycloakUser && isKeycloakAuthenticated) {
      handleKeycloakSync();
    }
  }, [isKeycloakAuthenticated, keycloakUser, isLocalAuthenticated, syncKeycloakUser, router, isSyncing]);

  return {
    isSyncing,
    syncError,
    isKeycloakAuthenticated,
    isLocalAuthenticated,
    keycloakUser,
    localUser
  };
};