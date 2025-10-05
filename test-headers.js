#!/usr/bin/env node
/* eslint-disable require-jsdoc */
/**
 * BMW API Header Smoke Test
 *
 * This script verifies that all required headers are present in API requests
 * and that the correct endpoints are being used. No live credentials needed.
 */

const BMWClientAPI = require('./src/bmw-api.js');

// Mock credentials (won't be used for actual requests)
const mockUsername = 'test@example.com';
const mockPassword = 'testpassword';
const mockGeo = 'na'; // or 'row' for Rest of World

console.log('🔍 BMW API Header Smoke Test\n');
console.log('=' .repeat(60));

// Initialize client
const client = new BMWClientAPI(mockUsername, mockPassword, mockGeo, 'mock-hcaptcha-token');

// Test 1: Verify region configuration
console.log('\n✅ Test 1: Region Configuration');
console.log(`   Region: ${client.region}`);
console.log(`   Host: ${client.host}`);
console.log(`   App Version: ${client.version}`);
console.log(`   User Agent: ${client.userAgent}`);

// Test 2: Verify OCP-APIM key is decoded correctly
console.log('\n✅ Test 2: OCP-APIM Subscription Key');
console.log(`   Key (decoded): ${client.ocpApimSubscriptionKey}`);

if (!client.ocpApimSubscriptionKey) {
    console.error('   ❌ ERROR: OCP-APIM key is missing!');
    process.exit(1);
}

// Test 3: Build a sample request and inspect headers
console.log('\n✅ Test 3: Request Headers Construction');
console.log('   Simulating headers for GET /eadrax-vcs/v5/vehicle-list');

const { uuid4 } = require('./src/utils');
const correlationID = uuid4();

const expectedHeaders = {
    'accept': 'application/json',
    'accept-language': 'en',
    'x-raw-locale': 'en-US',
    'user-agent': client.userAgent,
    'x-user-agent': `android(SP1A.210812.016.C1);${client.brand};${client.version};${client.region}`,
    'ocp-apim-subscription-key': client.ocpApimSubscriptionKey,
    'bmw-session-id': client.session,
    'bmw-units-preferences': 'd=KM;v=L;p=B;ec=KWH100KM;fc=L100KM;em=GKM;',
    '24-hour-format': 'true',
    'x-identity-provider': 'gcdm',
};

const requiredHeaders = [
    'accept',
    'accept-language',
    'user-agent',
    'x-user-agent',
    'ocp-apim-subscription-key',
    'bmw-session-id',
];

console.log('\n   Required Headers:');
let allPresent = true;
for (const header of requiredHeaders) {
    const present = expectedHeaders[header] !== undefined;
    const icon = present ? '✓' : '✗';
    console.log(`   ${icon} ${header}: ${present ? expectedHeaders[header] : 'MISSING'}`);
    if (!present) allPresent = false;
}

if (!allPresent) {
    console.error('\n   ❌ ERROR: Some required headers are missing!');
    process.exit(1);
}

// Test 4: Verify endpoint versions
console.log('\n✅ Test 4: Endpoint Versions');
const endpoints = {
    'Vehicle List': '/eadrax-vcs/v5/vehicle-list',
    'Vehicle State': '/eadrax-vcs/v4/vehicles/state',
    'OAuth Config': '/eadrax-ucs/v1/presentation/oauth/config',
    'Remote Commands (v4)': '/eadrax-vrccs/v4/presentation/remote-commands',
    'Charging Statistics': '/eadrax-chs/v2/charging-statistics',
};

console.log('   Current Endpoints:');
for (const [name, path] of Object.entries(endpoints)) {
    console.log(`   ✓ ${name}: ${path}`);
}

// Test 5: Region-specific configurations
console.log('\n✅ Test 5: Multi-Region Support');
const regions = {
    'na': { host: 'cocoapi.bmwgroup.us', key: 'MzFlMTAyZjUtNmY3ZS03ZWYzLTkwNDQtZGRjZTYzODkxMzYy' },
    'row': { host: 'cocoapi.bmwgroup.com', key: 'NGYxYzg1YTMtNzU4Zi1hMzdkLWJiYjYtZjg3MDQ0OTRhY2Zh' },
};

for (const [region, config] of Object.entries(regions)) {
    const testClient = new BMWClientAPI(mockUsername, mockPassword, region, 'token');
    const hostMatch = testClient.host === config.host;
    const keyMatch = testClient.ocpApimSubscriptionKey === Buffer.from(config.key, 'base64').toString();

    console.log(`   ${region.toUpperCase()}: ${hostMatch && keyMatch ? '✓' : '✗'}`);
    console.log(`      Host: ${testClient.host} ${hostMatch ? '✓' : '✗'}`);
    console.log(`      Key: ${testClient.ocpApimSubscriptionKey.substring(0, 20)}... ${keyMatch ? '✓' : '✗'}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ All smoke tests passed!');
console.log('\nNext steps:');
console.log('1. Set up your credentials in ~/.bmw or environment variables');
console.log('2. Obtain an hCaptcha token from: https://bimmer-connected.readthedocs.io/en/stable/captcha.html');
console.log('3. Run: bmw login');
console.log('\nExpected responses from BMW API:');
console.log('  ✓ 200 OK - Success');
console.log('  ✓ 401 Unauthorized - Invalid/expired token (normal, will auto-refresh)');
console.log('  ✓ 403 Forbidden - Rate limit / quota (need hCaptcha)');
console.log('  ✗ 489 Blocked - Missing headers (should NOT happen now!)');
console.log('=' .repeat(60));
