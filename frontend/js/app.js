// ─── PWA Install Prompt ───────────────────────────────────────────
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'inline-flex';
        installBtn.addEventListener('click', async () => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('PWA install outcome:', outcome);
            deferredPrompt = null;
        });
    }
});

window.addEventListener('appinstalled', () => {
    console.log('AgroDirect installed as PWA!');
    const installBtn = document.getElementById('installBtn');
    if (installBtn) installBtn.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {

    // ─── Elements ────────────────────────────────────────────────
    const navItems    = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const voiceBtn    = document.getElementById('voiceBtn');
    const voiceOverlay= document.getElementById('voiceOverlay');
    const voiceText   = document.getElementById('voiceText');
    const langBtn     = document.getElementById('langBtn');
    const seeAllBtn   = document.getElementById('seeAllBtn');

    const API_URL = 'http://localhost:8000';

    // ─── Tab Switching ────────────────────────────────────────────
    function switchTab(tabId) {
        navItems.forEach(i => i.classList.toggle('active', i.getAttribute('data-tab') === tabId));
        tabContents.forEach(t => t.classList.toggle('active', t.id === tabId + 'Tab'));
        // Scroll to top on tab switch
        document.querySelector('.content').scrollTop = 0;
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(item.getAttribute('data-tab'));
        });
    });

    seeAllBtn && seeAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('market');
    });

    // ─── Market Search Filter ─────────────────────────────────────
    const marketSearch = document.getElementById('marketSearch');
    marketSearch && marketSearch.addEventListener('input', () => {
        const q = marketSearch.value.toLowerCase();
        document.querySelectorAll('#marketList .market-card').forEach(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            card.style.display = name.includes(q) ? '' : 'none';
        });
    });

    // ─── Market card buttons ──────────────────────────────────────
    document.querySelectorAll('#marketList .contact-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.market-card');
            const name = card.querySelector('h4').textContent;
            const price = card.querySelector('.price').textContent;
            showToast(`${name}: ${price} / quintal`);
        });
    });

    // ─── Driver Book buttons ──────────────────────────────────────
    document.querySelectorAll('#driverList .contact-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const driverName = btn.closest('.driver-item').querySelector('h4').textContent;
            showToast(`Booking request sent to ${driverName}!`);
        });
    });

    // ─── Profile menu items ───────────────────────────────────────
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            showToast(`Opening ${item.querySelector('span').textContent}...`);
        });
    });

    // ─── Toast Notification ───────────────────────────────────────
    function showToast(msg) {
        let toast = document.getElementById('toastMsg');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastMsg';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ─── Language Switcher ────────────────────────────────────────
    let currentLang = 'en';
    const translations = {
        en: { heroTitle: 'Empowering Rural Farmers', heroSub: 'AI-driven insights for smarter trade.', demandTitle: 'Nearby Demand' },
        hi: { heroTitle: 'ग्रामीण किसानों को सशक्त बनाना', heroSub: 'बेहतर व्यापार के लिए एआई अंतर्दृष्टि।', demandTitle: 'नज़दीकी मांग' }
    };

    langBtn && langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'hi' : 'en';
        const t = translations[currentLang];
        document.getElementById('heroTitle').textContent = t.heroTitle;
        document.getElementById('heroSub').textContent   = t.heroSub;
        document.getElementById('demandTitle').textContent = t.demandTitle;
        langBtn.classList.toggle('active-btn', currentLang === 'hi');
        showToast(currentLang === 'hi' ? 'हिंदी में बदला गया' : 'Switched to English');
    });

    // ─── Voice Navigation ─────────────────────────────────────────
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        voiceBtn.addEventListener('click', () => {
            voiceOverlay.classList.remove('hidden');
            voiceText.textContent = '"Listening..."';
            recognition.start();
        });

        recognition.onresult = (event) => {
            const cmd = event.results[0][0].transcript.toLowerCase();
            voiceText.textContent = `"${cmd}"`;
            setTimeout(() => voiceOverlay.classList.add('hidden'), 1500);

            if (cmd.includes('market') || cmd.includes('buy') || cmd.includes('mandi')) switchTab('market');
            else if (cmd.includes('logistic') || cmd.includes('truck') || cmd.includes('delivery')) switchTab('logistics');
            else if (cmd.includes('profile') || cmd.includes('account') || cmd.includes('farmer')) switchTab('profile');
            else if (cmd.includes('home')) switchTab('home');
            else showToast(`Command: "${cmd}" — Try "market", "logistics", or "profile"`);
        };

        recognition.onerror = () => { voiceOverlay.classList.add('hidden'); };
        recognition.onend   = () => { setTimeout(() => voiceOverlay.classList.add('hidden'), 1200); };
    } else {
        voiceBtn.style.display = 'none';
    }

    // ─── Progress bar animation on load ──────────────────────────
    setTimeout(() => {
        document.querySelectorAll('.progress').forEach(bar => {
            const target = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = target; }, 100);
        });
    }, 300);

    // ─── Init ─────────────────────────────────────────────────────
    switchTab('home');

});
