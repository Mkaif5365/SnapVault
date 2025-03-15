import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IStorage } from './storage';
import { UserLogin, UserSignup } from '@shared/schema';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'snapvault-secret-key';

// Token expiration (24 hours)
const TOKEN_EXPIRATION = '24h';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password with hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

// Verify JWT token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Add user ID to request
  (req as any).userId = decoded.userId;
  next();
};

// Register user
export const registerUser = async (storage: IStorage, userData: UserSignup) => {
  const { email, password, name } = userData;
  
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user
  const userId = uuidv4();
  await storage.createUser({
    id: userId,
    email,
    passwordHash,
    name
  });
  
  // Generate token
  const token = generateToken(userId);
  
  return {
    userId,
    name,
    email,
    token
  };
};

// Login user
export const loginUser = async (storage: IStorage, credentials: UserLogin) => {
  const { email, password } = credentials;
  
  // Get user
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Generate token
  const token = generateToken(user.id);
  
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    token
  };
}; 