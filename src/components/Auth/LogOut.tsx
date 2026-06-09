import { logout } from '../../api/auth';
import { clearSession } from './Session';

export default function LogOut({ onConfirm }: { onConfirm: () => void }) {
  const handleLogOut = async () => {
    try {
      // Call logout API - backend will clear refresh_token cookie
      await logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      clearSession();
    }

    // Notify parent component
    onConfirm();
  };

  return <button className="log-out-bnt" onClick={handleLogOut}>LogOut</button>;
}
