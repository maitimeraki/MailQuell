import React, { useState, useCallback } from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { UserDropdown } from './UserDropdown';

export function Navbar({ profile, onSignOut }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(o => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <header
      style={{
        height: 56,
        background: '#1f2937',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      <strong style={{ letterSpacing: 0.5 }}>MailQuell</strong>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{profile?.name}</div>
        <ProfileAvatar profile={profile} onClick={toggle} />
      </div>
      <UserDropdown
        profile={profile}
        open={open}
        onClose={close}
        onSignOut={onSignOut}
      />
    </header>
  );
}