import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountEmailForm } from '../AccountEmailForm';
import { GitHubMarkIcon } from '../GitHubMarkIcon';
import { AccountNameForm } from '../AccountNameForm';
import { AccountPasswordForm } from '../AccountPasswordForm';
import {
  clearAccessToken,
  fetchMe,
  getAccessToken,
  logout,
  removeGithubAccount,
  setAccessToken,
  startGithubLink,
  type ApiError,
  type MeResponse,
} from '../api';

type User = MeResponse;
type ActiveSection = 'name' | 'email' | 'password' | null;

export function AccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(
    () => searchParams.get('error'),
  );
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [activeSectionKey, setActiveSectionKey] = useState(0);
  const [socialSubmitting, setSocialSubmitting] = useState(false);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    () => searchParams.get('notice'),
  );

  useEffect(() => {
    const token = searchParams.get('accessToken');
    const hasQueryState =
      Boolean(token) ||
      searchParams.has('notice') ||
      searchParams.has('error');

    if (token) {
      setAccessToken(token);
    }

    if (hasQueryState) {
      navigate('/account', { replace: true });
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login', { replace: true });
      return;
    }

    fetchMe()
      .then(setUser)
      .catch(() => setLoadError('Could not load your account.'));
  }, [navigate]);

  function clearPageMessages() {
    setPageError(null);
    setSuccessMessage(null);
  }

  async function handleLogout() {
    clearPageMessages();
    setLogoutSubmitting(true);

    try {
      await logout();
      clearAccessToken();
      navigate('/login', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError?.message === 'Unauthorized') {
        clearAccessToken();
        navigate('/login', { replace: true });

        return;
      }

      setPageError(apiError?.message ?? 'Could not log you out.');
      setLogoutSubmitting(false);
    }
  }

  function openSection(section: Exclude<ActiveSection, null>) {
    if (section === 'email' && !user?.hasPassword) {
      return;
    }

    clearPageMessages();
    setActiveSectionKey(current => current + 1);
    setActiveSection(section);
  }

  function handleCloseSection() {
    setActiveSection(null);
  }

  function handleNameSuccess(message: string, nextName: string) {
    setUser(previousUser =>
      previousUser
        ? {
            ...previousUser,
            name: nextName,
          }
        : previousUser,
    );
    setSuccessMessage(message);
    setActiveSection(null);
  }

  function handleEmailSuccess(message: string) {
    setSuccessMessage(message);
    setActiveSection(null);
  }

  function handlePasswordSuccess(message: string) {
    setUser(previousUser =>
      previousUser
        ? {
            ...previousUser,
            hasPassword: true,
          }
        : previousUser,
    );
    setSuccessMessage(message);
    setActiveSection(null);
  }

  const requiresCurrentPassword = user?.hasPassword ?? true;
  const isGithubConnected =
    user?.socialAccounts.some(
      (socialAccount) => socialAccount.provider === 'github',
    ) ?? false;

  async function handleGithubConnect() {
    clearPageMessages();
    setSocialSubmitting(true);

    try {
      const { url } = await startGithubLink();
      window.location.assign(url);
    } catch (err) {
      const apiError = err as ApiError;
      setPageError(
        apiError?.message ?? 'Could not connect your GitHub account.',
      );
      setSocialSubmitting(false);
    }
  }

  async function handleGithubDisconnect() {
    clearPageMessages();
    setSocialSubmitting(true);

    try {
      const { message } = await removeGithubAccount();
      setUser((previousUser) =>
        previousUser
          ? {
              ...previousUser,
              socialAccounts: previousUser.socialAccounts.filter(
                (socialAccount) => socialAccount.provider !== 'github',
              ),
            }
          : previousUser,
      );
      setSuccessMessage(message);
    } catch (err) {
      const apiError = err as ApiError;
      setPageError(apiError?.message ?? 'Could not remove GitHub.');
    } finally {
      setSocialSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px' }}>
        <p style={{ color: '#c00' }}>{loadError}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '60px auto', padding: '0 16px' }}>
      <h2>Your account</h2>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: 16,
        }}
      >
        <tbody>
          <tr>
            <th
              scope="row"
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                border: '1px solid #333',
                width: '35%',
              }}
            >
              Name
            </th>
            <td style={{ padding: '10px 12px', border: '1px solid #333' }}>
              {user.name}
            </td>
          </tr>
          <tr>
            <th
              scope="row"
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                border: '1px solid #333',
              }}
            >
              Email
            </th>
            <td style={{ padding: '10px 12px', border: '1px solid #333' }}>
              {user.email}
            </td>
          </tr>
        </tbody>
      </table>

      {successMessage && (
        <p style={{ color: '#0a6b2d', margin: '0 0 16px' }}>{successMessage}</p>
      )}

      {pageError && (
        <p style={{ color: '#c00', margin: '0 0 16px' }}>{pageError}</p>
      )}

      <div
        style={{
          marginBottom: 20,
          padding: 16,
          border: '1px solid #d7d7d7',
          borderRadius: 12,
        }}
      >
        <h3 style={{ margin: '0 0 12px' }}>Sign-in methods</h3>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ margin: '0 0 4px', fontWeight: 700 }}>GitHub</p>
            <p style={{ margin: 0, fontSize: 14, color: '#555' }}>
              {isGithubConnected
                ? 'Connected and ready to use for sign-in.'
                : 'Connect GitHub to sign in without typing a password.'}
            </p>
          </div>

          {isGithubConnected ? (
            <button
              className="app-button app-button--danger"
              type="button"
              onClick={handleGithubDisconnect}
              disabled={socialSubmitting}
            >
              {socialSubmitting ? 'Removing...' : 'Remove GitHub'}
            </button>
          ) : (
            <button
              className="app-button"
              type="button"
              onClick={handleGithubConnect}
              disabled={socialSubmitting}
            >
              <span className="app-button__content">
                <span className="app-button__icon">
                  <GitHubMarkIcon />
                </span>
                <span>
                  {socialSubmitting ? 'Opening GitHub...' : 'Connect GitHub'}
                </span>
              </span>
            </button>
          )}
        </div>

        {!user.hasPassword && (
          <p style={{ margin: '12px 0 0', fontSize: 13, color: '#555' }}>
            Set a password before removing GitHub so your account keeps another
            way to sign in.
          </p>
        )}
      </div>

      <div
        style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <button
          className="app-button"
          type="button"
          onClick={() => openSection('name')}
        >
          Change Name
        </button>
        <button
          className="app-button"
          type="button"
          onClick={() => openSection('email')}
          disabled={!user.hasPassword}
        >
          Change Email
        </button>
        <button
          className="app-button"
          type="button"
          onClick={() => openSection('password')}
        >
          {user.hasPassword ? 'Change Password' : 'Set Password'}
        </button>
        <button
          className="app-button app-button--danger"
          type="button"
          onClick={handleLogout}
          disabled={logoutSubmitting}
        >
          {logoutSubmitting ? 'Logging out...' : 'Log out'}
        </button>
      </div>

      {!user.hasPassword && (
        <p style={{ margin: '12px 0 0', fontSize: 13, color: '#555' }}>
          This account was created with GitHub. Set a password if you also want
          to use email/password sign-in and email changes.
        </p>
      )}

      {activeSection === 'name' && (
        <AccountNameForm
          key={`name-${activeSectionKey}`}
          onCancel={handleCloseSection}
          onClearPageMessages={clearPageMessages}
          onSuccess={handleNameSuccess}
        />
      )}

      {activeSection === 'email' && (
        <AccountEmailForm
          key={`email-${activeSectionKey}`}
          onCancel={handleCloseSection}
          onClearPageMessages={clearPageMessages}
          onSuccess={handleEmailSuccess}
        />
      )}

      {activeSection === 'password' && (
        <AccountPasswordForm
          key={`password-${activeSectionKey}`}
          requiresCurrentPassword={requiresCurrentPassword}
          onCancel={handleCloseSection}
          onClearPageMessages={clearPageMessages}
          onSuccess={handlePasswordSuccess}
        />
      )}
    </div>
  );
}
