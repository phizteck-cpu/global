import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || 'sk_test_mock_key';

/**
 * Initialize a transaction with Paystack
 */
export const initializeTransaction = async (email, amount, metadata = {}) => {
    try {
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: Math.round(amount * 100), // Paystack works in Kobo
                callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/wallet`,
                metadata
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Paystack Init Error:', error.response?.data || error.message);
        throw new Error('Failed to initialize payment');
    }
};

/**
 * Verify a transaction with Paystack (used if webhook fails or for immediate checks)
 */
export const verifyTransaction = async (reference) => {
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Paystack Verify Error:', error.response?.data || error.message);
        throw new Error('Verification failed');
    }
};

/**
 * Initiate a Transfer (Withdrawal) via Paystack
 * Note: Requires a Transfer Recipient to be created first in a real scenario.
 */
export const initiateTransfer = async (amount, recipientCode, reason) => {
    try {
        const response = await axios.post(
            'https://api.paystack.co/transfer',
            {
                source: 'balance',
                amount: Math.round(amount * 100),
                recipient: recipientCode,
                reason
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Paystack Transfer Error:', error.response?.data || error.message);
        throw new Error('Payout failed');
    }
};
