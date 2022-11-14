import * as jwt from 'jsonwebtoken';

const verifyToken = (req: any, res: any, next: any) => {
  try {
  const token = req.headers.authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json(
    {
      mgs: 'A token is required for authentication!',
      error: {
        status: 403,
        code: 4000
      }
    });
  }
    const token_key = process.env.TOKEN_JWT_KEY as string;
    const decoded = jwt.verify(token, token_key);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({
      mgs: 'Invalid token!',
      error: {
        status: 401,
        code: 4001
      }
    });
  }

  return next();
};

export default verifyToken;
