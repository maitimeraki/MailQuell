import _ from 'react';

export function ProfileAvatar({ profile, size = 40, onClick }) {
  if (!profile) return null;
  const initial = profile?.name?.charAt(0)?.toUpperCase() || '?';
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    cursor: 'pointer',
    objectFit: 'cover',
    display: 'block'
  };
  if (profile.picture) {
    return (
      <img                                                         
        src={profile.picture}
        // alt={`${profile.name}'s profile picture`}
        style={style}
        onClick={onClick}
      />
    );
  }
  return (
    <div
      onClick={onClick}
      style={{
        ...style,
        background: '#4A5568',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: size * 0.45
      }}
      aria-label="User initial"
    >
      {initial}
    </div>
  );
}