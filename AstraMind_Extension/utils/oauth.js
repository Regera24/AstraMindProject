import CONFIG from '../config.js';

/**
 * OAuth configuration for Google Sign-In
 */
export const OAuthConfig = {
  clientId: "389350168183-srr22faut5obt27qffosm14hk5npifc7.apps.googleusercontent.com",
  authUri: "https://accounts.google.com/o/oauth2/v2/auth",
  scope: "openid email profile",
};

/**
 * Get redirect URI for Chrome extension
 * @returns {string} Chrome extension redirect URI
 */
export function getRedirectUri() {
  return chrome.identity.getRedirectURL('oauth2');
}

/**
 * Generate Google OAuth2 authorization URL for Chrome extension
 * @returns {string} Complete authorization URL
 */
export function getGoogleAuthUrl() {
  const redirectUri = getRedirectUri();
  
  const params = new URLSearchParams({
    client_id: OAuthConfig.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: OAuthConfig.scope,
    access_type: "offline",
    prompt: "select_account",
  });

  return `${OAuthConfig.authUri}?${params.toString()}`;
}

/**
 * Extract authorization code from redirect URL
 * @param {string} redirectUrl - The redirect URL containing the code
 * @returns {string|null} Authorization code or null if not found
 */
export function extractAuthCode(redirectUrl) {
  console.log('[OAuth] Extracting code from redirect URL:', redirectUrl);
  
  try {
    const url = new URL(redirectUrl);
    const code = url.searchParams.get('code');
    
    console.log('[OAuth] Code extracted:', code ? 'YES (length: ' + code.length + ')' : 'NO');
    
    // Check for error in URL
    const error = url.searchParams.get('error');
    if (error) {
      console.error('[OAuth] Error in redirect URL:', error);
      const errorDescription = url.searchParams.get('error_description');
      console.error('[OAuth] Error description:', errorDescription);
    }
    
    return code;
  } catch (error) {
    console.error('[OAuth] Failed to parse redirect URL:', error);
    return null;
  }
}

/**
 * Initiate Google OAuth flow using Chrome Identity API
 * @returns {Promise<string>} Authorization code
 */
export async function initiateGoogleOAuth() {
  console.log('[OAuth] Initiating Google OAuth flow...');
  
  return new Promise((resolve, reject) => {
    const authUrl = getGoogleAuthUrl();
    console.log('[OAuth] Auth URL:', authUrl);
    console.log('[OAuth] Redirect URI:', getRedirectUri());
    
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      (redirectUrl) => {
        console.log('[OAuth] Web auth flow completed');
        console.log('[OAuth] Redirect URL received:', redirectUrl);
        
        if (chrome.runtime.lastError) {
          console.error('[OAuth] Chrome runtime error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (!redirectUrl) {
          console.error('[OAuth] No redirect URL received');
          reject(new Error('No redirect URL received'));
          return;
        }
        
        const code = extractAuthCode(redirectUrl);
        
        if (!code) {
          console.error('[OAuth] No authorization code found in redirect URL');
          reject(new Error('No authorization code found in redirect URL'));
          return;
        }
        
        console.log('[OAuth] Authorization code successfully extracted');
        resolve(code);
      }
    );
  });
}

export default {
  OAuthConfig,
  getRedirectUri,
  getGoogleAuthUrl,
  extractAuthCode,
  initiateGoogleOAuth
};
