import Avatar from "../Avatar"
import LogOut from "../Auth/LogOut";
import './HeaderBar.css';

interface Props{
    userName?:string;
    userAvatar?:string;
    notifCount?:number;
    onLogOut: () => void;
    onNotifications?: () => void;
    onReminders?: () => void;
}

export default function HeaderBar({userName="User",userAvatar,notifCount=0,onLogOut,onNotifications,onReminders}:Props){
    return (
        <header className="notes-header">
            <div className="notes-header-icon">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                </svg>
                <span className="notes-name">Notes Cloud</span>
            </div>

            <div className="notes-header-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="notes-header-search-input"type="text" placeholder="Search notes..." />
            </div>

            <div className="notes-header-action">
                <button className="notes-header-icon-btn" aria-label="Reminders" onClick={onReminders}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </button>

                <button className="notes-header-icon-btn" aria-label="Notifications" onClick={onNotifications}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {notifCount>0&&(
                        <span className="notes-header-badge">{notifCount>9?"9+":notifCount}</span>
                    )}
                </button>

                <button className="notes-header-avatar-btn"aria-label="User menu">
                    <Avatar name={userName} src={userAvatar} size={36} />
                </button>

                <LogOut onConfirm={onLogOut}/>
            </div>
        </header>
    )
}