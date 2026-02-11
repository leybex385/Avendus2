
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    if (window.lucide) lucide.createIcons();

    // Check Login & Update UI
    checkLoginStatus();

    // Initialize Carousel
    initCarousel();

    // Search Shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.querySelector('.search-input')?.focus();
        }
    });

    console.log('Premium Market Dashboard Initialized.');

    // --- Brute force fix for browser autofill on search bar ---
    const clearSearchAutofill = () => {
        document.querySelectorAll('.search-input').forEach(input => {
            const val = input.value;
            // Only clear if not in focus and looks like an autofilled number
            if (val && !input.matches(':focus')) {
                if (/^\d{6,}$/.test(val) || val.length > 5) {
                    input.value = '';
                }
            }
        });
    };
    const autofillInterval = setInterval(clearSearchAutofill, 500);
    setTimeout(() => clearInterval(autofillInterval), 5000);

    document.querySelectorAll('.search-input').forEach(input => {
        input.addEventListener('focus', function () {
            if (this.value && this.value.length > 5 && !isNaN(this.value)) {
                this.value = '';
            }
        });
    });

    // --- Universal Search Handler ---
    const globalSearchInput = document.getElementById('globalSearchInput');
    const globalSearchResults = document.getElementById('searchResults');
    let searchTimeout = null;
    const AV_API_KEY = '0AQTPTM1OF8VJQA1';

    if (globalSearchInput && globalSearchResults) {
        globalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toUpperCase();
            if (query.length < 1) {
                globalSearchResults.style.display = 'none';
                return;
            }

            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                fetchGlobalStockPrice(query);
            }, 800);
        });

        document.addEventListener('click', (e) => {
            if (!globalSearchInput.contains(e.target) && !globalSearchResults.contains(e.target)) {
                globalSearchResults.style.display = 'none';
            }
        });
    }

    function renderIndicesGrid() {
        if (!globalSearchResults) return;
        const indices = window.MarketEngine ? window.MarketEngine.getIndices() : [];

        // Exact card colors matching the screenshot
        // Sensex, Nifty50, Nifty Bank, etc.
        let html = `<div class="search-section-title">Market Overview</div>`;
        html += `<div class="index-grid">`;

        indices.forEach((idx, i) => {
            const isUp = idx.change >= 0;
            // VIX is usually green when it's up, but in the screenshot it's green? 
            // Looking at the screenshot: VIX is +1.46 (+10.73%) and it's GREEN background.
            // SENSEX is +0.48% -> Background is LIGHT RED/PINK.
            // NIFTY 50 -0.61% -> Background is LIGHT YELLOW/CREAM.
            // NIFTY BANK -0.09% -> Background is LIGHT RED/PINK.
            // NIFTY SMLCAP -0.27% -> Background is LIGHT YELLOW/CREAM.
            // NIFTY MIDCAP -0.02% -> Background is LIGHT RED/PINK.
            // VIX +10.73% -> Background is LIGHT GREEN.

            // It seems they are using alternating colors or specific ones. 
            // I'll use subtle alternating backgrounds to match the "feel".
            const bgClass = (i === 5) ? 'bg-green' : (i % 2 === 0 ? 'bg-red' : 'bg-neutral');
            const colorClass = isUp ? 'up' : 'down';

            html += `
                <div class="index-card ${bgClass}">
                    <div class="index-card-header">
                        <img src="https://flagcdn.com/w20/in.png" class="index-flag" alt="IN">
                        <span class="index-name">${idx.symbol}</span>
                        <span class="index-region">ININ</span>
                    </div>
                    <div class="index-price">${idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div class="index-change ${colorClass}">
                        <span>${isUp ? '+' : ''}${idx.change.toFixed(2)}</span>
                        <span>(${isUp ? '+' : ''}${idx.changePercent.toFixed(2)}%)</span>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        globalSearchResults.innerHTML = html;
        globalSearchResults.style.display = 'block';
    }

    async function fetchGlobalStockPrice(query) {
        if (!globalSearchResults) return;

        // 1. Instant local search (Indian Stocks)
        let localResults = [];
        if (window.MarketEngine) {
            localResults = window.MarketEngine.search(query);
        }

        // Initial render with local results
        renderGlobalSearchResults(localResults, true);

        // 2. Fetch Alpha Vantage for global quote (throttled/debounced already)
        try {
            let symbolForApi = query;
            if (!symbolForApi.includes('.')) symbolForApi += '.BSE';

            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbolForApi}&apikey=${AV_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data['Global Quote'] && data['Global Quote']['05. price']) {
                const quote = data['Global Quote'];
                const price = parseFloat(quote['05. price']);
                const sym = quote['01. symbol'];

                const globalItem = {
                    symbol: sym,
                    price: price,
                    name: 'International Market Price',
                    isGlobal: true
                };

                updateSearchResultsWithGlobal(localResults, globalItem);
            }
        } catch (e) {
            console.error("Global Search Error", e);
            renderGlobalSearchResults(localResults, false);
        }
    }

    function renderGlobalSearchResults(localResults, isSearching = false) {
        if (!globalSearchResults) return;

        let html = '';

        // 1. Separate local results by type
        const stocks = localResults.filter(r => r.type === 'stock');
        const otcs = localResults.filter(r => r.type === 'OTC');
        const ipos = localResults.filter(r => r.type === 'IPO');

        if (stocks.length > 0) {
            html += `<div class="search-section-title">Indian Stocks</div>`;
            html += stocks.map(m => createSearchItemHtml(m)).join('');
        }

        if (otcs.length > 0) {
            html += `<div class="search-section-title">OTC Markets</div>`;
            html += otcs.map(m => createSearchItemHtml(m)).join('');
        }

        if (ipos.length > 0) {
            html += `<div class="search-section-title">Active IPOs</div>`;
            html += ipos.map(m => createSearchItemHtml(m)).join('');
        }

        if (isSearching) {
            html += `<div class="search-item" style="color:#94a3b8; padding:1rem; text-align:center; font-size:0.85rem; border-top: 1px solid #f1f5f9;">
                <i data-lucide="loader-2" class="spin" style="width:14px; height:14px; vertical-align:middle; margin-right:6px;"></i> Searching global markets...
            </div>`;
        } else if (localResults.length === 0) {
            html += `<div class="search-item" style="color:#94a3b8; padding:1.5rem; text-align:center;">No stocks found</div>`;
        }

        globalSearchResults.innerHTML = html;
        globalSearchResults.style.display = 'block';
        if (window.lucide) lucide.createIcons();
    }

    function createSearchItemHtml(m) {
        return `
            <div class="search-item" onclick="globalSelectStock('${m.symbol}', '${m.name}', '${m.type || 'stock'}')">
                <div style="flex: 1;">
                    <div class="search-symbol">${m.symbol}</div>
                    <div class="search-name">${m.name}</div>
                </div>
                <div class="search-price-val">₹${m.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
        `;
    }

    function updateSearchResultsWithGlobal(localResults, globalItem) {
        // Just re-run a partial or full render
        renderGlobalSearchResults(localResults, false);

        // Append global result at the bottom
        let extraHtml = `<div class="search-section-title">Global Markets</div>`;
        extraHtml += `
            <div class="search-item" onclick="globalSelectStock('${globalItem.symbol}', '${globalItem.symbol}', 'stock')">
                <div style="flex: 1;">
                    <div class="search-symbol">${globalItem.symbol}</div>
                    <div class="search-name">${globalItem.name}</div>
                </div>
                <div class="search-price-val">₹${globalItem.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
        `;
        globalSearchResults.innerHTML += extraHtml;
    }

    window.globalSelectStock = (symbol, name, type) => {
        if (window.location.pathname.includes('market.html')) {
            if (typeof openStockDetail === 'function') {
                const s = (window.MarketEngine && window.MarketEngine.getProduct) ? window.MarketEngine.getProduct(symbol) : null;
                if (s) {
                    openStockDetail(s.symbol, s.name, 'NSE', '₹' + s.price.toLocaleString('en-IN', { minimumFractionDigits: 2 }), (s.change >= 0 ? '+' : '') + (s.change || 0).toFixed(2) + '%', (s.change >= 0 ? '#10b981' : '#ef4444'), s.type);
                } else {
                    // International/Global
                    openStockDetail(symbol, name, 'NSE', '₹0', '0%', '#10b981', type);
                }
                globalSearchResults.style.display = 'none';
                if (globalSearchInput) globalSearchInput.value = '';
            }
        } else {
            window.location.href = `market.html?symbol=${symbol}`;
        }
    };
});

// --- UI / Login Logic ---
function checkLoginStatus() {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    // Also check URL param for immediate feedback after login
    const urlParams = new URLSearchParams(window.location.search);
    const isLoggedIn = user || urlParams.get('logged_in') === 'true';

    const promoActions = document.getElementById('promoActions');
    const marketAuthPrompt = document.getElementById('marketAuthPrompt');
    const portfolioBar = document.getElementById('portfolioBar');
    const loggedOutBanner = document.getElementById('loggedOutBanner');

    if (isLoggedIn) {
        // Hide "Login" and "Learn More" buttons in the video banner
        if (promoActions) promoActions.style.display = 'none';

        // Hide "Please log in to view more" prompt
        if (marketAuthPrompt) marketAuthPrompt.style.display = 'none';

        // Show User Portfolio Bar
        if (portfolioBar) portfolioBar.style.display = 'flex';

        if (loggedOutBanner) loggedOutBanner.style.display = 'none';

        // If the inline script `syncUserData` exists, it will run automatically to update values
    } else {
        // Show Login Buttons
        if (promoActions) promoActions.style.display = 'flex';

        // Hide Portfolio
        if (portfolioBar) portfolioBar.style.display = 'none';

        if (marketAuthPrompt) marketAuthPrompt.style.display = 'block';
    }
}

// --- Global Functions (Exposed for HTML onclick) ---

window.openSettings = function () {
    const el = document.getElementById('settingsModal');
    if (el) el.style.display = 'flex';
};

window.closeSettings = function () {
    const el = document.getElementById('settingsModal');
    if (el) el.style.display = 'none';
};

window.openResetPassword = function () {
    const el = document.getElementById('resetPasswordModal');
    if (el) el.style.display = 'flex';
};

window.closeResetPassword = function () {
    const el = document.getElementById('resetPasswordModal');
    if (el) el.style.display = 'none';
};

window.toggleInternalPass = function (id, el) {
    const input = document.getElementById(id);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        el.setAttribute('data-lucide', 'eye');
    } else {
        input.type = 'password';
        el.setAttribute('data-lucide', 'eye-off');
    }
    if (window.lucide) lucide.createIcons();
};

window.handleInternalReset = async function () {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (!user) {
        alert("Please login first.");
        return;
    }

    const currentPass = document.getElementById('currentPass')?.value;
    const newPass = document.getElementById('newPassInternal')?.value;
    const confirmPass = document.getElementById('confirmPassInternal')?.value;

    if (!currentPass || !newPass || !confirmPass) {
        alert("All fields are required.");
        return;
    }

    if (currentPass !== user.password) {
        alert("Current password is incorrect.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("New passwords do not match.");
        return;
    }

    if (newPass.length < 6) {
        alert("New password must be at least 6 characters.");
        return;
    }

    const btn = document.querySelector('#resetPasswordModal .logout-btn');
    const originalText = btn ? btn.textContent : 'Update Password';
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Updating...';
    }

    try {
        const result = await window.DB.updateUser(user.id, { password: newPass });
        if (result.success) {
            alert("Password updated successfully! Please login again.");
            window.DB.logout();
        } else {
            alert("Failed to update password: " + (result.error?.message || "Unknown error"));
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred. Please try again.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
};

window.handleGuestClick = function (url) {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (user) {
        window.location.href = url;
    } else {
        // Show Top Alert
        const alertBox = document.querySelector('.top-alert-container');
        if (alertBox) {
            alertBox.style.display = 'block';
            setTimeout(() => alertBox.style.display = 'none', 3000);
        } else {
            alert("Please login to access this feature.");
        }
    }
};

// function moved to centralized async implementation below

window.closeAlert = function () {
    const alertBox = document.querySelector('.top-alert-container');
    if (alertBox) alertBox.style.display = 'none';
};

window.setActiveNav = function (element) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
};

// --- Carousel Logic ---
let currentSlide = 0;

function initCarousel() {
    // Just ensure first slide is active
    showSlide(0);
}

// Global scope for onclick access
window.changeSlide = function (direction) {
    showSlide(currentSlide + direction);
};

window.goToSlide = function (index) {
    showSlide(index);
};

function showSlide(index) {
    const slides = document.querySelectorAll('.news-slide');
    const dots = document.querySelectorAll('.carousel-dot');

    if (slides.length === 0) return;

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    currentSlide = index;

    // Update Slides
    slides.forEach((slide, i) => {
        if (i === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    // Update Dots
    dots.forEach((dot, i) => {
        if (i === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// --- New User Profile Logic ---
window.toggleUserProfile = function () {
    const submenu = document.getElementById('userProfileSubmenu');
    const chevron = document.getElementById('userProfileChevron');

    if (submenu) {
        submenu.classList.toggle('open');
        if (chevron) {
            chevron.style.transform = submenu.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
};

window.toggleSecurityMenu = function () {
    const submenu = document.getElementById('securitySubmenu');
    const chevron = document.getElementById('securityChevron');

    if (submenu) {
        submenu.classList.toggle('open');
        if (chevron) {
            chevron.style.transform = submenu.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
};

window.openWithdrawalPinModal = function () {
    const modal = document.getElementById('withdrawalPinModal');
    if (!modal) return;

    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    const title = document.getElementById('wpModalTitle');
    const desc = document.getElementById('wpModalDesc');
    const btn = document.getElementById('wpSubmitBtn');

    // Check if user has a PIN (checking if property exists and is not empty)
    const hasPin = user && user.withdrawal_pin && user.withdrawal_pin.length > 0;

    if (hasPin) {
        if (title) title.innerText = 'Update Withdrawal PIN';
        if (desc) desc.innerText = 'Update your existing withdrawal PIN.';
        if (btn) btn.innerText = 'Update Withdrawal PIN';
    } else {
        if (title) title.innerText = 'Create Withdrawal PIN';
        if (desc) desc.innerText = 'Set a new 4-6 digit withdrawal PIN for security.';
        if (btn) btn.innerText = 'Create Withdrawal PIN';
    }

    modal.style.display = 'flex';
};

window.closeWithdrawalPinModal = function () {
    const modal = document.getElementById('withdrawalPinModal');
    if (modal) modal.style.display = 'none';
};

window.handleWithdrawalPinSubmit = async function () {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (!user) { alert("Please login first."); return; }

    const loginPass = document.getElementById('wpLoginPass')?.value;
    const newPin = document.getElementById('wpNewPin')?.value;
    const confirmPin = document.getElementById('wpConfirmPin')?.value;

    if (!loginPass || !newPin || !confirmPin) {
        alert("All fields are required.");
        return;
    }

    if (loginPass !== user.password) {
        alert("Incorrect login password.");
        return;
    }

    if (newPin !== confirmPin) {
        alert("PINs do not match.");
        return;
    }

    if (newPin.length < 4) {
        alert("PIN must be at least 4 digits.");
        return;
    }

    const btn = document.getElementById('wpSubmitBtn');
    const originalText = btn ? btn.textContent : 'Submit';

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Processing...';
    }

    try {
        const result = await window.DB.updateUser(user.id, { withdrawal_pin: newPin });
        if (result.success) {
            alert("Withdrawal PIN updated successfully!");
            // Update local user object
            user.withdrawal_pin = newPin;
            localStorage.setItem('avendus_current_user', JSON.stringify(user));
            window.closeWithdrawalPinModal();
        } else {
            alert("Failed to update PIN: " + (result.error?.message || "Unknown error"));
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Update Withdrawal PIN';
        }
    }
};

window.openAvatarModal = function () {
    const modal = document.getElementById('avatarModal');
    if (modal) modal.style.display = 'flex';

    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    const previewImg = document.getElementById('avatarPreviewImg');
    const placeholderIcon = document.getElementById('avatarPlaceholderIcon');

    if (user && user.avatar_url && previewImg) {
        previewImg.src = user.avatar_url;
        previewImg.style.display = 'block';
        if (placeholderIcon) placeholderIcon.style.display = 'none';
    } else if (placeholderIcon) {
        placeholderIcon.style.display = 'block';
        if (previewImg) previewImg.style.display = 'none';
    }
};

window.closeAvatarModal = function () {
    const modal = document.getElementById('avatarModal');
    if (modal) modal.style.display = 'none';
};

window.previewAvatar = function (input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewImg = document.getElementById('avatarPreviewImg');
            const placeholderIcon = document.getElementById('avatarPlaceholderIcon');
            if (previewImg) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            }
            if (placeholderIcon) {
                placeholderIcon.style.display = 'none';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.uploadAvatar = async function () {
    const previewImg = document.getElementById('avatarPreviewImg');
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    const saveBtn = document.querySelector('.btn-primary');

    if (!user) { alert('Please login first.'); return; }

    if (previewImg && previewImg.src && previewImg.style.display !== 'none') {
        const newSrc = previewImg.src;

        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
        }

        try {
            // Try saving to DB
            const result = await window.DB.updateUser(user.id, {
                avatar_url: newSrc
            });

            // Update local state regardless for immediate feedback
            user.avatar_url = newSrc;
            localStorage.setItem('avendus_current_user', JSON.stringify(user));

            document.querySelectorAll('.user-avatar, .avatar-circle').forEach(el => {
                el.innerHTML = `<img src="${newSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            });

            if (result.success) {
                alert('Avatar updated successfully!');
            } else {
                alert('Success: Profile updated locally. (Note: Cloud sync may be pending)');
                console.warn("Avatar saved locally but failed to sync to cloud. If this persists, run the SQL command provided to add the avatar_url column.", result.error?.message);
            }

            window.closeAvatarModal();
        } catch (e) {
            console.error(e);
            alert('An error occurred while saving: ' + e.message);
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Changes';
            }
        }
    } else {
        alert('Please select an image first.');
    }
};

window.openKYCModal = async function () {
    const modal = document.getElementById('kycModal');
    if (modal) modal.style.display = 'flex';

    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (!user) return;

    const mobileInput = document.getElementById('kycMobile');
    if (mobileInput) mobileInput.value = user.mobile || '';

    // Pre-fill name from profile if available
    const nameInput = document.getElementById('kycName');
    if (nameInput && user.full_name) nameInput.value = user.full_name;

    try {
        const kyc = await window.DB.getKycByUserId(user.id);
        if (kyc) {
            const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

            if (nameInput) nameInput.value = kyc.full_name || user.full_name || '';
            document.getElementById('kycIdNum').value = kyc.id_number || user.id_number || '';
            document.getElementById('kycSubmitted').value = fmtDate(kyc.submitted_at || kyc.created_at);
            document.getElementById('kycApproved').value = kyc.status === 'Approved' ? `Approved (${fmtDate(kyc.approved_at)})` : (kyc.status || 'Not Submitted');

            if (kyc.id_front_url) {
                const img = document.getElementById('kycFrontPreview');
                img.src = kyc.id_front_url;
                img.style.display = 'block';
                img.parentElement.classList.add('has-image');
            }
            if (kyc.id_back_url) {
                const img = document.getElementById('kycBackPreview');
                img.src = kyc.id_back_url;
                img.style.display = 'block';
                img.parentElement.classList.add('has-image');
            }

            if (kyc.status === 'Pending' || kyc.status === 'Approved') {
                const btn = document.querySelector('.btn-submit');
                if (btn) {
                    btn.disabled = true;
                    btn.textContent = kyc.status === 'Approved' ? 'Already Verified' : 'Under Review';
                }
            }
        }
    } catch (e) {
        console.error("Error loading KYC:", e);
    }
};

window.closeKYCModal = function () {
    const modal = document.getElementById('kycModal');
    if (modal) modal.style.display = 'none';
};

window.previewKYCImage = function (input, previewId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.getElementById(previewId);
            if (img) {
                img.src = e.target.result;
                img.style.display = 'block';
                const parent = img.parentElement;
                const plus = parent.querySelector('.plus-icon');
                if (plus) plus.style.display = 'none';
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
};

window.submitKYC = async function () {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (!user) {
        alert('Please login to submit KYC.');
        return;
    }

    const name = document.getElementById('kycName').value.trim();
    const idNum = document.getElementById('kycIdNum').value.trim();
    const frontInput = document.getElementById('kycFrontInput');
    const backInput = document.getElementById('kycBackInput');

    // Check for existing previews if no new file is selected
    const frontPreview = document.getElementById('kycFrontPreview').src;
    const backPreview = document.getElementById('kycBackPreview').src;

    if (!name || !idNum || (!frontInput.files[0] && (!frontPreview || frontPreview.includes('placeholder'))) || (!backInput.files[0] && (!backPreview || backPreview.includes('placeholder')))) {
        alert('Please complete all fields and upload both ID images.');
        return;
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        const frontImg = frontInput.files[0] ? await toBase64(frontInput.files[0]) : frontPreview;
        const backImg = backInput.files[0] ? await toBase64(backInput.files[0]) : backPreview;

        // 1. Update User Profile (Primary data goes to 'users' table)
        const userResult = await window.DB.updateUser(user.id, {
            full_name: name,
            username: name, // For admin panel visibility
            id_number: idNum,
            kyc: 'Pending'
        });

        if (!userResult.success) {
            throw new Error(userResult.error?.message || 'Failed to update user profile info');
        }

        // Update local "Memory" (Local Storage) so data persists across refreshes
        user.full_name = name;
        user.username = name;
        user.id_number = idNum;
        user.kyc = 'Pending';
        localStorage.setItem('avendus_current_user', JSON.stringify(user));

        // 2. Insert/Update KYC Submissions (Only images and status go here)
        const kycData = {
            id_front_url: frontImg,
            id_back_url: backImg,
            status: 'Pending',
            submitted_at: new Date().toISOString()
        };

        const result = await window.DB.submitKYC(user.id, kycData);

        if (result.success) {
            alert('KYC Verification Submitted Successfully!');
            if (window.syncUserData) window.syncUserData(); // Update UI
            window.closeKYCModal();
        } else {
            // Note: If images fail but profile updated, we log and alert
            console.error("KYC files submission error:", result.error);
            alert('Partial Success: Profile info updated. (Note: ID Images failed to sync)');
            window.closeKYCModal();
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

    } catch (e) {
        console.error(e);
        alert('An error occurred: ' + e.message);
        const btn = document.querySelector('.btn-submit');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Submit Verification';
        }
    }
};

// --- Data Sync Logic ---
window.syncUserData = async function () {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (!user) return;

    const setName = document.querySelector('.settings-name');
    const greetingName = document.querySelector('.user-text h3');
    const setPhone = document.querySelector('.settings-phone');
    const setVip = document.querySelector('.s-badge.vip');
    const setCredit = document.querySelector('.s-badge.credit');

    if (setName) setName.textContent = user.full_name || 'Set Name';
    if (greetingName) greetingName.textContent = user.full_name || user.mobile;
    if (setPhone) setPhone.textContent = user.mobile;

    const avatars = document.querySelectorAll('.user-avatar, .avatar-circle');
    const renderAvatar = (url) => {
        avatars.forEach(av => {
            if (url) av.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            else av.textContent = (user.mobile || 'U').substring(0, 1).toUpperCase();
        });
    };
    if (user.avatar_url) renderAvatar(user.avatar_url);

    const client = window.DB ? window.DB.getClient() : null;
    if (client) {
        try {
            const { data: dbUser } = await client.from('users').select('*').eq('id', user.id).single();
            if (dbUser) {
                // Fetch Pending items for Effective Balance
                const [pD, pW, pT] = await Promise.all([
                    client.from('deposits').select('amount').eq('user_id', user.id).eq('status', 'Pending'),
                    client.from('withdrawals').select('amount').eq('user_id', user.id).eq('status', 'Pending'),
                    client.from('trades').select('total_amount').eq('user_id', user.id).eq('status', 'Pending')
                ]);

                const lockedDeposits = (pD.data || []).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
                const lockedWithdrawals = (pW.data || []).reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
                const lockedTrades = (pT.data || []).reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);

                let effectiveBalance = (parseFloat(dbUser.balance) || 0) + lockedDeposits - lockedWithdrawals - lockedTrades;
                if (effectiveBalance < 0) effectiveBalance = 0;

                let changed = false;
                if (dbUser.avatar_url && dbUser.avatar_url !== user.avatar_url) { user.avatar_url = dbUser.avatar_url; changed = true; }
                if (dbUser.full_name && dbUser.full_name !== user.full_name) { user.full_name = dbUser.full_name; changed = true; }

                if (changed) {
                    localStorage.setItem('avendus_current_user', JSON.stringify(user));
                    renderAvatar(user.avatar_url);
                    if (setName) setName.textContent = user.full_name;
                    if (greetingName) greetingName.textContent = user.full_name;
                }

                if (setVip) setVip.innerHTML = `<i data-lucide="shield-check" size="18"></i> VIP: ${dbUser.vip || 0}`;

                let creditScore = dbUser.credit_score;
                if (creditScore === undefined || creditScore === null || creditScore === 'undefined') creditScore = 100;
                if (setCredit) setCredit.innerHTML = `<i data-lucide="crown" size="18"></i> Credit Score: ${creditScore}`;

                const fmt = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

                // Update Balance Elements with Effective Balance
                const balanceEls = document.querySelectorAll('.stat-value.green, .portfolio-balance');
                balanceEls.forEach(el => {
                    el.textContent = fmt(effectiveBalance);
                });

                const investedEls = document.querySelectorAll('.stat-value.blue');
                if (investedEls.length > 0) investedEls[0].textContent = fmt(dbUser.invested || 0);

                if (window.lucide) lucide.createIcons();
            }
        } catch (e) { }
    }
};

// --- Message Center Logic ---
// --- Message Center Logic (Notices) ---
window.toggleMessageCenter = async function () {
    const modal = document.getElementById('messageCenter');
    const overlay = document.getElementById('messageCenterOverlay');
    const list = document.getElementById('mcList');

    if (modal && overlay) {
        const isActive = modal.classList.contains('active');
        if (isActive) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => overlay.style.display = 'none', 300);
        } else {
            overlay.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('active');
                overlay.classList.add('active');
            }, 10);

            // Hide Badges when opened
            const badges = document.querySelectorAll('.notif-badge, #msgBadge');
            badges.forEach(b => b.style.display = 'none');

            // Fetch Notices via Chat History and Filter
            if (window.DB && window.DB.getMessages) {
                const user = window.DB.getCurrentUser();
                if (user) {
                    list.innerHTML = '<div style="padding:20px;text-align:center;">Loading...</div>';
                    // We fetch ALL messages (Admin+User) to find notifications
                    // This is inefficient but necessary without DB query changes for JSON
                    // Optimally: DB.getMessages includes Admin messages.
                    const allMsgs = await window.DB.getMessages(user.id);

                    // Filter: Sender must be Admin AND have is_notification: true
                    // OR Sender is System (legacy)
                    const notices = allMsgs.filter(m => {
                        if (m.sender === 'System') return true;
                        if (m.sender === 'Admin') {
                            try {
                                const p = JSON.parse(m.message);
                                return p.is_notification === true;
                            } catch (e) { return false; }
                        }
                        return false;
                    });

                    renderNotices(notices);
                }
            }
        }
    }
};

