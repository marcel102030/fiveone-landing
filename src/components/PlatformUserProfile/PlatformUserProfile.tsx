import './PlatformUserProfile.css';
import { usePlatformUserProfile } from '../../hooks/usePlatformUserProfile';

type PlatformUserProfileProps = {
  variant?: 'card' | 'inline';
  showEmail?: boolean;
  className?: string;
};

const PlatformUserProfile = ({ variant = 'card', showEmail = true, className }: PlatformUserProfileProps) => {
  const { profile, status } = usePlatformUserProfile();

  if (!profile) {
    if (status === 'loading') {
      const classes = ['platform-user-profile', `platform-user-profile--${variant}`];
      if (className) classes.push(className);
      return (
        <div className={classes.join(' ')} aria-live="polite" aria-busy="true">
          <div className="platform-user-profile__avatar" aria-hidden>⋯</div>
          <div className="platform-user-profile__details">
            <span className="platform-user-profile__name">Carregando perfil…</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const classes = ['platform-user-profile', `platform-user-profile--${variant}`];
  if (className) classes.push(className);

  return (
    <div className={classes.join(' ')}>
      <div className="platform-user-profile__avatar" aria-hidden>{profile.initials}</div>
      <div className="platform-user-profile__details">
        <span className="platform-user-profile__name">{profile.displayName}</span>
        {showEmail && <span className="platform-user-profile__email">{profile.email}</span>}
        {profile.formationLabel ? (
          <span className="platform-user-profile__formation">{profile.formationLabel}</span>
        ) : null}
      </div>
    </div>
  );
};

export default PlatformUserProfile;

