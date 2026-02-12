import prisma from './prisma/client.js';

async function testPaymentProof() {
    try {
        console.log('Testing PaymentProof model...');
        const proofs = await prisma.paymentProof.findMany();
        console.log('✅ PaymentProof table exists');
        console.log('Found', proofs.length, 'payment proofs');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPaymentProof();
