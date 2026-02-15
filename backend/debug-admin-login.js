/**
 * Admin Login Debug & Fix Script
 * 
 * This script:
 * 1. Checks existing admin users in database
 * 2. Verifies role, status, and password hash
 * 3. Creates or resets admin credentials
 * 4. Tests login functionality
 */

import prisma from './prisma/client.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: path.resolve(__dirname, '.env.production') });
} else {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

// Auto-fix Hostinger Database Connection if needed
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('khaki-termite-134516.hostingersite.com')) {
    console.log('🔄 Auto-switching DATABASE_URL host to 127.0.0.1 for local execution...');
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('khaki-termite-134516.hostingersite.com', '127.0.0.1');
}

const ADMIN_CREDENTIALS = {
    email: 'superadmin@valuehills.com',
    username: 'superadmin',
    password: 'superadmin123',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SUPERADMIN',
    status: 'ACTIVE'
};

async function checkExistingAdmins() {
    console.log('\n=== CHECKING EXISTING ADMIN USERS ===\n');
    
    const admins = await prisma.user.findMany({
        where: {
            role: {
                in: ['ADMIN', 'SUPERADMIN']
            }
        },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            status: true,
            password: true,
            emailVerified: true
        }
    });
    
    if (admins.length === 0) {
        console.log('❌ No admin users found in database');
        return [];
    }
    
    console.log(`✅ Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
        console.log(`--- Admin ${index + 1} ---`);
        console.log(`  ID: ${admin.id}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Username: ${admin.username}`);
        console.log(`  Role: ${admin.role}`);
        console.log(`  Status: ${admin.status}`);
        console.log(`  Email Verified: ${admin.emailVerified}`);
        console.log(`  Password Hash: ${admin.password.substring(0, 20)}...`);
        
        // Check for issues
        const issues = [];
        if (admin.role !== 'ADMIN' && admin.role !== 'SUPERADMIN') {
            issues.push(`Invalid role: ${admin.role}`);
        }
        if (admin.status !== 'ACTIVE') {
            issues.push(`Invalid status: ${admin.status}`);
        }
        if (!admin.emailVerified) {
            issues.push('Email not verified');
        }
        
        if (issues.length > 0) {
            console.log(`  ⚠️  Issues: ${issues.join(', ')}`);
        } else {
            console.log(`  ✅ All checks passed`);
        }
        console.log('');
    });
    
    return admins;
}

async function verifyPasswordHash(admin) {
    console.log('\n=== VERIFYING PASSWORD HASH ===\n');
    
    // The expected hash format for bcrypt
    const isValidHash = admin.password.startsWith('$2') && admin.password.length >= 60;
    console.log(`Password hash valid format: ${isValidHash ? '✅' : '❌'}`);
    
    // Try to verify with test password
    const testPassword = 'superadmin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log(`Test password 'superadmin123' matches: ${isMatch ? '✅' : '❌'}`);
    
    return { isValidHash, isMatch };
}

async function createOrUpdateAdmin() {
    console.log('\n=== CREATING/UPDATING ADMIN USER ===\n');
    
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);
    console.log(`Generated new password hash: ${hashedPassword.substring(0, 20)}...`);
    
    const admin = await prisma.user.upsert({
        where: { email: ADMIN_CREDENTIALS.email },
        update: {
            username: ADMIN_CREDENTIALS.username,
            password: hashedPassword,
            firstName: ADMIN_CREDENTIALS.firstName,
            lastName: ADMIN_CREDENTIALS.lastName,
            role: ADMIN_CREDENTIALS.role,
            status: ADMIN_CREDENTIALS.status,
            kycStatus: 'VERIFIED',
            emailVerified: true
        },
        create: {
            email: ADMIN_CREDENTIALS.email,
            username: ADMIN_CREDENTIALS.username,
            password: hashedPassword,
            firstName: ADMIN_CREDENTIALS.firstName,
            lastName: ADMIN_CREDENTIALS.lastName,
            role: ADMIN_CREDENTIALS.role,
            status: ADMIN_CREDENTIALS.status,
            kycStatus: 'VERIFIED',
            emailVerified: true
        }
    });
    
    console.log('✅ Admin user created/updated successfully:');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Status: ${admin.status}`);
    
    return admin;
}

async function testLogin() {
    console.log('\n=== TESTING LOGIN ===\n');
    
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: ADMIN_CREDENTIALS.username
            }
        });
        
        if (!user) {
            console.log('❌ User not found after creation');
            return false;
        }
        
        console.log('User found in database:');
        console.log(`  ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Status: ${user.status}`);
        
        // Test password match
        const isMatch = await bcrypt.compare(ADMIN_CREDENTIALS.password, user.password);
        console.log(`Password match: ${isMatch ? '✅' : '❌'}`);
        
        if (isMatch && user.status === 'ACTIVE') {
            console.log('\n✅ LOGIN TEST PASSED - Admin can now login with:');
            console.log(`   Username: ${ADMIN_CREDENTIALS.username}`);
            console.log(`   Password: ${ADMIN_CREDENTIALS.password}`);
            return true;
        } else {
            console.log('\n❌ LOGIN TEST FAILED');
            if (user.status !== 'ACTIVE') {
                console.log('   Reason: User status is not ACTIVE');
            }
            if (!isMatch) {
                console.log('   Reason: Password does not match');
            }
            return false;
        }
    } catch (error) {
        console.log(`❌ Login test error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('=========================================');
    console.log('   ADMIN LOGIN DEBUG & FIX SCRIPT');
    console.log('=========================================');
    
    try {
        // Step 1: Check existing admins
        const existingAdmins = await checkExistingAdmins();
        
        // Step 2: If admin exists, verify password
        if (existingAdmins.length > 0) {
            for (const admin of existingAdmins) {
                console.log(`\n--- Verifying password for ${admin.username} ---`);
                await verifyPasswordHash(admin);
            }
        }
        
        // Step 3: Create/update admin with correct credentials
        const admin = await createOrUpdateAdmin();
        
        // Step 4: Test login
        const loginSuccess = await testLogin();
        
        console.log('\n=========================================');
        console.log('   SUMMARY');
        console.log('=========================================');
        console.log(`Admin users in DB: ${existingAdmins.length}`);
        console.log(`Login test result: ${loginSuccess ? '✅ PASSED' : '❌ FAILED'}`);
        console.log('\nLogin Credentials:');
        console.log(`  Username: ${ADMIN_CREDENTIALS.username}`);
        console.log(`  Password: ${ADMIN_CREDENTIALS.password}`);
        console.log('=========================================\n');
        
    } catch (error) {
        console.error('\n❌ Script error:', error.message);
        console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
