document.addEventListener('DOMContentLoaded', () => {
    const API_URL = window.location.origin;
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceOverlay = document.getElementById('voiceOverlay');
    const voiceText = document.getElementById('voiceText');
    const langBtn = document.getElementById('langBtn');

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
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ─── Fetch Home Data ───────────────────────────────────────────
    async function fetchHomeData() {
        try {
            const [weatherSoil, recommendation] = await Promise.all([
                fetch(`${API_URL}/api/weather-soil`).then(res => res.json()),
                fetch(`${API_URL}/api/crop-recommendation`).then(res => res.json())
            ]);

            const insights = document.querySelectorAll('.insight-card .stat');
            if (insights.length >= 4) {
                insights[1].innerHTML = `${recommendation.recommended_crop} <span class="label">Predicted</span>`;
                insights[2].innerHTML = `${weatherSoil.weather.temperature_c}°C <span class="label">${weatherSoil.weather.condition}</span>`;
                insights[3].innerHTML = `${weatherSoil.soil.moisture_pct}% <span class="label">${weatherSoil.soil.status}</span>`;
            }
        } catch (error) {
            console.error('Error fetching home data:', error);
        }
    }

    // ─── Fetch Market Data ─────────────────────────────────────────
    async function fetchMarketData() {
        try {
            const response = await fetch(`${API_URL}/api/market/nearby`);
            const markets = await response.json();
            const marketList = document.getElementById('marketList');
            
            if (marketList) {
                marketList.innerHTML = markets.map((m, i) => `
                    <div class="market-card glass">
                        <div class="market-rank rank-${i+1}">${i+1}</div>
                        <div class="details">
                            <h4>${m.name}</h4>
                            <p><i class="fas fa-route"></i> ${m.distance} away (${m.district})</p>
                            <p><i class="fas fa-clock"></i> Open Now · ${m.timings}</p>
                            <span class="badge ${m.status.includes('High') ? 'badge-green' : 'badge-blue'}">${m.status}</span>
                        </div>
                        <div class="price-tag">
                            <span class="price">₹${m.wheat_rate || m.rice_rate}</span>
                            <span class="label">per quintal</span>
                            <div class="rating">★ ${m.rating}</div>
                            <button class="contact-btn market-contact">View Rates</button>
                        </div>
                    </div>
                `).join('');

                // Add listeners to new buttons
                document.querySelectorAll('.market-contact').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const name = btn.closest('.market-card').querySelector('h4').textContent;
                        showToast(`Fetching latest rates for ${name}...`);
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching market data:', error);
        }
    }

    // ─── Fetch Profile Data ────────────────────────────────────────
    async function fetchProfileData() {
        try {
            const response = await fetch(`${API_URL}/api/profile/summary`);
            const p = await response.json();
            
            const nameEl = document.getElementById('profileName');
            const typeEl = document.getElementById('profileType');
            const salesEl = document.getElementById('totalSales');
            const offersEl = document.getElementById('activeOffers');

            if (nameEl) nameEl.textContent = p.name;
            if (typeEl) typeEl.textContent = p.type;
            const locEl = document.querySelector('.profile-location');
            if (locEl) locEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${p.location}`;
            if (salesEl) salesEl.textContent = p.total_sales;
            if (offersEl) offersEl.textContent = p.active_offers;
            
            const details = document.querySelectorAll('.detail-item strong');
            if (details.length >= 4) {
                details[0].textContent = p.farm_size;
                details[1].textContent = `${p.soil_type}, ${p.soil_moisture} Moisture`;
                details[2].textContent = p.primary_crops.join(', ');
                details[3].textContent = p.agmarknet_seller_id;
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    // ─── Tab Switching Logic ──────────────────────────────────────
    function switchTab(tabId) {
        navItems.forEach(i => i.classList.toggle('active', i.getAttribute('data-tab') === tabId));
        tabContents.forEach(t => t.classList.toggle('active', t.id === tabId + 'Tab'));
        
        // Ensure data is always populated when switching
        if (tabId === 'home') fetchHomeData();
        else if (tabId === 'market') fetchMarketData();
        else if (tabId === 'profile') fetchProfileData();

        // Scroll to top
        const content = document.querySelector('.content');
        if (content) content.scrollTop = 0;
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(item.getAttribute('data-tab'));
        });
    });

    // ─── Other Buttons ───────────────────────────────────────────
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            showToast("Language switching enabled (Hindi/English)");
        });
    }

    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            voiceOverlay.classList.remove('hidden');
            voiceText.textContent = '"Listening..."';
            setTimeout(() => voiceOverlay.classList.add('hidden'), 2000);
            showToast("Voice navigation activated");
        });
    }

    // Book buttons in Logistics
    document.querySelectorAll('.contact-btn.small').forEach(btn => {
        btn.addEventListener('click', () => {
            const driver = btn.closest('.driver-item').querySelector('h4').textContent;
            showToast(`Booking request sent to ${driver}!`);
        });
    });

    // Profile menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.querySelector('span').textContent;
            showToast(`Opening ${text}...`);
        });
    });

    // Initial Load
    switchTab('home');
});
