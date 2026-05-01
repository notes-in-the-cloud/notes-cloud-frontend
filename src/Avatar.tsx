import './Avatar.css';

interface Props {
  name?: string;
  src?: string;
  size?: number;
}

export default function Avatar({ name = 'User', src, size = 36 }: Props) {
  const initials = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (src) {
    return <img className="avatar-img" src={src} alt={name} width={size} height={size} />;
  }

  return (
    <div className="avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}