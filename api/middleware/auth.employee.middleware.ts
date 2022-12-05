import * as jwt from 'jsonwebtoken';

const verifyTokenEmployee = (req: any, res: any, next: any) => {
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

    console.log((user.role === 'employee' || user.role === 'admin'));
    
    if (user && (user.role === 'employee' || user.role === 'admin')) {
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

export default verifyTokenEmployee;
