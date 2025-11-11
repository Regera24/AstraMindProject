/**
 * Google OAuth2 Configuration
 * 
 * IMPORTANT: Make sure to:
 * 1. Create a Google Cloud Project
 * 2. Enable Google+ API
 * 3. Create OAuth 2.0 credentials
 * 4. Add authorized redirect URIs in Google Console
 * 5. Replace CLIENT_ID with your actual Google Client ID
 */

export const OAuthConfig = {
  clientId: "389350168183-srr22faut5obt27qffosm14hk5npifc7.apps.googleusercontent.com", // Replace with your actual Client ID
  redirectUri: `${window.location.origin}/oauth/callback`,
  authUri: "https://accounts.google.com/o/oauth2/v2/auth",
  scope: "openid email profile",
};

/**
 * Generate Google OAuth2 authorization URL
 * @returns {string} Complete authorization URL
 */
export const getGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: OAuthConfig.clientId,
    redirect_uri: OAuthConfig.redirectUri,
    response_type: "code",
    scope: OAuthConfig.scope,
    access_type: "offline",
    prompt: "select_account",
  });

  return `${OAuthConfig.authUri}?${params.toString()}`;
};
