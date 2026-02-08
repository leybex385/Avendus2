
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
            document.getElementById('kycApproved').value = kyc.status === 'Approved' ? fmtDate(kyc.approved_at) : (kyc.status || 'Pending');

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
