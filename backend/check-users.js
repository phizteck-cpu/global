import prisma from './prisma/client.js';

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true
            }
        });

        console.log('\n=== Users in Database ===\n');
        users.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Username: ${user.username}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Name: ${user.firstName} ${user.lastName}`);
            console.log('---');
        });
        console.log(`\nTotal users: ${users.length}\n`);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
