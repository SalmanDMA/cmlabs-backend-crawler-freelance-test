import jwt from 'jsonwebtoken';
import InvariantError from '../exeptions/InvariantError';

export interface IGenerateToken {
	payload: {
		id: string;
		name: string;
		roleName: string;
		roleId: string;
	};
	expiresIn: number;
}

export interface IPayloadLogin {
	id: string;
	name: string;
	roleName: string;
	roleId: string;
}

const generateToken = ({ payload, expiresIn }: IGenerateToken): string => {
	const token = jwt.sign(payload as object, process.env.JWT_SECRET_KEY as string, { expiresIn });
	return token;
};

const verifyToken = (token: string): IPayloadLogin => {
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as IPayloadLogin;
		return payload;
	} catch (error) {
		throw new InvariantError('Invalid token or expired token. Please try again.');
	}
};

export { generateToken, verifyToken };
