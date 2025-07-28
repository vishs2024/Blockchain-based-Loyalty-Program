// src/services/authService.js
import bcrypt from 'bcryptjs';
import { uploadJSONToPinata } from './ipfsService'; // Correct import
import { cryptoUtils } from '../components/utils/crypto';

class AuthService {
  constructor() {
    this.users = new Map(); // In-memory storage for demo
    this.loadUsersFromStorage();
  }

  // Load existing users from localStorage
  loadUsersFromStorage() {
    try {
      const savedUsers = localStorage.getItem('blockRewardsUsers');
      if (savedUsers) {
        const usersArray = JSON.parse(savedUsers);
        usersArray.forEach(user => {
          this.users.set(user.email, user);
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  // Save users to localStorage
  saveUsersToStorage() {
    try {
      const usersArray = Array.from(this.users.values());
      localStorage.setItem('blockRewardsUsers', JSON.stringify(usersArray));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Sign up new user
  async signup(userData) {
    try {
      const { email, password, firstName, lastName } = userData;

      // Check if user already exists
      if (this.users.has(email)) {
        return { success: false, error: 'User already exists with this email' };
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user object
      const newUser = {
        id: cryptoUtils.generateId(),
        email,
        firstName,
        lastName,
        hashedPassword,
        createdAt: new Date().toISOString(),
        walletAddress: null,
        loyaltyPoints: 0,
        ipfsCid: null
      };

      // Store user data on IPFS
      try {
        const userDataForIPFS = {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          createdAt: newUser.createdAt,
          loyaltyPoints: newUser.loyaltyPoints
        };

        const ipfsHash = await uploadJSONToPinata(userDataForIPFS);
        newUser.ipfsCid = ipfsHash;
      } catch (ipfsError) {
        console.warn('IPFS storage failed, continuing without IPFS:', ipfsError);
      }

      // Store user locally
      this.users.set(email, newUser);
      this.saveUsersToStorage();

      console.log('User created successfully:', { email, firstName, lastName });
      return { success: true, message: 'Account created successfully' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const user = this.users.get(email);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      
      if (!isValidPassword) {
        return { success: false, error: 'Invalid password' };
      }

      // Return user data (without password)
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        walletAddress: user.walletAddress,
        loyaltyPoints: user.loyaltyPoints,
        ipfsCid: user.ipfsCid
      };

      console.log('User logged in successfully:', userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Update user wallet address
  async updateWalletAddress(email, walletAddress) {
    try {
      const user = this.users.get(email);
      if (user) {
        user.walletAddress = walletAddress;
        this.users.set(email, user);
        this.saveUsersToStorage();
        return { success: true };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Error updating wallet address:', error);
      return { success: false, error: 'Update failed' };
    }
  }

  // Update user loyalty points
  async updateLoyaltyPoints(email, points) {
    try {
      const user = this.users.get(email);
      if (user) {
        user.loyaltyPoints = points;
        this.users.set(email, user);
        this.saveUsersToStorage();
        
        // Update IPFS data
        if (user.ipfsCid) {
          try {
            const updatedData = {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              createdAt: user.createdAt,
              loyaltyPoints: user.loyaltyPoints
            };
            // Upload updated data to Pinata and update CID
            const newIpfsHash = await uploadJSONToPinata(updatedData);
            user.ipfsCid = newIpfsHash;
            this.users.set(email, user);
            this.saveUsersToStorage();
          } catch (ipfsError) {
            console.warn('Failed to update IPFS data:', ipfsError);
          }
        }
        
        return { success: true };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      return { success: false, error: 'Update failed' };
    }
  }
}

export const authService = new AuthService();
