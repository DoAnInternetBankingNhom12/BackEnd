import * as crypto from 'crypto';

export function isNull(value: any) {
    return value === null || value === undefined || value === '' || value === NaN || Object.keys(value).length === 0 || value.length === 0;
}

export function decryptedData(encryptedData: any) {
    let privateKeyString = process.env.RSA_PRIVATE_KEY as string;
    let privateKey = crypto.createPrivateKey(privateKeyString);

    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        encryptedData
    );

    return decryptedData.toString();
}

export function encryptedData(data: any) {
    let publicKeyString = process.env.RSA_PUBLIC_KEY as string;
    let publicKey = crypto.createPublicKey(publicKeyString)

    const encryptedData = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(data)
    );

    return encryptedData;
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

    pipeLine.push({ $unset: unset });

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

    return pipeLine;
}