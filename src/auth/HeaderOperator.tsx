import { useEffect, useRef, useState } from 'react'
import { userInitials } from './mockAuth'
import { useAuth } from './AuthContext'

export function HeaderOperator() {
  const { currentUser, session, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen])

  const initials = userInitials(currentUser.displayName)

  return (
    <div className="header-operator" ref={menuRef}>
      <button
        type="button"
        className="header-operator-trigger"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="header-operator-avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="header-operator-identity hide-mobile">
          <span className="header-operator-name">{currentUser.displayName}</span>
          <span className="header-operator-role">{currentUser.role}</span>
        </span>
        <span className="header-operator-identity-compact show-mobile-only">
          <span className="header-operator-role">{currentUser.role}</span>
        </span>
      </button>

      {menuOpen ? (
        <div className="header-operator-menu" role="menu">
          <div className="header-operator-menu-header">
            <div className="header-operator-menu-name">{currentUser.displayName}</div>
            <div className="header-operator-menu-meta">{currentUser.role}</div>
            <div className="header-operator-menu-session">{session.sessionType}</div>
          </div>
          <button
            type="button"
            className="header-operator-menu-item"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false)
              signOut()
            }}
          >
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  )
}
