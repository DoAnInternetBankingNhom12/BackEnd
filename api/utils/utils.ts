import * as crypto from 'crypto';

export function isNull(value: any) {
    return value === null || value === undefined || value === '';
}

export function isNullObj(value: any) {
    return !value || Object.keys(value).length === 0;
}

export function isNullArray(value: any) {
    return !value || value.length === 0;
}

export function verifyMySignature(verifiableData: string) {
    const signature = process.env.SIGNATURE as string;
    const isVerified = (decryptedData(verifiableData) === signature);
    return isVerified;
}

export function decryptedData(encryptedData: string) {
    try {
        const dataBuff = Buffer.from(encryptedData, 'base64');
        const privateKeyString = process.env.RSA_PRIVATE_KEY as string;
        const privateKey = crypto.createPrivateKey(privateKeyString);
    
        const decryptedData = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            dataBuff
        );
    
        return decryptedData.toString('utf8');
    } catch(err: any) {
        return undefined;
    }
}

// User for test
export function myEncryptedStingST() {
    const signature = process.env.SIGNATURE as string;
    const publicKeyString = process.env.RSA_PUBLIC_KEY as string;
    const publicKey = crypto.createPublicKey(publicKeyString);

    const signatureData = encryptedRSA(signature, publicKey);
    return signatureData;
}

export function encryptedStringST(text: string, bankId: string) {
    const publicKeyString = process.env[`${bankId}PK`] as string;
    const publicKey = crypto.createPublicKey(publicKeyString)

    const signatureData = encryptedRSA(text, publicKey);
    return signatureData;
}

function encryptedRSA(text: string, key: any) {
    const encryptedData = crypto.publicEncrypt(
        {
            key: key,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(text)
    );

    return encryptedData.toString('base64');
}

export function decodeBase64(value: any) {
    const jsonString = Buffer.from(value, 'base64').toString('utf8');
    return JSON.parse(jsonString);
}

export function getPipeLineGet(unset: string[] = [], optionSearch: any = undefined, lookups: any[] = [], sets: any[] = []) {
    unset.push('_id');
    unset.push('_status');
    unset.push('__v');

    const pipeLine: any[] = [];

    for (const lookup of lookups) {
        pipeLine.push({ $lookup: lookup });
    }

    for (const set of sets) {
        pipeLine.push({ $set: set });
    }

    if (optionSearch) {
        pipeLine.push({
            $match: optionSearch
        });
    }

    pipeLine.push({ $unset: unset });

    return pipeLine;
}

export function getTokenPartner(time: string, bankId: string) {
    const key = process.env[bankId + 'SK'] as string;
    const hmac = crypto.createHash('sha256');
    return hmac.update(time + key, 'utf8').digest('base64');
}