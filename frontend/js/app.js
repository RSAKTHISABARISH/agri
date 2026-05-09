document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:8000';
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    // ─── Fetch Home Data ───────────────────────────────────────────
    async function fetchHomeData() {
        try {
            const [weatherSoil, recommendation] = await Promise.all([
                fetch(`${API_URL}/api/weather-soil`).then(res => res.json()),
                fetch(`${API_URL}/api/crop-recommendation`).then(res => res.json())
            ]);

            // Update Insights
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
                            <button class="contact-btn">View Rates</button>
                        </div>
                    </div>
                `).join('');
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
            
            document.getElementById('profileName').textContent = p.name;
            document.getElementById('profileType').textContent = p.type;
            document.querySelector('.profile-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${p.location}`;
            document.getElementById('totalSales').textContent = p.total_sales;
            document.getElementById('activeOffers').textContent = p.active_offers;
            
            // Update Farm Details
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
        
        if (tabId === 'home') fetchHomeData();
        if (tabId === 'market') fetchMarketData();
        if (tabId === 'profile') fetchProfileData();
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(item.getAttribute('data-tab'));
        });
    });

    // Initial Load
    fetchHomeData();
});
