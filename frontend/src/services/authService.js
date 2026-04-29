import api from '../api/axios';
import { sanitizeInput } from '../utils/security';
import { loginSchema, signupSchema } from '../utils/validation';

class AuthService {
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

            const role = userData.role === 'vendor' ? 'vendor' : 'user';

            let endpoint = '/auth/signup/tourist';
            let payload = {
                firstName: sanitized.firstName,
                lastName: sanitized.lastName,
                email: sanitized.email,
                phone: sanitized.phone,
                password: sanitized.password
            };

            if (role === 'vendor') {
                endpoint = '/auth/signup/owner';
                payload.companyName = sanitizeInput(userData.companyName || '');
                payload.licenseNumber = sanitizeInput(userData.licenseNumber || '');
            }

            const response = await api.post(endpoint, payload);
            
            return {
                success: true,
                user: response.data.user,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed',
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

            const response = await api.post('/auth/login', { email, password });

            return {
                success: true,
                user: response.data.user,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed',
            };
        }
    }

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    async getCurrentUser() {
        try {
            const response = await api.get('/auth/profile');
            return response.data.user;
        } catch (error) {
            return null;
        }
    }

}

export default new AuthService();
