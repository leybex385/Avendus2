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
        console.log("Supabase Project URL:", this.SUPABASE_URL);
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

    // --- MESSAGES / CHAT / NOTICES ---
    async getMessages(userId) {
        const client = this.getClient();
        const { data, error } = await client
            .from('messages')
            .select('*')
            .eq('user_id', userId)
            .neq('sender', 'System') // Exclude System Notices from Chat
            .order('created_at', { ascending: true });

        return data || [];
    },

    // New: Get Notices (System Messages)
    async getNotices(userId) {
        const client = this.getClient();
        const { data, error } = await client
            .from('messages')
            .select('*')
            .eq('user_id', userId)
            .eq('sender', 'System') // Only System Notices
            .order('created_at', { ascending: false });

        return data || [];
    },

    async sendMessage(userId, message, sender = 'User') {
        const client = this.getClient();
        const { data, error } = await client
            .from('messages')
            .insert([{ user_id: userId, message, sender }]);

        return { success: !error, error };
    },

    // New: Send Notice
    async sendNotice(userId, title, message) {
        const client = this.getClient();
        // We pack title and message into the 'message' column or use a convention
        // Let's use sender='System' and put title in the message for now or just message.
        // If we want title, we might need to stringify JSON if 'message' is text.
        // For simplicity: Message is the content. Title we can prepend or assume.

        const content = message;

        const { data, error } = await client
            .from('messages')
            .insert([{
                user_id: userId,
                message: content,
                sender: 'System' // Mark as System Notice
            }]);

        return { success: !error, error };
    },

    async deleteMessage(id) {
        const client = this.getClient();
        const { error } = await client.from('messages').delete().eq('id', id);
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
    // --- BANK ACCOUNTS (ULTIMATE HYBRID MODE) ---
    getOfflineBanks(userId) {
        try {
            const raw = localStorage.getItem('avendus_offline_banks');
            const all = raw ? JSON.parse(raw) : [];
            return all.filter(b => b.user_id === userId);
        } catch (e) { return []; }
    },

    saveOfflineBank(userId, accountData) {
        const raw = localStorage.getItem('avendus_offline_banks');
        const all = raw ? JSON.parse(raw) : [];
        const newBank = { id: 'local_' + Date.now(), user_id: userId, ...accountData, created_at: new Date().toISOString() };
        all.push(newBank);
        localStorage.setItem('avendus_offline_banks', JSON.stringify(all));
        return newBank;
    },

    updateOfflineBank(id, data) {
        const raw = localStorage.getItem('avendus_offline_banks');
        let all = raw ? JSON.parse(raw) : [];
        const idx = all.findIndex(b => b.id === id);
        if (idx !== -1) {
            all[idx] = { ...all[idx], ...data };
            localStorage.setItem('avendus_offline_banks', JSON.stringify(all));
            return true;
        }
        return false;
    },

    deleteOfflineBank(id) {
        const raw = localStorage.getItem('avendus_offline_banks');
        let all = raw ? JSON.parse(raw) : [];
        const filtered = all.filter(b => b.id !== id);
        localStorage.setItem('avendus_offline_banks', JSON.stringify(filtered));
    },

    async getBankAccounts(userId) {
        const client = this.getClient();

        let onlineData = [];
        try {
            const { data, error } = await client
                .from('bank_accounts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (!error && data) onlineData = data;
        } catch (e) { console.warn("Supabase Fetch Failed, using offline."); }

        // Merge with offline data
        const offlineData = this.getOfflineBanks(userId);

        // Combine (Unique by ID if needed, but usually distinct)
        return [...onlineData, ...offlineData];
    },

    async addBankAccount(userId, accountData) {
        const client = this.getClient();
        const packet = { user_id: userId, ...accountData }; // Simplified packet

        // Since user changed DB column to TEXT, we can accept ANY ID now.
        // No more UUID restriction.

        const { data, error } = await client
            .from('bank_accounts')
            .insert([packet]);

        if (error) {
            console.error("Supabase Error:", error);
            // Fallback to offline IF online actually fails (network/server error)
            console.warn("Online Add Failed, saving offline:", error);
            this.saveOfflineBank(userId, accountData);
            return { success: true, offline: true };
        } else {
            return { success: true };
        }
    },

    async updateBankAccount(id, accountData) {
        // If it's a local ID
        if (id.toString().startsWith('local_') || id.toString().startsWith('demo_')) {
            this.updateOfflineBank(id, accountData);
            return { success: true };
        }

        const client = this.getClient();
        const { data, error } = await client.from('bank_accounts').update(accountData).eq('id', id);

        if (error) {
            // If online update fails, maybe we can't do much unless we cache edits.
            // For now, return error but user can retry.
            return { success: false, error };
        }
        return { success: true };
    },

    async deleteBankAccount(id) {
        if (id.toString().startsWith('local_') || id.toString().startsWith('demo_')) {
            this.deleteOfflineBank(id);
            return { success: true };
        }

        const client = this.getClient();
        const { error } = await client.from('bank_accounts').delete().eq('id', id);
        return { success: !error, error };
    },

    // ADMIN: Get ALL bank accounts (Online + Offline)
    async getAllBankAccounts() {
        const client = this.getClient();
        let onlineData = [];
        try {
            const { data, error } = await client
                .from('bank_accounts')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) onlineData = data;
        } catch (e) { console.warn("Admin Fetch Failed"); }

        // Also get ALL offline banks (needs a bit of trickery since offline is by user)
        // Since we are admin, we might want to see all local storage? 
        // Actually, local storage is browser specific. So Admin will only see THEIR OWN local storage.
        // But for completeness in this browser session:
        let offlineData = [];
        try {
            const raw = localStorage.getItem('avendus_offline_banks');
            offlineData = raw ? JSON.parse(raw) : [];
        } catch (e) { }

        return [...onlineData, ...offlineData];
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
    },

    async submitWithdrawal(withdrawalData) {
        const client = this.getClient();
        const { data, error } = await client
            .from('withdrawals')
            .insert([withdrawalData])
            .select()
            .single();

        return { success: !error, data, error };
    },

    // --- TRADING ---
    async submitTrade(tradeData) {
        const client = this.getClient();
        const { data, error } = await client
            .from('trades')
            .insert([tradeData])
            .select()
            .single();

        return { success: !error, data, error };
    },

    async getTradesByUserId(userId) {
        const client = this.getClient();
        const { data, error } = await client
            .from('trades')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        return data || [];
    },

    async getAllTrades() {
        const client = this.getClient();
        const { data, error } = await client
            .from('trades')
            .select('*')
            .order('created_at', { ascending: false });

        return data || [];
    },

    async updateTradeStatus(id, status, adminNote = '') {
        const client = this.getClient();
        const updateData = {
            status,
            admin_note: adminNote,
            processed_at: new Date().toISOString()
        };
        const { data, error } = await client
            .from('trades')
            .update(updateData)
            .eq('id', id);

        return { success: !error, error };
    },

    async updateUserFinancials(userId, updates) {
        const client = this.getClient();
        // Fallback for old calls if they pass positional args
        if (typeof updates !== 'object') {
            const newBalance = arguments[1];
            const newInvested = arguments[2];
            const newOutstanding = arguments[3];
            updates = { balance: newBalance };
            // Ensure available_balance is kept in sync if we're using positional args (older code)
            updates.available_balance = newBalance;

            if (newInvested !== undefined) updates.invested = newInvested;
            if (newOutstanding !== undefined) updates.outstanding = newOutstanding;
        }

        const { data, error } = await client
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select();

        if (!error && (!data || data.length === 0)) {
            return { success: false, error: { message: "User not found or update failed (RLS?)" } };
        }

        return { success: !error, data, error };
    },

    // --- PRODUCT MANAGEMENT ---
    async getProducts() {
        const client = this.getClient();
        if (!client) return [];
        const { data, error } = await client
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching products:", error);
            return [];
        }
        return data || [];
    },

    async saveProduct(productData) {
        const client = this.getClient();
        if (!client) return { success: false, message: 'Database not connected' };

        let result;
        if (productData.id && !productData.id.toString().startsWith('local_')) {
            // Update existing
            result = await client
                .from('products')
                .update(productData)
                .eq('id', productData.id);
        } else {
            // Insert new (remove local ID if any)
            const { id, ...saveData } = productData;
            result = await client
                .from('products')
                .insert([saveData]);
        }

        return { success: !result.error, error: result.error };
    },

    async deleteProduct(id) {
        const client = this.getClient();
        if (!client) return { success: false };
        const { error } = await client.from('products').delete().eq('id', id);
        return { success: !error, error };
    },

    // --- PLATFORM SETTINGS ---
    async getPlatformSettings(key) {
        const client = this.getClient();
        if (!client) return null;
        const { data, error } = await client
            .from('platform_settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error) {
            console.error(`Error fetching setting ${key}:`, error);
            return null;
        }
        return data ? data.value : null;
    },

    async updatePlatformSettings(key, value) {
        const client = this.getClient();
        if (!client) return { success: false };
        const { error } = await client
            .from('platform_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });

        return { success: !error, error };
    }
};
