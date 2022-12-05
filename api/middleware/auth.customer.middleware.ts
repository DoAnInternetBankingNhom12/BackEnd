import * as jwt from 'jsonwebtoken';

const verifyTokenCustom = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');

    if (!token) {
      return res.status(403).json(
        {
          mgs: 'A token is required for authentication!'
        });
    }

    const token_key = process.env.TOKEN_JWT_KEY as string;
    const user: any = jwt.verify(token, token_key);
    
    if (user) {
      req.body.user = user;
      return next();
    }

    return res.status(401).json({
      mgs: 'Account does not have access!'
    });
  } catch (err) {
    return res.status(401).json({
      mgs: 'Invalid token!'
    });
  }

  return next();
};

export default verifyTokenCustom;
