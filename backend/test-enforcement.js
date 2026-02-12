/**
 * Test script for contribution enforcement system
 * Tests the auto-suspend/ban functionality
 */

import './loadEnv.js';
import prisma from './prisma/client.js';
import { enforceContributionPolicy, getEnforcementStats, checkUserEnforcement } from './services/contributionEnforcement.js';

async function testEnforcement() {
    console.log('\n=== Testing Contribution Enforcement System ===\n');

    try {
        // 1. Get current enforcement stats
        console.log('1. Fetching enforcement statistics...');
        const stats = await getEnforcementStats();
        console.log('Enforcement Stats:', JSON.stringify(stats, null, 2));

        // 2. Check specific user (member123)
        console.log('\n2. Checking member123 enforcement status...');
        const member = await prisma.user.findFirst({
            where: { username: 'member123' }
        });

        if (member) {
            const userStatus = await checkUserEnforcement(member.id);
            console.log('Member123 Status:', JSON.stringify(userStatus, null, 2));
        } else {
            console.log('member123 not found');
        }

        // 3. List all users with their contribution status
        console.log('\n3. Listing all members with contribution status...');
        const members = await prisma.user.findMany({
            where: {
                role: 'MEMBER',
                tierId: { not: null }
            },
            include: {
                tier: true,
                contributions: {
                    orderBy: { weekNumber: 'desc' },
                    take: 1
                }
            }
        });

        for (const member of members) {
            const status = await checkUserEnforcement(member.id);
            console.log(`\n- ${member.username} (${member.email})`);
            console.log(`  Status: ${member.status}`);
            console.log(`  Tier: ${member.tier?.name || 'None'}`);
            console.log(`  Missed Weeks: ${status.missedWeeks}`);
            console.log(`  Enforcement: ${status.status}`);
            console.log(`  Last Contribution: ${member.contributions[0]?.paidAt || 'Never'}`);
        }

        // 4. Run enforcement (dry run - shows what would happen)
        console.log('\n4. Running enforcement policy...');
        const result = await enforceContributionPolicy();
        console.log('Enforcement Result:', JSON.stringify(result, null, 2));

        console.log('\n=== Test Complete ===\n');

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testEnforcement();
