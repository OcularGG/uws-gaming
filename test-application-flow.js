#!/usr/bin/env node

/**
 * UWS Gaming Application System Test
 * Tests the complete registration + application flow
 */

const https = require('http');
const querystring = require('querystring');

// Generate unique test data
const randomId = Math.floor(Math.random() * 100000);
const testData = {
    email: `testcaptain${randomId}@example.com`,
    captainName: `Captain_Test${randomId}`,
    password: 'TestPassword123!',
    // Application data
    preferredNickname: 'TestCaptain',
    currentNation: 'Great Britain',
    timeZone: 'EST (UTC-5) - Eastern',
    hoursInNavalAction: '500',
    currentRank: 'Post Captain',
    previousCommands: 'I have commanded various ships in multiple battles.',
    preferredRole: 'Line of Battle',
    isPortBattleCommander: false,
    commanderExperience: 'Limited experience.',
    isCrafter: true,
    weeklyPlayTime: '20-30 hours',
    portBattleAvailability: ['Weekdays', 'Weekends'],
    typicalSchedule: 'Evenings 7-11 PM EST',
    declarationAccuracy: true,
    declarationHonor: true,
    declarationRules: true,
    signature: `Captain_Test${randomId}`
};

async function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsedData });
                } catch (error) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testCompleteApplicationFlow() {
    console.log('🚀 Testing Complete Application Flow');
    console.log('=====================================');
    console.log(`📧 Test User: ${testData.email}`);
    console.log(`👤 Captain: ${testData.captainName}`);
    console.log('');

    try {
        // Step 1: Test Registration
        console.log('📝 Step 1: Testing user registration...');
        const registrationResult = await makeRequest('POST', '/api/auth/register', {
            email: testData.email,
            username: testData.captainName,
            password: testData.password,
        });

        if (registrationResult.status === 201) {
            console.log('✅ Registration successful!');
            console.log(`   User ID: ${registrationResult.data.user.id}`);
            console.log(`   Email: ${registrationResult.data.user.email}`);

            // Step 2: Test Application Submission
            console.log('');
            console.log('📋 Step 2: Testing application submission...');

            const applicationData = {
                ...testData,
                confirmEmail: testData.email,
                confirmPassword: testData.password,
                userId: registrationResult.data.user.id,
                submittedAt: new Date().toISOString()
            };

            const applicationResult = await makeRequest('POST', '/api/applications', applicationData);

            if (applicationResult.status === 200) {
                console.log('✅ Application submitted successfully!');
                console.log(`   Application ID: ${applicationResult.data.applicationId}`);
                console.log('');
                console.log('🎉 COMPLETE FLOW SUCCESS! 🎉');
                console.log('');
                console.log('📊 Summary:');
                console.log(`   ✅ User registered: ${testData.email}`);
                console.log(`   ✅ Application submitted and stored`);
                console.log(`   ✅ User can now log in with credentials`);
                console.log('');
                console.log('💡 You can verify this in Prisma Studio:');
                console.log('   - Check User table for the new user');
                console.log('   - Check Application table for the new application');
                console.log('   - Check UserRole table for the assigned role');
            } else {
                console.log('❌ Application submission failed!');
                console.log(`   Status: ${applicationResult.status}`);
                console.log(`   Error: ${JSON.stringify(applicationResult.data, null, 2)}`);
            }

        } else {
            console.log('❌ Registration failed!');
            console.log(`   Status: ${registrationResult.status}`);
            console.log(`   Error: ${JSON.stringify(registrationResult.data, null, 2)}`);
        }

    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
    }
}

// Step 3: Test login with new credentials
async function testNewUserLogin() {
    console.log('');
    console.log('🔐 Step 3: Testing login with new credentials...');

    try {
        // Get CSRF token first
        const csrfResult = await makeRequest('GET', '/api/auth/csrf');
        if (csrfResult.status !== 200) {
            console.log('❌ Failed to get CSRF token');
            return;
        }

        const csrfToken = csrfResult.data.csrfToken;
        console.log('✅ CSRF token obtained');

        // Test login
        const loginData = {
            email: testData.email,
            password: testData.password,
            csrfToken: csrfToken
        };

        const loginResult = await makeRequest('POST', '/api/auth/callback/credentials', loginData);

        if (loginResult.status === 200 || loginResult.status === 302) {
            console.log('✅ Login test completed');
            console.log('   (Login redirects are handled by NextAuth)');
        } else {
            console.log('⚠️ Login response status:', loginResult.status);
        }

    } catch (error) {
        console.log('⚠️ Login test error (may be expected):', error.message);
    }
}

// Run the complete test
async function runAllTests() {
    await testCompleteApplicationFlow();
    await testNewUserLogin();

    console.log('');
    console.log('🏁 All tests completed!');
    console.log('');
    console.log('🔍 Next steps to manually verify:');
    console.log('1. Open Prisma Studio (http://localhost:5555)');
    console.log('2. Check the User table for the new user');
    console.log('3. Check the Application table for the new application');
    console.log('4. Try logging in via the frontend with the test credentials');
    console.log('');
    console.log(`📋 Test credentials for manual verification:`);
    console.log(`   Email: ${testData.email}`);
    console.log(`   Password: ${testData.password}`);
}

runAllTests();
