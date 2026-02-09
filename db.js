/**
 * User Database Utility (Supabase Backend)
 */

window.DB = {
    // Local Storage Keys
    CURRENT_USER_KEY: 'avendus_current_user',

    // --- SUPABASE CONFIGURATION ---
    SUPABASE_URL: 'https://gipxccfydceahzmqdoks.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcHhjY2Z5ZGNlYWh6bXFkb2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjI2NDQsImV4cCI6MjA4NjAzODY0NH0.evPHM1GdBOufR2v2KYARiG8r81McUtUAPNVovn6P6-s',
    client: null,

    getClient() {
        if (this.client) return this.client;
        if (typeof supabase === 'undefined') {
            alert("System Error: Supabase SDK not loaded. Please check your internet connection.");
            console.error("Supabase SDK not loaded!");
            return null;
        }
        this.client = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
        return this.client;
    },

    // --- AUTHENTICATION ---
    async login(mobile, password) {
        const client = this.getClient();
        if (!client) return { success: false, message: 'Database connecting...' };

        const { data, error } = await client
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .eq('password', password)
            .single();

        if (error || !data) {
            return { success: false, message: 'Invalid mobile or password.' };
        }

        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(data));
        return { success: true, user: data };
    },

    async register(mobile, password) {
        const client = this.getClient();
        const { data, error } = await client
            .from('users')
            .insert([{ mobile, password, balance: 0, invested: 0, kyc: 'Pending' }])
            .select()
            .single();

        if (error) return { success: false, message: error.message };

        // Auto-login after registration
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(data));

        return { success: true, user: data };
    },

    async resetPassword(mobile, newPassword) {
        const client = this.getClient();
        const { data, error } = await client
            .from('users')
            .update({ password: newPassword })
            .eq('mobile', mobile);

        if (error) return { success: false, message: error.message };
        return { success: true };
    },

    getCurrentUser() {
        const user = localStorage.getItem(this.CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    async refreshCurrentUser() {
        const user = this.getCurrentUser();
        if (!user) return null;

        const client = this.getClient();
        if (!client) return user;

        const { data, error } = await client
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data && !error) {
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(data));
            return data;
        }
        return user;
    },

    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = 'login.html';
    },

    forceLogout() {
        console.warn("Forcefully logging out invalid user.");
        localStorage.clear(); // Clear everything
        window.location.href = 'login.html';
    },

    // --- MESSAGES / CHAT ---
    async getMessages(userId) {
        const client = this.getClient();
        const { data, error } = await client
            .from('messages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        return data || [];
    },

    async sendMessage(userId, message, sender = 'User') {
        const client = this.getClient();
        const { data, error } = await client
            .from('messages')
            .insert([{ user_id: userId, message, sender }]);

        return { success: !error, error };
    },

    // --- KYC ---
    async submitKYC(userId, kycData) {
        const client = this.getClient();
        const { data, error } = await client
            .from('kyc_submissions')
            .insert([{ user_id: userId, ...kycData }]);

        return { success: !error, error };
    },

    async getKycByUserId(userId) {
        const client = this.getClient();
        const { data, error } = await client
            .from('kyc_submissions')
            .select('*')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .single();

        return data || null;
    },

    // --- BANK ACCOUNTS ---
    async getBankAccounts(userId) {
        const client = this.getClient();
        const { data, error } = await client
            .from('bank_accounts')
            .select('*')
            .eq('user_id', userId);
        return data || [];
    },

    async addBankAccount(userId, accountData) {
        const client = this.getClient();

        // Ensure data is clean
        const packet = {
            user_id: userId,
            bank_name: accountData.bank_name,
            account_number: accountData.account_number,
            first_name: accountData.first_name,
            last_name: accountData.last_name,
            mobile: accountData.mobile,
            ifsc: accountData.ifsc
        };

        // Check if userId is valid UUID (Supabase requires UUID)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

        if (!isUUID) {
            console.warn("User ID is not a UUID (Demo Mode?):", userId);
            // In demo mode, we can't save to real Supabase with invalid ID.
            // Mock success response so UI works
            return { success: true, demo: true };
        }

        const { data, error } = await client
            .from('bank_accounts')
            .insert([packet]);

        if (error) {
            console.error("Supabase Error:", error);
            return { success: false, error };
        }
        return { success: true };
    },

    async updateBankAccount(id, accountData) {
        const client = this.getClient();
        const { data, error } = await client
            .from('bank_accounts')
            .update(accountData)
            .eq('id', id);
        return { success: !error, error };
    },

    async deleteBankAccount(id) {
        const client = this.getClient();
        const { error } = await client
            .from('bank_accounts')
            .delete()
            .eq('id', id);
        return { success: !error, error };
    },

    // --- ADMIN METHODS ---
    async getUsers() {
        const client = this.getClient();
        const { data } = await client.from('users').select('*').order('created_at', { ascending: false });
        return data || [];
    },

    async getDeposits() {
        const client = this.getClient();
        const { data } = await client.from('deposits').select('*').order('created_at', { ascending: false });
        return data || [];
    },

    async getWithdrawals() {
        const client = this.getClient();
        const { data } = await client.from('withdrawals').select('*').order('created_at', { ascending: false });
        return data || [];
    },

    async getAllMessages() {
        const client = this.getClient();
        const { data } = await client.from('messages').select('*').order('created_at', { ascending: false });
        return data || [];
    },

    async getKycs() {
        const client = this.getClient();
        const { data } = await client.from('kyc_submissions').select('*').order('created_at', { ascending: false });
        return data || [];
    },

    async updateUser(id, updateData) {
        const client = this.getClient();
        const { data, error } = await client.from('users').update(updateData).eq('id', id);
        return { success: !error, error };
    },

    async updateKycStatus(id, status) {
        const client = this.getClient();
        const { data, error } = await client.from('kyc_submissions').update({ status }).eq('id', id);
        return { success: !error, error };
    },

    async updateDepositStatus(id, status) {
        const client = this.getClient();
        const { data, error } = await client.from('deposits').update({ status }).eq('id', id);
        return { success: !error, error };
    },

    async updateWithdrawalStatus(id, status) {
        const client = this.getClient();
        const { data, error } = await client.from('withdrawals').update({ status }).eq('id', id);
        return { success: !error, error };
    }
};
