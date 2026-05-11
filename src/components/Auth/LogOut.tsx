export default function LogOut({ onConfirm }: { onConfirm: () => void }) {
  const handleLogOut = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    onConfirm();
  };
  return <button className="log-out-bnt" onClick={handleLogOut}>LogOut</button>;
}