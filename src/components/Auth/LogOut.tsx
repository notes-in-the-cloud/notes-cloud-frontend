import { logout } from '../../api/auth';
import { clearTokens } from '../../api/config';

export default function LogOut({ onConfirm }: { onConfirm: () => void }) {
  const handleLogOut = async () => {
    try {
      // Call logout API - backend will clear refresh_token cookie
      await logout();
    } catch (error) {
      // Even if logout API fails, still clear local tokens
      console.error('Logout API failed:', error);
      clearTokens();
    }

    // Notify parent component
    onConfirm();
  };

  return <button className="log-out-bnt" onClick={handleLogOut}>LogOut</button>;
}