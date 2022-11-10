import * as crypto from 'crypto';

export function isNull(value: any) {
    return value === null || value === undefined || value === '' || value === NaN;
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