function renderNotices(notices) {
    const list = document.getElementById('mcList');
    const count = document.getElementById('msgCount');
    if (!list) return;

    if (!notices || notices.length === 0) {
        list.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">No messages</div>';
        if (count) count.textContent = '0 Messages';
        return;
    }

    if (count) count.textContent = `${notices.length} Messages`;

    list.innerHTML = notices.map(n => {
        let title = n.title || 'System Notice';
        let body = n.message || '';
        try {
            if (body.startsWith('{')) {
                const p = JSON.parse(body);
                if (p.title) title = p.title;
                if (p.body) body = p.body;
            }
        } catch (e) { }

        return `
        <div class="notif-card" id="notif-${n.id}" onclick="toggleNotifView('${n.id}', event)">
            <div class="notif-timeline ${n.read ? '' : 'unread'}"></div>
            <div class="notif-header">
                <div class="notif-main-info">
                    <div class="notif-title">${title} <span class="notif-tag" style="font-size:10px; margin-left:5px;">${n.tag || 'NOTICE'}</span></div>
                    <div class="notif-meta">${new Date(n.created_at).toLocaleString()}</div>
                </div>
                <button class="notif-delete-btn" onclick="deleteMessage('${n.id}', this); event.stopPropagation();">Delete</button>
            </div>
            <div class="notif-body">${body}</div>
        </div>
        `;
    }).join('');
}

