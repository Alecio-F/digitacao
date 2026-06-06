import styles from './UserAvatar.module.css';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  username?: string | null;
  size?: AvatarSize;
  rank?: number;
  className?: string;
}

export function UserAvatar({
  avatarUrl,
  displayName,
  username,
  size = 'md',
  rank,
  className,
}: UserAvatarProps) {
  const src = avatarUrl || '/mentor-panda.png';
  const name = displayName ?? username;
  const alt = name ? `Avatar de ${name}` : 'Avatar do jogador';

  const rankClass =
    rank === 1 ? styles.rank1 : rank === 2 ? styles.rank2 : rank === 3 ? styles.rank3 : '';

  return (
    <div
      className={[styles.avatar, styles[size], rankClass, className].filter(Boolean).join(' ')}
    >
      <img src={src} alt={alt} />
    </div>
  );
}
