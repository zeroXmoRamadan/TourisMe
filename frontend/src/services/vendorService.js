import { secureStorage } from '../utils/security';

const PROGRAMS_KEY = 'luxor_vendor_programs';

class VendorService {
    getAll() {
        return secureStorage.getItem(PROGRAMS_KEY) || [];
    }

    getByVendor(vendorId) {
        return this.getAll().filter(p => p.vendorId === vendorId);
    }

    getApproved() {
        return this.getAll().filter(p => p.status === 'approved');
    }

    getPending() {
        return this.getAll().filter(p => p.status === 'pending');
    }

    getById(id) {
        return this.getAll().find(p => p.id === id) || null;
    }

    submit(data, vendor) {
        try {
            const programs = this.getAll();
            const newProgram = {
                ...data,
                id: `vp-${Date.now()}`,
                vendorId: vendor.id,
                vendorName: vendor.companyName || `${vendor.firstName} ${vendor.lastName}`,
                status: 'pending', // pending | approved | rejected
                submittedAt: new Date().toISOString(),
                reviewedAt: null,
                reviewedBy: null,
                rating: 0,
                reviews: 0,
                bookings: Math.floor(Math.random() * 50),
            };
            programs.push(newProgram);
            secureStorage.setItem(PROGRAMS_KEY, programs);
            return { success: true, program: newProgram };
        } catch (error) {
            return { success: false, error: 'Failed to submit program' };
        }
    }

    update(id, data, vendorId) {
        try {
            const programs = this.getAll();
            const index = programs.findIndex(p => p.id === id && p.vendorId === vendorId);
            if (index === -1) return { success: false, error: 'Program not found' };

            programs[index] = {
                ...programs[index],
                ...data,
                id,
                vendorId,
                updatedAt: new Date().toISOString(),
            };
            secureStorage.setItem(PROGRAMS_KEY, programs);
            return { success: true, program: programs[index] };
        } catch (error) {
            return { success: false, error: 'Failed to update program' };
        }
    }

    delete(id, vendorId) {
        try {
            const programs = this.getAll();
            const filtered = programs.filter(p => !(p.id === id && p.vendorId === vendorId));
            if (filtered.length === programs.length) return { success: false, error: 'Program not found' };
            secureStorage.setItem(PROGRAMS_KEY, filtered);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to delete program' };
        }
    }

    // Admin actions
    approve(id, adminId) {
        const programs = this.getAll();
        const index = programs.findIndex(p => p.id === id);
        if (index === -1) return { success: false, error: 'Program not found' };

        programs[index].status = 'approved';
        programs[index].reviewedAt = new Date().toISOString();
        programs[index].reviewedBy = adminId;
        secureStorage.setItem(PROGRAMS_KEY, programs);
        return { success: true, program: programs[index] };
    }

    reject(id, adminId) {
        const programs = this.getAll();
        const index = programs.findIndex(p => p.id === id);
        if (index === -1) return { success: false, error: 'Program not found' };

        programs[index].status = 'rejected';
        programs[index].reviewedAt = new Date().toISOString();
        programs[index].reviewedBy = adminId;
        secureStorage.setItem(PROGRAMS_KEY, programs);
        return { success: true, program: programs[index] };
    }

    getStats(vendorId) {
        const programs = this.getByVendor(vendorId);
        return {
            total: programs.length,
            approved: programs.filter(p => p.status === 'approved').length,
            pending: programs.filter(p => p.status === 'pending').length,
            rejected: programs.filter(p => p.status === 'rejected').length,
            totalBookings: programs.reduce((sum, p) => sum + (p.bookings || 0), 0),
        };
    }
}

export default new VendorService();