window.toggleNotifView = function (id, event) {
    // Toggle Card Expansion
    const card = document.getElementById(`notif-${id}`);
    if (card) {
        card.classList.toggle('expanded');

        // Mark as read if expanding
        if (card.classList.contains('expanded')) {
            const timeline = card.querySelector('.notif-timeline');
            if (timeline && timeline.classList.contains('unread')) {
                timeline.classList.remove('unread');
            }
        }
    }
};

// --- Selection Mode Logic ---
window.isSelectMode = false;

window.sysToggleSelect = function () {
    window.isSelectMode = !window.isSelectMode;
    const chks = document.querySelectorAll('.mc-select-box');
    const footer = document.getElementById('mcFooter'); // We need to check if this exists or we inject it

    // Toggle Checkboxes
    chks.forEach(c => c.style.display = window.isSelectMode ? 'block' : 'none');

    // Toggle Footer Buttons
    // Ideally we replace the footer HTML entirely to swap buttons
    const normalBtns = document.getElementById('mcNormalBtns');
    const selectBtns = document.getElementById('mcSelectBtns');

    if (normalBtns && selectBtns) {
        normalBtns.style.display = window.isSelectMode ? 'none' : 'flex';
        selectBtns.style.display = window.isSelectMode ? 'flex' : 'none';
        // Reset selection
        if (!window.isSelectMode) {
            document.querySelectorAll('.mc-chk').forEach(c => c.checked = false);
        }
    }
};

