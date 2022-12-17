import * as crypto from 'crypto';

export function isNull(value: any) {
    return value === null || value === undefined || value === '' || value === NaN || Object.keys(value).length === 0 || value.length === 0;
}

export function verifySignature(verifiableData: string, bankId: string) {
    const signature = process.env[`${bankId}ST`] as string;
    const publicKeyString = process.env[`${bankId}PK`] as string;
    const publicKey = crypto.createPublicKey(publicKeyString)

    const isVerified = crypto.verify('sha256',
        Buffer.from(signature),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        Buffer.from(verifiableData, 'base64')
    );
    return isVerified;
}

export function verifyMySignature(verifiableData: string) {
    const signature = process.env.SIGNATURE as string;
    const publicKeyString = process.env.RSA_PUBLIC_KEY as string;
    const publicKey = crypto.createPublicKey(publicKeyString)

    const isVerified = crypto.verify('sha256',
        Buffer.from(signature),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        Buffer.from(verifiableData, 'base64'),
    );
    return isVerified;
}

export function decryptedData(encryptedData: string) {
    const dataBuff = Buffer.from(encryptedData, 'base64');
    const privateKeyString = process.env.RSA_PRIVATE_KEY as string;
    const privateKey = crypto.createPrivateKey(privateKeyString);

    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        dataBuff
    );

    return decryptedData.toString('utf8');
}

export function myEncryptedStingST() {
    const signature = process.env.SIGNATURE as string;
    const privateKeyString = process.env.RSA_PRIVATE_KEY as string;
    const privateKey = crypto.createPrivateKey(privateKeyString)

    const signatureData = encryptedSign(signature, privateKey).toString('base64');
    return signatureData;
}

export function encryptedStringST(bankId: string) {
    const signature = process.env[`${bankId}ST`] as string;
    const privateKeyString = process.env.RSA_PRIVATE_KEY as string;
    const privateKey = crypto.createPrivateKey(privateKeyString)

    const signatureData = encryptedSign(signature, privateKey).toString('base64');
    return signatureData;
}

function encryptedSign(signature: string, key: any) {
    return crypto.sign("sha256",
        Buffer.from(signature),
        {
            key: key,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        }
    );
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
    const key = process.env[bankId+'SK'] as string;
    const hmac = crypto.createHash('sha256');
    return hmac.update(time+key,'utf8').digest('base64');
}