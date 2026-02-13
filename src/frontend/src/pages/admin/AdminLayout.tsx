import { Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../../hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import ProfileSetupDialog from '../../components/auth/ProfileSetupDialog';

export default function AdminLayout() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="max-w-md w-full mx-4">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <p className="mb-4">You must be logged in to access the admin area.</p>
              <Button onClick={login} disabled={loginStatus === 'logging-in'} className="w-full">
                {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading admin status
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md mx-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="max-w-md w-full mx-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <p className="mb-4">You do not have permission to access the admin area.</p>
              <Button onClick={() => navigate({ to: '/' })} variant="outline" className="w-full">
                Return to Store
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      {showProfileSetup && <ProfileSetupDialog />}
    </>
  );
}