window.updateDeleteBtn = function () {
    const count = document.querySelectorAll('.mc-chk:checked').length;
    const btn = document.getElementById('btnDeleteSelected');
    if (btn) btn.textContent = `Delete Selected (${count})`;
};

window.deleteSelected = async function () {
    const selected = Array.from(document.querySelectorAll('.mc-chk:checked')).map(c => c.value);
    if (selected.length === 0) return;

    if (!confirm(`Delete ${selected.length} notifications?`)) return;

    for (const id of selected) {
        if (window.DB && window.DB.deleteMessage) {
            await window.DB.deleteMessage(id);
            const el = document.getElementById(`notif-${id}`);
            if (el) el.remove();
        }
    }

    // Refresh list logic if empty?
    if (document.querySelectorAll('.mc-item').length === 0) {
        document.getElementById('mcList').innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">No messages</div>';
    }

    // Exit select mode
    window.sysToggleSelect();
};

window.makeAllRead = function () {
    document.querySelectorAll('.mc-dot.unread').forEach(el => el.classList.remove('unread'));
    const count = document.getElementById('msgCount');
    if (count) count.textContent = '0 Messages';
    // Logic to mark read in DB could go here
};

window.deleteAllMessages = async function () {
    if (!confirm("Are you sure you want to delete ALL notifications? This cannot be undone.")) return;

    const cards = document.querySelectorAll('.notif-card');
    if (cards.length === 0) return;

    if (window.DB && window.DB.deleteMessage) {
        // Collect IDs
        const ids = Array.from(cards).map(c => c.id.replace('notif-', ''));

        // Batch delete simulation (since API is single delete)
        // Show loading state?
        const btn = document.querySelector('button[onclick="deleteAllMessages()"]');
        if (btn) btn.textContent = "Deleting...";

        for (const id of ids) {
            await window.DB.deleteMessage(id);
        }

        if (btn) btn.textContent = "Delete All";
    }

    // Clear UI
    document.getElementById('mcList').innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">No messages</div>';

    // Reset Badge
    const badge = document.getElementById('msgBadge');
    if (badge) badge.style.display = 'none';
};

