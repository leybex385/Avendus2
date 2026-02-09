
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

window.toggleMessageCenter = function () {
    const modal = document.getElementById('messageCenter');
    const overlay = document.getElementById('messageCenterOverlay');
    if (modal && overlay) {
        modal.classList.toggle('active');
        overlay.classList.toggle('active');
    }
};

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
                const balanceEls = document.querySelectorAll('.stat-value.green');
                if (balanceEls.length > 0) balanceEls[0].textContent = fmt((dbUser.balance || 0) + (dbUser.invested || 0));
                const investedEls = document.querySelectorAll('.stat-value.blue');
                if (investedEls.length > 0) investedEls[0].textContent = fmt(dbUser.invested || 0);

                if (window.lucide) lucide.createIcons();
            }
        } catch (e) { }
    }
};

// --- Message Center Logic ---
window.toggleMessageCenter = function () {
    const modal = document.getElementById('messageCenter');
    const overlay = document.getElementById('messageCenterOverlay');
    if (modal && overlay) {
        const isActive = modal.classList.contains('active');
        if (isActive) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
            overlay.style.display = 'none';
        } else {
            overlay.style.display = 'block';
            // slight delay to allow display block to take effect for transition
            setTimeout(() => {
                modal.classList.add('active');
                overlay.classList.add('active');
            }, 10);
        }
    } else if (modal) {
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    }
};

window.makeAllRead = function () {
    document.querySelectorAll('.mc-dot.unread').forEach(el => el.classList.remove('unread'));
    const count = document.getElementById('msgCount');
    if (count) count.textContent = '0 Messages';
};

window.deleteAllMessages = function () {
    const list = document.getElementById('mcList');
    if (list) list.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">No messages</div>';
    const count = document.getElementById('msgCount');
    if (count) count.textContent = '0 Messages';
};

window.deleteMessage = function (btn) {
    const item = btn.closest('.mc-item');
    if (item) item.remove();
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
        msgs.forEach(m => appendSingleMessage(m));
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

// Auto-start chat listener and sync if logged in
document.addEventListener('DOMContentLoaded', () => {
    if (window.DB && window.DB.getCurrentUser()) {
        setTimeout(() => {
            if (window.startChatListener) window.startChatListener();
            // Update CSR visibility
            const btn = document.getElementById('floatingCSR');
            if (btn) btn.style.display = 'flex';
            if (window.syncUserData) window.syncUserData();
        }, 1000);
    }
});
