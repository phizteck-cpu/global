/**
 * Contribution Enforcement Service
 * Automatically suspends users after 3-5 missed weeks
 * Automatically bans users after 10 missed weeks
 */

import prisma from '../prisma/client.js';
import { getCurrentWeek } from '../utils/weeklyContribution.js';

/**
 * Count consecutive missed weeks for a user
 */
async function countMissedWeeks(userId) {
    const { weekStart } = getCurrentWeek();
    
    // Get all contributions for this user
    const contributions = await prisma.contribution.findMany({
        where: { userId },
        orderBy: { weekNumber: 'desc' }
    });

    if (contributions.length === 0) {
        // New user, check how long they've been registered
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const weeksSinceJoin = Math.floor((Date.now() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 7));
        return weeksSinceJoin;
    }

    // Check for missed weeks by looking at gaps in week numbers
    const lastContribution = contributions[0];
    const expectedWeek = lastContribution.weekNumber + 1;
    
    // Calculate how many weeks have passed since last contribution
    const weeksSinceLastPayment = Math.floor(
        (weekStart - new Date(lastContribution.paidAt || lastContribution.createdAt)) / (1000 * 60 * 60 * 24 * 7)
    );

    return Math.max(0, weeksSinceLastPayment);
}

/**
 * Get all users who need enforcement action
 */
async function getUsersForEnforcement() {
    // Get all active members with tiers
    const users = await prisma.user.findMany({
        where: {
            role: 'MEMBER',
            status: { in: ['ACTIVE', 'SUSPENDED'] }, // Include suspended to check for ban
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

    const results = [];

    for (const user of users) {
        const missedWeeks = await countMissedWeeks(user.id);
        
        if (missedWeeks >= 3) {
            results.push({
                userId: user.id,
                username: user.username,
                email: user.email,
                missedWeeks,
                currentStatus: user.status,
                action: missedWeeks >= 10 ? 'BAN' : 'SUSPEND'
            });
        }
    }

    return results;
}

/**
 * Suspend user for missing 3-5 weeks
 */
async function suspendUser(userId, missedWeeks) {
    await prisma.$transaction(async (tx) => {
        // Update user status
        await tx.user.update({
            where: { id: userId },
            data: { status: 'SUSPENDED' }
        });

        // Create notification
        await tx.notification.create({
            data: {
                userId,
                type: 'SYSTEM',
                title: 'Account Suspended ⚠️',
                message: `Your account has been suspended for missing ${missedWeeks} weekly contributions. Please contact support to resolve this issue.`
            }
        });

        // Create audit log
        await tx.auditLog.create({
            data: {
                adminId: 1, // System action
                action: 'AUTO_SUSPEND_MISSED_CONTRIBUTIONS',
                targetUserId: userId,
                details: `User automatically suspended for missing ${missedWeeks} consecutive weekly contributions`
            }
        });
    });

    console.log(`✓ Suspended user ${userId} for ${missedWeeks} missed weeks`);
}

/**
 * Ban user for missing 10+ weeks
 */
async function banUser(userId, missedWeeks) {
    await prisma.$transaction(async (tx) => {
        // Update user status
        await tx.user.update({
            where: { id: userId },
            data: { status: 'BANNED' }
        });

        // Create notification
        await tx.notification.create({
            data: {
                userId,
                type: 'SYSTEM',
                title: 'Account Banned 🚫',
                message: `Your account has been permanently banned for missing ${missedWeeks} weekly contributions. This is a violation of the cooperative agreement.`
            }
        });

        // Create audit log
        await tx.auditLog.create({
            data: {
                adminId: 1, // System action
                action: 'AUTO_BAN_MISSED_CONTRIBUTIONS',
                targetUserId: userId,
                details: `User automatically banned for missing ${missedWeeks} consecutive weekly contributions`
            }
        });
    });

    console.log(`✓ Banned user ${userId} for ${missedWeeks} missed weeks`);
}

/**
 * Main enforcement function - run this on a schedule
 */
export async function enforceContributionPolicy() {
    console.log('\n=== Running Contribution Enforcement ===');
    console.log(`Time: ${new Date().toISOString()}`);

    try {
        const usersForEnforcement = await getUsersForEnforcement();

        if (usersForEnforcement.length === 0) {
            console.log('✓ No users require enforcement action');
            return {
                success: true,
                suspended: 0,
                banned: 0,
                message: 'No enforcement actions needed'
            };
        }

        console.log(`Found ${usersForEnforcement.length} users requiring action:`);

        let suspendedCount = 0;
        let bannedCount = 0;

        for (const user of usersForEnforcement) {
            console.log(`\n- User: ${user.username} (${user.email})`);
            console.log(`  Missed Weeks: ${user.missedWeeks}`);
            console.log(`  Current Status: ${user.currentStatus}`);
            console.log(`  Action: ${user.action}`);

            if (user.action === 'BAN' && user.currentStatus !== 'BANNED') {
                await banUser(user.userId, user.missedWeeks);
                bannedCount++;
            } else if (user.action === 'SUSPEND' && user.currentStatus === 'ACTIVE') {
                await suspendUser(user.userId, user.missedWeeks);
                suspendedCount++;
            } else {
                console.log(`  Skipped: Already ${user.currentStatus}`);
            }
        }

        console.log('\n=== Enforcement Complete ===');
        console.log(`Suspended: ${suspendedCount}`);
        console.log(`Banned: ${bannedCount}`);

        return {
            success: true,
            suspended: suspendedCount,
            banned: bannedCount,
            totalProcessed: usersForEnforcement.length
        };

    } catch (error) {
        console.error('Error in contribution enforcement:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check if a specific user should be suspended or banned
 */
export async function checkUserEnforcement(userId) {
    const missedWeeks = await countMissedWeeks(userId);
    
    return {
        userId,
        missedWeeks,
        shouldSuspend: missedWeeks >= 3 && missedWeeks < 10,
        shouldBan: missedWeeks >= 10,
        status: missedWeeks >= 10 ? 'BAN' : missedWeeks >= 3 ? 'SUSPEND' : 'OK'
    };
}

/**
 * Get enforcement statistics
 */
export async function getEnforcementStats() {
    const users = await getUsersForEnforcement();
    
    const toSuspend = users.filter(u => u.action === 'SUSPEND' && u.currentStatus === 'ACTIVE').length;
    const toBan = users.filter(u => u.action === 'BAN' && u.currentStatus !== 'BANNED').length;
    const alreadySuspended = users.filter(u => u.currentStatus === 'SUSPENDED' && u.missedWeeks < 10).length;
    const alreadyBanned = users.filter(u => u.currentStatus === 'BANNED').length;

    return {
        pendingSuspensions: toSuspend,
        pendingBans: toBan,
        currentlySuspended: alreadySuspended,
        currentlyBanned: alreadyBanned,
        totalAtRisk: users.length
    };
}