window.deleteMessage = async function (id, btn) {
    if (!confirm("Delete this notification?")) return;

    if (window.DB && window.DB.deleteMessage) {
        await window.DB.deleteMessage(id);
    }

    const item = btn.closest('.notif-card');
    if (item) {
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);

        // Update Count
        const count = document.getElementById('msgCount');
        if (count && count.textContent) {
            let c = parseInt(count.textContent);
            if (!isNaN(c) && c > 0) count.textContent = `${c - 1} Messages`;
        }
    }
};


// --- Customer Service Logic ---
let isChatSubscribed = false;

window.openCS = function () {
    if (window.closeSettings) window.closeSettings();
    const modal = document.getElementById('csModal');
    if (modal) modal.style.display = 'flex';
    localStorage.setItem('avendus_cs_open', 'true');
    loadCSMessages();
};

window.closeCS = function () {
    const modal = document.getElementById('csModal');
    if (modal) modal.style.display = 'none';
    localStorage.setItem('avendus_cs_open', 'false');
};

async function loadCSMessages() {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    const targetBox = document.getElementById('chatBox');
    if (!user || !targetBox) return;

    if (window.DB && window.DB.getMessages) {
        const msgs = await window.DB.getMessages(user.id);
        renderMessages(msgs);
    }

    // Clear badges when chat is opened
    const badges = [document.getElementById('csrMsgBadge'), document.getElementById('csrHeaderBadge')];
    badges.forEach(b => {
        if (b) {
            b.style.display = 'none';
            b.textContent = '0';
        }
    });

    targetBox.scrollTop = targetBox.scrollHeight;
}

