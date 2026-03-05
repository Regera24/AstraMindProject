/**
 * Quick OAuth Test Script
 * 
 * Cách dùng:
 * 1. Mở popup extension
 * 2. Right-click → Inspect
 * 3. Vào tab Console
 * 4. Copy toàn bộ file này và paste vào Console
 * 5. Nhấn Enter
 */

(async function testOAuth() {
  console.log('='.repeat(60));
  console.log('🧪 OAUTH TEST SCRIPT');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Check Extension ID
    console.log('\n📋 Test 1: Extension ID');
    const extensionId = chrome.runtime.id;
    console.log('Extension ID:', extensionId);
    
    // Test 2: Check Redirect URI
    console.log('\n📋 Test 2: Redirect URI');
    const redirectUri = chrome.identity.getRedirectURL('oauth2');
    console.log('Redirect URI:', redirectUri);
    console.log('⚠️  Make sure this URI is added to Google Cloud Console!');
    
    // Test 3: Check OAuth Config
    console.log('\n📋 Test 3: OAuth Config');
    const manifest = chrome.runtime.getManifest();
    console.log('OAuth2 Config:', manifest.oauth2);
    console.log('Permissions:', manifest.permissions);
    
    // Test 4: Check Current Token
    console.log('\n📋 Test 4: Current Token');
    const storage = await chrome.storage.local.get(['accessToken']);
    if (storage.accessToken) {
      console.log('✅ Token exists (length:', storage.accessToken.length, ')');
      console.log('Token preview:', storage.accessToken.substring(0, 30) + '...');
    } else {
      console.log('❌ No token found');
    }
    
    // Test 5: Generate Auth URL
    console.log('\n📋 Test 5: Auth URL');
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
      client_id: manifest.oauth2.client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: manifest.oauth2.scopes.join(' '),
      access_type: 'offline',
      prompt: 'select_account'
    });
    console.log('Auth URL:', authUrl);
    
    // Test 6: Test Backend Endpoint
    console.log('\n📋 Test 6: Backend Endpoint');
    const backendUrl = 'https://astramind.io.vn/api/v1/auth/outbound/authentication';
    console.log('Backend URL:', backendUrl);
    console.log('Method: POST');
    console.log('Query Param: code=<authorization_code>');
    
    // Test 7: Test Encoding
    console.log('\n📋 Test 7: URL Encoding Test');
    const testCode = '4/0AeanS0ZqI8_test/code+with=special';
    const encoded = encodeURIComponent(testCode);
    console.log('Original:', testCode);
    console.log('Encoded:', encoded);
    console.log('Decoded:', decodeURIComponent(encoded));
    console.log('Match:', testCode === decodeURIComponent(encoded) ? '✅' : '❌');
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Extension ID:', extensionId);
    console.log('✅ Redirect URI:', redirectUri);
    console.log('✅ OAuth Config:', manifest.oauth2 ? 'OK' : 'MISSING');
    console.log('✅ Identity Permission:', manifest.permissions.includes('identity') ? 'OK' : 'MISSING');
    console.log('✅ Current Token:', storage.accessToken ? 'EXISTS' : 'NONE');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Copy Redirect URI above');
    console.log('2. Add it to Google Cloud Console');
    console.log('3. Click "Google" button to test');
    console.log('4. Check logs for detailed flow');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
})();
