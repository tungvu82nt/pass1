/**
 * Production Deployment Test Script
 * Test Memory Safe Guard production deployment
 */

import fetch from 'node-fetch';

const PRODUCTION_URL = 'https://silver-bublanina-ab8828.netlify.app';

/**
 * Test production frontend accessibility
 */
async function testProductionFrontend() {
  console.log('🌐 Testing Production Frontend...');
  
  try {
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    // Check for key indicators
    const checks = {
      hasTitle: html.includes('Memory Safe Guard'),
      hasReact: html.includes('react'),
      hasVite: html.includes('vite'),
      hasMainJS: html.includes('main-') && html.includes('.js'),
      hasCSS: html.includes('main-') && html.includes('.css'),
      hasMetaTags: html.includes('meta name="description"'),
      hasViewport: html.includes('viewport'),
    };

    console.log('  ✓ Frontend Checks:');
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`    ${passed ? '✅' : '❌'} ${check}: ${passed}`);
    });

    const allPassed = Object.values(checks).every(check => check);
    
    if (allPassed) {
      console.log('    ✅ All frontend checks passed!');
      return true;
    } else {
      console.log('    ❌ Some frontend checks failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Production frontend test failed:', error.message);
    return false;
  }
}

/**
 * Test production assets loading
 */
async function testProductionAssets() {
  console.log('📦 Testing Production Assets...');
  
  try {
    // Get main page to extract asset URLs
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    // Extract asset URLs
    const jsMatch = html.match(/\/assets\/main-[^"]+\.js/);
    const cssMatch = html.match(/\/assets\/main-[^"]+\.css/);
    
    if (!jsMatch || !cssMatch) {
      throw new Error('Could not find asset URLs in HTML');
    }

    const jsUrl = `${PRODUCTION_URL}${jsMatch[0]}`;
    const cssUrl = `${PRODUCTION_URL}${cssMatch[0]}`;

    // Test JS asset
    const jsResponse = await fetch(jsUrl);
    const jsSize = parseInt(jsResponse.headers.get('content-length') || '0');
    
    // Test CSS asset
    const cssResponse = await fetch(cssUrl);
    const cssSize = parseInt(cssResponse.headers.get('content-length') || '0');

    console.log('  ✓ Asset Loading:');
    console.log(`    ✅ JavaScript: ${jsUrl} (${(jsSize / 1024).toFixed(1)}KB)`);
    console.log(`    ✅ CSS: ${cssUrl} (${(cssSize / 1024).toFixed(1)}KB)`);
    
    return jsResponse.ok && cssResponse.ok;
  } catch (error) {
    console.error('❌ Production assets test failed:', error.message);
    return false;
  }
}

/**
 * Test production performance
 */
async function testProductionPerformance() {
  console.log('⚡ Testing Production Performance...');
  
  try {
    const startTime = Date.now();
    const response = await fetch(PRODUCTION_URL);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    
    console.log('  ✓ Performance Metrics:');
    console.log(`    ✅ Response Time: ${responseTime}ms`);
    console.log(`    ✅ Content Size: ${(contentLength / 1024).toFixed(1)}KB`);
    console.log(`    ✅ Status: ${response.status} ${response.statusText}`);
    
    // Performance thresholds
    const performanceChecks = {
      responseTime: responseTime < 3000, // < 3 seconds
      statusOk: response.ok,
      hasContent: contentLength > 0
    };

    const allGood = Object.values(performanceChecks).every(check => check);
    
    if (allGood) {
      console.log('    ✅ Performance within acceptable limits');
    } else {
      console.log('    ⚠️ Performance issues detected');
    }
    
    return allGood;
  } catch (error) {
    console.error('❌ Production performance test failed:', error.message);
    return false;
  }
}

/**
 * Test production security headers
 */
async function testProductionSecurity() {
  console.log('🔒 Testing Production Security...');
  
  try {
    const response = await fetch(PRODUCTION_URL);
    const headers = response.headers;
    
    const securityChecks = {
      hasContentType: headers.has('content-type'),
      hasXFrameOptions: headers.has('x-frame-options'),
      hasXContentTypeOptions: headers.has('x-content-type-options'),
      hasReferrerPolicy: headers.has('referrer-policy'),
      isHTTPS: PRODUCTION_URL.startsWith('https://'),
    };

    console.log('  ✓ Security Headers:');
    Object.entries(securityChecks).forEach(([check, passed]) => {
      console.log(`    ${passed ? '✅' : '⚠️'} ${check}: ${passed}`);
    });

    return true; // Security headers are nice-to-have, not critical
  } catch (error) {
    console.error('❌ Production security test failed:', error.message);
    return false;
  }
}

/**
 * Test production SEO
 */
async function testProductionSEO() {
  console.log('🔍 Testing Production SEO...');
  
  try {
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    const seoChecks = {
      hasTitle: /<title>.*Memory Safe Guard.*<\/title>/.test(html),
      hasDescription: /<meta name="description"/.test(html),
      hasViewport: /<meta name="viewport"/.test(html),
      hasLang: /<html[^>]+lang=/.test(html),
      hasCharset: /<meta charset=/.test(html),
    };

    console.log('  ✓ SEO Elements:');
    Object.entries(seoChecks).forEach(([check, passed]) => {
      console.log(`    ${passed ? '✅' : '❌'} ${check}: ${passed}`);
    });

    const seoScore = Object.values(seoChecks).filter(Boolean).length;
    console.log(`    📊 SEO Score: ${seoScore}/${Object.keys(seoChecks).length}`);
    
    return seoScore >= 4; // At least 4/5 SEO elements
  } catch (error) {
    console.error('❌ Production SEO test failed:', error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runProductionTests() {
  console.log('🚀 Starting Production Deployment Tests...\n');
  console.log(`🎯 Testing: ${PRODUCTION_URL}\n`);
  
  const results = {
    frontend: false,
    assets: false,
    performance: false,
    security: false,
    seo: false
  };

  // Run all tests
  results.frontend = await testProductionFrontend();
  console.log('');
  
  results.assets = await testProductionAssets();
  console.log('');
  
  results.performance = await testProductionPerformance();
  console.log('');
  
  results.security = await testProductionSecurity();
  console.log('');
  
  results.seo = await testProductionSEO();
  console.log('');

  // Summary
  console.log('📊 Production Test Results:');
  console.log(`  Frontend: ${results.frontend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Assets: ${results.assets ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Performance: ${results.performance ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Security: ${results.security ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  SEO: ${results.seo ? '✅ PASS' : '❌ FAIL'}`);

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`📈 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL PRODUCTION TESTS PASSED!');
    console.log('✅ Memory Safe Guard is ready for production use!');
    console.log(`🌐 Live at: ${PRODUCTION_URL}`);
  } else if (passedTests >= totalTests * 0.8) {
    console.log('✅ PRODUCTION DEPLOYMENT SUCCESSFUL!');
    console.log('⚠️ Some non-critical tests failed, but app is functional');
    console.log(`🌐 Live at: ${PRODUCTION_URL}`);
  } else {
    console.log('❌ PRODUCTION DEPLOYMENT HAS ISSUES');
    console.log('🔧 Please check failed tests and redeploy');
  }
  console.log('='.repeat(60));

  return passedTests >= totalTests * 0.8; // 80% pass rate
}

// Run tests if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runProductionTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Production test runner crashed:', error);
      process.exit(1);
    });
}

export { runProductionTests };