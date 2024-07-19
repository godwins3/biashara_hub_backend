import axios from 'axios';
import crypto from 'crypto';

const consumerKey = process.env.PESAPAL_CONSUMER_KEY; // Ensure this is defined
const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET; // Ensure this is defined
const baseURL = process.env.PESAPAL_BASE_URL; // Use sandbox URL for testing

const getOAuthSignature = (url: string, method: string, params: Record<string, string>) => {
    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
        new URLSearchParams(params).toString()
    )}`;
    const signingKey = `${consumerSecret}&`;
    return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
};

export const initiatePayment = async (paymentData: any) => {
    const url = `${baseURL}/api/Transactions/SubmitOrderRequest`;
    const method = 'POST';
    const params: Record<string, string> = {
        oauth_consumer_key: consumerKey || '', // Provide a fallback to empty string
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0',
    };

    const oauthSignature = getOAuthSignature(url, method, params);
    params['oauth_signature'] = oauthSignature;

    try {
        const response = await axios.post(url, paymentData, {
            headers: {
                Authorization: `OAuth ${new URLSearchParams(params).toString()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error initiating payment:', error);
        throw error;
    }
};
