// ── x402 client helpers (browser-native, no viem needed) ─
// These exactly match the x402 protocol spec used by x402-express

export function generateNonce(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function toBase64(str: string): string {
    return btoa(str);
}

export interface PaymentRequirements {
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: { name?: string; version?: string };
}

/**
 * Signs an EIP-3009 TransferWithAuthorization using MetaMask/Rabby/etc.
 * This matches the exact format expected by x402-express paymentMiddleware.
 */
export async function signX402Payment(
    provider: any,
    from: string,
    paymentRequirements: PaymentRequirements,
    x402Version: number
): Promise<string> {
    const nonce = generateNonce();
    const nowSec = Math.floor(Date.now() / 1000);
    const validAfter = (nowSec - 600).toString(); // 10 minutes ago
    const validBefore = (nowSec + paymentRequirements.maxTimeoutSeconds).toString();

    const chainId = paymentRequirements.network === 'base' ? 8453
        : paymentRequirements.network === 'base-sepolia' ? 84532
        : 8453; // default base

    // EIP-712 typed data for TransferWithAuthorization
    const typedData = {
        types: {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
            ],
            TransferWithAuthorization: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'validAfter', type: 'uint256' },
                { name: 'validBefore', type: 'uint256' },
                { name: 'nonce', type: 'bytes32' },
            ],
        },
        primaryType: 'TransferWithAuthorization',
        domain: {
            name: paymentRequirements.extra?.name || 'USD Coin',
            version: paymentRequirements.extra?.version || '2',
            chainId: chainId.toString(),
            verifyingContract: paymentRequirements.asset,
        },
        message: {
            from: from,
            to: paymentRequirements.payTo,
            value: paymentRequirements.maxAmountRequired,
            validAfter: validAfter,
            validBefore: validBefore,
            nonce: nonce,
        },
    };

    // Sign using MetaMask/Rabby eth_signTypedData_v4
    const signature = await provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(typedData)],
    });

    // Build payment payload matching x402-express decodePayment format
    const paymentPayload = {
        x402Version: x402Version,
        scheme: paymentRequirements.scheme,
        network: paymentRequirements.network,
        payload: {
            signature: signature,
            authorization: {
                from: from,
                to: paymentRequirements.payTo,
                value: paymentRequirements.maxAmountRequired,
                validAfter: validAfter,
                validBefore: validBefore,
                nonce: nonce,
            },
        },
    };

    return toBase64(JSON.stringify(paymentPayload));
}

// ── API base URL ─────────────────────────────────────
export const getApiBase = () => {
    // In production, skill is on same origin
    // In dev, it might be on localhost:3000
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
    }
    return window.location.origin;
};
