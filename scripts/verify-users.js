import dotenv from 'dotenv';
dotenv.config();
import prisma from '../prisma/client.js';

const verifyUsers = async () => {
    try {
        console.log('Starting user verification...');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                password: true,
                status: true
            }
        });

        console.log(`Found ${users.length} users.`);

        const validRoles = ['MEMBER', 'ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN', 'ACCOUNTANT'];
        let issuesFound = 0;

        for (const user of users) {
            let issues = [];

            if (!user.password || user.password.length < 10) { // bcrypt hash is usually 60 chars
                issues.push('Invalid/Missing Password Hash');
            }

            if (!validRoles.includes(user.role)) {
                issues.push(`Invalid Role: ${user.role}`);
            }

            if (issues.length > 0) {
                console.warn(`[WARN] User ID ${user.id} (${user.username}): ${issues.join(', ')}`);
                issuesFound++;
            }
        }

        if (issuesFound === 0) {
            console.log('✅ All users have valid credentials and roles.');
        } else {
            console.log(`⚠️ Found issues with ${issuesFound} users.`);
        }

    } catch (error) {
        console.error('Error verifying users:', error);
    } finally {
        await prisma.$disconnect();
    }
};

verifyUsers();
