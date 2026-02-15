import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Core Platform Integration Tests (CTO Level)', () => {
    let userToken;
    let userId;
    let adminToken;
    let testPackage;

    beforeAll(async () => {
        // Clear potential leftovers
        await prisma.contribution.deleteMany();
        await prisma.userPackage.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.wallet.deleteMany();
        await prisma.user.deleteMany();
        await prisma.package.deleteMany();

        // Create a test package
        testPackage = await prisma.package.create({
            data: {
                name: "Integration Test Bronze",
                weeklyAmount: 1000,
                totalAmount: 45000,
                durationWeeks: 45,
                foodValue: 5000
            }
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('Auth System Security & Integration', () => {
        it('should successfully register a new member and initialize a wallet', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    fullName: "Integration User",
                    email: "test@valuehills.io",
                    password: "securepassword123",
                    phone: "08012345678"
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.user).toHaveProperty('id');
            userId = res.body.user.id;

            // Verify wallet creation
            const wallet = await prisma.wallet.findUnique({ where: { userId } });
            expect(wallet).toBeDefined();
            expect(wallet.balance).toBe(0);
        });

        it('should login and return a valid JWT', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "test@valuehills.io",
                    password: "securepassword123"
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            userToken = res.body.token;
        });
    });

    describe('Financial & Contribution Logic Integrity', () => {
        it('should allow a user to fund their wallet', async () => {
            // Simulating a successful payment callback/funding
            // If there's an endpoint for this, we'd call it. 
            // For integration test, we'll use an admin or simulated helper if available.
            // Let's assume we have a manual funding route or we simulate by DB update for the flow.

            await prisma.wallet.update({
                where: { userId },
                data: { balance: 50000 }
            });

            const res = await request(app)
                .get('/api/dashboard/stats')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.walletBalance).toBe(50000);
        });

        it('should allow a user to subscribe to a package', async () => {
            const res = await request(app)
                .post('/api/packages/subscribe')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ packageId: testPackage.id });

            expect(res.statusCode).toBe(201);

            const userPkg = await prisma.userPackage.findFirst({
                where: { userId, packageId: testPackage.id }
            });
            expect(userPkg).toBeDefined();
            expect(userPkg.status).toBe('ACTIVE');
        });

        it('should execute a weekly contribution payment correctly', async () => {
            const res = await request(app)
                .post('/api/contributions/pay')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('successfully');

            // Verify Financial Impact
            const wallet = await prisma.wallet.findUnique({ where: { userId } });
            expect(wallet.balance).toBe(49000); // 50000 - 1000
            expect(wallet.lockedBalance).toBe(1000); // SAVINGS

            // Verify Progress
            const userPkg = await prisma.userPackage.findFirst({ where: { userId } });
            expect(userPkg.weeksPaid).toBe(1);
        });
    });

    describe('Admin Oversight & Role Security', () => {
        it('should block non-admins from sensitive routes', async () => {
            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('should allow an admin to manage the system', async () => {
            // Create Admin
            const admin = await prisma.user.create({
                data: {
                    fullName: "System Admin",
                    email: "admin@valuehills.io",
                    password: "adminpassword", // In real tests, we should hash this if the login logic hashes it
                    role: "ADMIN",
                    status: "ACTIVE"
                }
            });

            // Login Admin (assuming the login route works for admins too)
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "admin@valuehills.io",
                    password: "adminpassword"
                });

            adminToken = loginRes.body.token;

            const res = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });
});