window.startChatListener = async function () {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (!user || isChatSubscribed) return;

    const client = window.DB ? window.DB.getClient() : null;
    if (!client) return;

    client.channel('public:messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `user_id=eq.${user.id}`
        }, payload => {
            const m = payload.new;
            if (m.sender === 'System') return; // Ignore System (if any exist)

            // IGNORE NOTIFICATIONS in Chat (they have is_notification: true)
            try {
                const p = JSON.parse(m.message);
                if (p.is_notification) return;
            } catch (e) { }

            const isUser = m.sender === 'User' || m.sender === 'user';

            // Always append if modal is open
            const modal = document.getElementById('csModal');
            if (modal && modal.style.display === 'flex') {
                appendSingleMessage(m);
            }

            // Notify if from Support
            if (!isUser) {
                playNotificationSound();
                const badges = [document.getElementById('csrMsgBadge'), document.getElementById('csrHeaderBadge')];
                badges.forEach(badge => {
                    if (badge && (modal && modal.style.display !== 'flex')) {
                        const count = parseInt(badge.textContent || '0') + 1;
                        badge.textContent = count;
                        badge.style.display = 'block';
                    }
                });
            }
        }).subscribe();

    isChatSubscribed = true;
};

function renderMessages(msgs) {
    const targetBox = document.getElementById('chatBox');
    if (!targetBox) return;
    targetBox.innerHTML = '';
    if (msgs && msgs.forEach) {
        msgs.forEach(m => {
            // Filter out notifications
            try {
                if (m.sender === 'Admin') {
                    const p = JSON.parse(m.message);
                    if (p.is_notification) return;
                }
            } catch (e) { }
            appendSingleMessage(m);
        });
    }
}

