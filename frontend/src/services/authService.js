import { sanitizeInput, secureStorage, hashPassword } from '../utils/security';
import { loginSchema, signupSchema } from '../utils/validation';

const USERS_KEY = 'luxor_users';
const SESSION_KEY = 'luxor_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ADMIN_SEEDED_KEY = 'luxor_admin_seeded';

class AuthService {
    constructor() {
        this._seedAdmin();
    }

    _seedAdmin() {
        const seeded = secureStorage.getItem(ADMIN_SEEDED_KEY);
        if (seeded) return;

        const users = secureStorage.getItem(USERS_KEY) || [];
        const adminExists = users.find(u => u.role === 'admin');
        if (!adminExists) {
            // Pre-computed SHA-256 hash of 'admin123'
            const precomputedHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
            const admin = {
                id: 'admin-1',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@luxorexplore.com',
                phone: '+201234567890',
                password: precomputedHash,
                role: 'admin',
                createdAt: new Date().toISOString(),
            };
            users.push(admin);
            secureStorage.setItem(USERS_KEY, users);
        }
        secureStorage.setItem(ADMIN_SEEDED_KEY, true);
    }

    async register(userData) {
        try {
            // Validate input
            const validation = signupSchema.safeParse(userData);
            if (!validation.success) {
                return {
                    success: false,
                    error: validation.error.errors[0].message,
                };
            }

            // Sanitize input
            const sanitized = {
                firstName: sanitizeInput(userData.firstName),
                lastName: sanitizeInput(userData.lastName),
                email: sanitizeInput(userData.email),
                phone: sanitizeInput(userData.phone),
                password: userData.password,
            };

            // Check if user exists
            const users = secureStorage.getItem(USERS_KEY) || [];
            if (users.find(u => u.email === sanitized.email)) {
                return {
                    success: false,
                    error: 'Email already registered',
                };
            }

            // Hash password
            const hashedPassword = await hashPassword(sanitized.password);

            // Determine role
            const role = userData.role === 'vendor' ? 'vendor' : 'user';

            // Create user
            const newUser = {
                id: Date.now().toString(),
                ...sanitized,
                password: hashedPassword,
                role,
                companyName: role === 'vendor' ? sanitizeInput(userData.companyName || '') : undefined,
                createdAt: new Date().toISOString(),
            };

            delete newUser.password; // Don't store in user object returned
            users.push({ ...newUser, password: hashedPassword });
            secureStorage.setItem(USERS_KEY, users);

            // Create session
            this.createSession(newUser);

            return {
                success: true,
                user: newUser,
            };
        } catch (error) {
            return {
                success: false,
                error: 'Registration failed',
            };
        }
    }

    async login(email, password) {
        try {
            // Validate
            const validation = loginSchema.safeParse({ email, password });
            if (!validation.success) {
                return {
                    success: false,
                    error: validation.error.errors[0].message,
                };
            }

            // Get users
            const users = secureStorage.getItem(USERS_KEY) || [];
            const hashedPassword = await hashPassword(password);

            const user = users.find(
                u => u.email === email && u.password === hashedPassword
            );

            if (!user) {
                return {
                    success: false,
                    error: 'Invalid email or password',
                };
            }

            // Create session
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            this.createSession(userWithoutPassword);

            return {
                success: true,
                user: userWithoutPassword,
            };
        } catch (error) {
            return {
                success: false,
                error: 'Login failed',
            };
        }
    }

    logout() {
        secureStorage.removeItem(SESSION_KEY);
    }

    createSession(user) {
        const session = {
            user,
            expiresAt: Date.now() + SESSION_DURATION,
        };
        secureStorage.setItem(SESSION_KEY, session);
    }

    getSession() {
        const session = secureStorage.getItem(SESSION_KEY);
        if (!session) return null;

        // Check if expired
        if (Date.now() > session.expiresAt) {
            this.logout();
            return null;
        }

        return session;
    }

    getCurrentUser() {
        const session = this.getSession();
        return session?.user || null;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    }

    isVendor() {
        const user = this.getCurrentUser();
        return user?.role === 'vendor';
    }

    async updateProfile(updates) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'Not authenticated' };
            }

            const users = secureStorage.getItem(USERS_KEY) || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);

            if (userIndex === -1) {
                return { success: false, error: 'User not found' };
            }

            // Update user
            users[userIndex] = {
                ...users[userIndex],
                firstName: sanitizeInput(updates.firstName),
                lastName: sanitizeInput(updates.lastName),
                phone: sanitizeInput(updates.phone),
            };

            secureStorage.setItem(USERS_KEY, users);

            // Update session
            const updatedUser = { ...users[userIndex] };
            delete updatedUser.password;
            this.createSession(updatedUser);

            return { success: true, user: updatedUser };
        } catch (error) {
            return { success: false, error: 'Update failed' };
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return { success: false, error: 'Not authenticated' };
            }

            const users = secureStorage.getItem(USERS_KEY) || [];
            const currentHashedPassword = await hashPassword(currentPassword);
            const user = users.find(
                u => u.id === currentUser.id && u.password === currentHashedPassword
            );

            if (!user) {
                return { success: false, error: 'Current password is incorrect' };
            }

            // Update password
            const newHashedPassword = await hashPassword(newPassword);
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            users[userIndex].password = newHashedPassword;
            secureStorage.setItem(USERS_KEY, users);

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Password change failed' };
        }
    }
}

export default new AuthService();
