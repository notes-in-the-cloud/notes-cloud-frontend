import { useState, useRef, useEffect } from 'react';
import Avatar from "../Avatar"
import { clearSession } from '../Auth/Session';
import './HeaderBar.css';

interface Props{
    userName?:string;
    userAvatar?:string;
    notifCount?:number;
    onLogOut: () => void;
    onNotifications?: () => void;
    onReminders?: () => void;
    onSettings?: () => void;
    darkMode?: boolean;
    onToggleTheme?: () => void;
}

export default function HeaderBar({
    userName = "User",
    userAvatar,
    notifCount = 0,
    onLogOut,
    onNotifications,
    onReminders,
    onSettings,
    darkMode = true,
    onToggleTheme,
}: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const handleLogOut = () => {
        clearSession();
        setMenuOpen(false);
        onLogOut();
    };

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

                <div className="avatar-menu-wrapper" ref={menuRef}>
                    <button
                        className="notes-header-avatar-btn"
                        aria-label="User menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(o => !o)}
                    >
                        <Avatar name={userName} src={userAvatar} size={36} />
                    </button>

                    {menuOpen && (
                        <div className="avatar-dropdown">
                            <div className="avatar-dropdown-user">
                                <Avatar name={userName} src={userAvatar} size={32} />
                                <span className="avatar-dropdown-name">{userName}</span>
                            </div>

                            <div className="avatar-dropdown-divider" />

                            <button className="avatar-dropdown-item" onClick={() => { onSettings?.(); setMenuOpen(false); }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                Setting
                            </button>

                            <button className="avatar-dropdown-item" onClick={onToggleTheme}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {darkMode ? (
                                        <>
                                            <circle cx="12" cy="12" r="5"/>
                                            <line x1="12" y1="1" x2="12" y2="3"/>
                                            <line x1="12" y1="21" x2="12" y2="23"/>
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                            <line x1="1" y1="12" x2="3" y2="12"/>
                                            <line x1="21" y1="12" x2="23" y2="12"/>
                                        </>
                                    ) : (
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                    )}
                                </svg>
                                {darkMode ? 'Dark mode' : 'Light mode'}
                            </button>
                            <div className="avatar-dropdown-divider" />

                            <button className="avatar-dropdown-item avatar-dropdown-logout" onClick={handleLogOut}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Exit
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}