function appendSingleMessage(m) {
    const targetBox = document.getElementById('chatBox');
    if (!targetBox) return;

    const div = document.createElement('div');
    const isUser = m.sender === 'User' || m.sender === 'user';

    div.className = `chat-bubble ${isUser ? 'user' : 'support'}`;

    // Handle JSON messages if admin sends structured data
    let content = m.message;
    try {
        if (content.startsWith('{')) {
            const parsed = JSON.parse(content);
            content = `<strong>${parsed.title || ''}</strong><br>${parsed.body || parsed.message || ''}`;
        }
    } catch (e) { }

    div.innerHTML = `
        <div class="message-text">${content}</div>
        <div class="message-time">${new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;

    targetBox.appendChild(div);
    targetBox.scrollTop = targetBox.scrollHeight;
}

window.sendCSMessage = async () => {
    const input = document.getElementById('csInput');
    const text = input ? input.value.trim() : '';
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (!text || !user) return;

    if (input) input.value = '';

    if (window.DB && window.DB.sendMessage) {
        const { success, error } = await window.DB.sendMessage(user.id, text, 'User');
        if (!success) {
            console.error("Chat Error:", error);
            alert("Message failed to send. Please try again.");
        }
    }
};

function playNotificationSound() {
    try {
        const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
        audio.volume = 0.5;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log("Audio blocked via playNotificationSound"));
        }
    } catch (e) { }
}

window.startNotificationListener = async function () {
    const user = window.DB && window.DB.getCurrentUser ? window.DB.getCurrentUser() : null;
    if (!user) return;

    const client = window.DB ? window.DB.getClient() : null;
    if (!client) return;

    // Listen for System OR Admin-as-Notification
    client.channel('user-notices')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `user_id=eq.${user.id}`
        }, payload => {
            const m = payload.new;
            let isNotif = false;

            if (m.sender === 'System') isNotif = true;
            else if (m.sender === 'Admin') {
                try {
                    const p = JSON.parse(m.message);
                    if (p.is_notification) isNotif = true;
                } catch (e) { }
            }

            if (isNotif) {
                playNotificationSound();

                // Update Bell Badges
                const badges = document.querySelectorAll('.notif-badge, #msgBadge');
                badges.forEach(b => {
                    b.style.display = 'block';
                });

                // Trigger Ring Animation on all bell icons
                const icons = document.querySelectorAll('i[data-lucide="bell"]');
                icons.forEach(icon => {
                    icon.classList.remove('bell-ring');
                    void icon.offsetWidth; // Trigger reflow
                    icon.classList.add('bell-ring');
                    setTimeout(() => icon.classList.remove('bell-ring'), 1000);
                });
            }
        })
        .subscribe();

    // Initial Check for Unread Notifications on Load
    setTimeout(async () => {
        if (window.DB && window.DB.getMessages) {
            const allMsgs = await window.DB.getMessages(user.id);
            const notices = allMsgs.filter(m => {
                let isN = false;
                if (m.sender === 'System') isN = true;
                if (m.sender === 'Admin') {
                    try { const p = JSON.parse(m.message); if (p.is_notification) isN = true; } catch (e) { }
                }
                return isN && !m.read;
            });

            if (notices.length > 0) {
                const badges = document.querySelectorAll('.notif-badge, #msgBadge');
                badges.forEach(b => b.style.display = 'block');
            }
        }
    }, 2000);
};

// Auto-start chat listener and sync if logged in
document.addEventListener('DOMContentLoaded', () => {
    if (window.DB && window.DB.getCurrentUser()) {
        setTimeout(() => {
            if (window.startChatListener) window.startChatListener();
            if (window.startNotificationListener) window.startNotificationListener();
            // Update CSR visibility
            const btn = document.getElementById('floatingCSR');
            if (btn) btn.style.display = 'flex';
            if (window.syncUserData) window.syncUserData();
        }, 1000);
    }
});
