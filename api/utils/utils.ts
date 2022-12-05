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

export function decodeBase64(value: any) {
    const jsonString = Buffer.from(value, 'base64').toString('utf8');
    return JSON.parse(jsonString);
}

export function getPipeLineGetUser(unset: string[] = [], status?: boolean, id?: string, userName?: string, refreshToken?: string) {
    const option: any = {};

    status ? option._status = status : '';
    id ? option.id = id : '';
    userName ? option.userName = userName : '';
    refreshToken ? option.refreshToken = refreshToken : '';
    unset.push('_id');
    unset.push('_status');
    unset.push('__v');

    const pipeLine: any[] = [
        {
            $match: option
        },
        {
            $unset: unset
        },
        {
            $lookup: {
                from: 'customer',
                localField: 'id',
                foreignField: 'userId',
                as: 'customer',
                pipeline: [
                    { $project: { _id: 0, _status: 0, __v: 0 } }
                ],
            },
        },
        {
            $set: {
                customer: { $arrayElemAt: ['$customer', 0] }
            }
        },
        {
            $lookup: {
                from: 'employee',
                localField: 'id',
                foreignField: 'userId',
                as: 'employee',
                pipeline: [
                    { $project: { _id: 0, _status: 0, __v: 0 } }
                ],
            }
        },
        {
            $set: {
                employee: { $arrayElemAt: ['$employee', 0] },
            }
        },
        {
            $set:
            {
                role: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$employee.accountType', 'admin'] }, then: 'admin' },
                            { case: { $eq: ['$employee.accountType', 'employee'] }, then: 'employee' },
                            { case: { $ne: ['$customer', undefined] }, then: 'customer' }
                        ],
                        default: ''
                    }
                }
            }
        },
    ];

    return pipeLine;
}