/* ==========================================================================
   StayWise AI | Core JavaScript Application Engine
   Dual-Theme Engine, Predictive Analytics, Decision Tree ML Visualizer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Application State ---
    let globalOverview = null;
    let chartInstances = {};
    let activeNightlyRate = 145;
    let activeCurrencySymbol = '$';
    let currentPredictionData = null;

    // Futuristic AI Platform State
    let audioFeedbackEnabled = localStorage.getItem('staywise_audio') !== 'false';
    let autoPilotActive = localStorage.getItem('staywise_autopilot') !== 'false';
    let activeSurgeMultiplier = 1.45;
    let lastUpgradeRecommendations = [];

    let datasetState = {
        page: 1,
        pageSize: 15,
        search: '',
        city: 'all',
        sortBy: 'price',
        sortOrder: 'desc',
        totalRecords: 0,
        totalPages: 1
    };

    const steppers = {
        bedrooms: 2,
        bathrooms: 2,
        guests: 4
    };

    // ==========================================================================
    // 1. THEME SWITCHER ENGINE (LIGHT & DARK THEMES)
    // ==========================================================================
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    const themeLabelText = document.getElementById('themeLabelText');

    function initTheme() {
        const savedTheme = localStorage.getItem('staywise_theme');
        let theme = 'dark'; // Default sleek dark theme
        if (savedTheme) {
            theme = savedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            theme = 'light';
        }
        applyTheme(theme);
    }

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');

        if (themeLabelText) {
            themeLabelText.textContent = isDark ? 'Dark Mode' : 'Light Mode';
        }

        localStorage.setItem('staywise_theme', theme);

        // Update ApexCharts themes dynamically
        updateChartsTheme(isDark);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', toggleTheme);
    }

    initTheme();

    function updateChartsTheme(isDark) {
        const themeMode = isDark ? 'dark' : 'light';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
        const textColor = isDark ? '#94a3b8' : '#5a5b5e';

        Object.values(chartInstances).forEach(chart => {
            if (chart && typeof chart.updateOptions === 'function') {
                try {
                    chart.updateOptions({
                        theme: { mode: themeMode },
                        grid: { borderColor: gridColor },
                        xaxis: { labels: { style: { colors: textColor } } },
                        yaxis: { labels: { style: { colors: textColor } } }
                    }, false, false);
                } catch (e) {
                    console.warn("Chart theme update error:", e);
                }
            }
        });
    }

    // ==========================================================================
    // 2. CURRENCY SWITCHER ENGINE
    // ==========================================================================
    const CURRENCY_CONFIG = {
        'AUTO': { symbol: '$', rate: 1.0, name: 'Auto (Destination)', decimals: 2 },
        'USD':  { symbol: '$', rate: 1.0, name: 'USD ($)', decimals: 2 },
        'EUR':  { symbol: '€', rate: 0.92, name: 'EUR (€)', decimals: 2 },
        'GBP':  { symbol: '£', rate: 0.79, name: 'GBP (£)', decimals: 2 },
        'INR':  { symbol: '₹', rate: 83.5, name: 'INR (₹)', decimals: 0 },
        'AUD':  { symbol: 'A$', rate: 1.52, name: 'AUD (A$)', decimals: 2 },
        'CAD':  { symbol: 'C$', rate: 1.36, name: 'CAD (C$)', decimals: 2 },
        'JPY':  { symbol: '¥', rate: 155.0, name: 'JPY (¥)', decimals: 0 },
        'AED':  { symbol: 'AED ', rate: 3.67, name: 'AED', decimals: 2 },
        'SGD':  { symbol: 'S$', rate: 1.35, name: 'SGD (S$)', decimals: 2 },
        'THB':  { symbol: '฿', rate: 36.5, name: 'THB (฿)', decimals: 0 },
        'ZAR':  { symbol: 'R ', rate: 18.4, name: 'ZAR (R)', decimals: 2 },
        'BTC':  { symbol: '₿', rate: 0.0000155, name: 'BTC (₿)', decimals: 6 },
        'ETH':  { symbol: 'Ξ', rate: 0.000295,  name: 'ETH (Ξ)', decimals: 4 },
        'SOL':  { symbol: '◎', rate: 0.00685,   name: 'SOL (◎)', decimals: 3 }
    };

    let selectedCurrencyCode = localStorage.getItem('staywise_currency') || 'USD';
    let rawPredictionBase = null;
    let lastInputPayload = null;
    let lastDatasetData = null;

    function getConvertedPrice(amountUSD) {
        if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) return 0;
        const cfg = CURRENCY_CONFIG[selectedCurrencyCode] || CURRENCY_CONFIG['USD'];
        const rate = (selectedCurrencyCode === 'AUTO') ? 1.0 : cfg.rate;
        const converted = amountUSD * rate;
        const dec = cfg.decimals !== undefined ? cfg.decimals : 2;
        return (dec === 0) ? Math.round(converted) : Math.round(converted * 100) / 100;
    }

    function formatMoney(amountUSD, overrideSymbol = null) {
        if (amountUSD === null || amountUSD === undefined || isNaN(amountUSD)) return '--';
        const cfg = CURRENCY_CONFIG[selectedCurrencyCode] || CURRENCY_CONFIG['USD'];
        const symbol = overrideSymbol !== null ? overrideSymbol : (selectedCurrencyCode === 'AUTO' ? (activeCurrencySymbol || '$') : cfg.symbol);
        const rate = (selectedCurrencyCode === 'AUTO') ? 1.0 : cfg.rate;
        const converted = amountUSD * rate;
        const dec = cfg.decimals !== undefined ? cfg.decimals : 2;
        const formatted = (dec === 0) 
            ? Math.round(converted).toLocaleString() 
            : converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${symbol}${formatted}`;
    }

    function setCurrency(code) {
        if (!CURRENCY_CONFIG[code]) return;
        selectedCurrencyCode = code;
        localStorage.setItem('staywise_currency', code);
        applyCurrentCurrencyView();
    }

    function initCurrency() {
        const saved = localStorage.getItem('staywise_currency');
        if (saved && CURRENCY_CONFIG[saved]) {
            selectedCurrencyCode = saved;
        }
        const currencySelector = document.getElementById('currencySelector');
        if (currencySelector) {
            currencySelector.value = selectedCurrencyCode;
            currencySelector.addEventListener('change', (e) => {
                setCurrency(e.target.value);
            });
        }

        const resultsCurrencyIndicator = document.getElementById('resultsCurrencyIndicator');
        if (resultsCurrencyIndicator) {
            resultsCurrencyIndicator.addEventListener('click', () => {
                const currencyKeys = Object.keys(CURRENCY_CONFIG);
                const currIdx = currencyKeys.indexOf(selectedCurrencyCode);
                const nextCode = currencyKeys[(currIdx + 1) % currencyKeys.length];
                setCurrency(nextCode);
            });
        }

        applyCurrentCurrencyView();
    }

    initCurrency();

    // ==========================================================================
    // 3. TAB NAVIGATION & MOBILE MENU
    // ==========================================================================
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const btnMobileMenu = document.getElementById('btnMobileMenu');
    const navTabsContainer = document.getElementById('navTabsContainer');

    function switchTab(targetTabId) {
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === targetTabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Sync Stitch Mobile Bottom Dock active item
        const bottomDockItems = document.querySelectorAll('.stitch-bottom-dock .dock-item');
        bottomDockItems.forEach(item => {
            if (item.getAttribute('data-tab') === targetTabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        tabPanes.forEach(pane => {
            if (pane.id === targetTabId) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        if (navTabsContainer && navTabsContainer.classList.contains('mobile-open')) {
            navTabsContainer.classList.remove('mobile-open');
        }

        // Trigger reveal for cards in newly activated tab
        const activePane = document.getElementById(targetTabId);
        if (activePane) {
            setTimeout(() => {
                activePane.querySelectorAll('.scroll-reveal').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight + 60) {
                        el.classList.add('revealed');
                    }
                });
            }, 60);
        }

        // Trigger robust chart refit across all visible cards
        refitAllCharts();
        setTimeout(refitAllCharts, 80);
        setTimeout(refitAllCharts, 240);
    }

    function refitAllCharts() {
        requestAnimationFrame(() => {
            Object.values(chartInstances).forEach(chart => {
                if (chart && typeof chart.windowResize === 'function') {
                    try {
                        chart.windowResize();
                    } catch (e) {
                        try { chart.render(); } catch (err) {}
                    }
                }
            });
            window.dispatchEvent(new Event('resize'));
        });
    }

    // Debounced global resize & orientation change refit
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refitAllCharts, 100);
    });
    window.addEventListener('orientationchange', () => {
        setTimeout(refitAllCharts, 180);
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-tab');
            switchTab(target);
        });
    });

    if (btnMobileMenu && navTabsContainer) {
        btnMobileMenu.addEventListener('click', () => {
            navTabsContainer.classList.toggle('mobile-open');
        });
    }

    window.goToPredictorTab = () => {
        switchTab('tab-predict');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ==========================================================================
    // 3. STEPPERS & FORM CONTROLS
    // ==========================================================================
    window.adjustStepper = (field, delta) => {
        const minVal = 1;
        const maxVal = field === 'guests' ? 24 : 16;
        let nextVal = steppers[field] + delta;
        if (nextVal >= minVal && nextVal <= maxVal) {
            steppers[field] = nextVal;
            const displayEl = document.getElementById(field + 'Value');
            if (displayEl) displayEl.textContent = nextVal;

            if (field === 'bedrooms') {
                const hiddenInput = document.getElementById('predBedrooms');
                if (hiddenInput) hiddenInput.value = nextVal;
            } else if (field === 'bathrooms') {
                const hiddenInput = document.getElementById('predBathrooms');
                if (hiddenInput) hiddenInput.value = nextVal;
            } else if (field === 'guests') {
                const hiddenInput = document.getElementById('predAccommodates');
                if (hiddenInput) hiddenInput.value = nextVal;
            }
        }
    };

    // Property Type Pills
    const propertyPills = document.querySelectorAll('.type-pill');
    propertyPills.forEach(pill => {
        pill.addEventListener('click', () => {
            propertyPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const propType = pill.getAttribute('data-type');
            const hiddenInput = document.getElementById('predPropertyType');
            if (hiddenInput) hiddenInput.value = propType;

            // Update photo preview based on property type
            updateListingThumb(propType);
        });
    });

    function updateListingThumb(propType) {
        const thumb = document.getElementById('resultsThumbnail');
        if (!thumb) return;
        if (propType.toLowerCase().includes('villa')) {
            thumb.src = '/static/images/villa.png';
        } else {
            thumb.src = '/static/images/apartment.png';
        }
    }

    // Room Arrangement Segmented Selector
    const roomButtons = document.querySelectorAll('#roomArrangementGroup .segment-btn');
    roomButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            roomButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const roomType = btn.getAttribute('data-room');
            const hiddenInput = document.getElementById('predRoomType');
            if (hiddenInput) hiddenInput.value = roomType;
        });
    });

    // Seasonal Segmented Control
    const seasonButtons = document.querySelectorAll('#seasonGroup .segment-btn');
    seasonButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            seasonButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Switch Toggle
    window.toggleSwitch = (btn) => {
        const isChecked = btn.getAttribute('aria-checked') === 'true';
        if (isChecked) {
            btn.setAttribute('aria-checked', 'false');
            btn.classList.remove('active');
        } else {
            btn.setAttribute('aria-checked', 'true');
            btn.classList.add('active');
        }
    };

    // Amenities Chip Toggle
    window.toggleAmenity = (btn) => {
        btn.classList.toggle('active');
        const checkIcon = btn.querySelector('.check-icon');
        if (btn.classList.contains('active')) {
            if (checkIcon) checkIcon.textContent = 'check_circle';
        } else {
            if (checkIcon) checkIcon.textContent = 'add';
        }

        const count = document.querySelectorAll('.amenity-chip.active').length;
        const countEl = document.getElementById('amenityCount');
        if (countEl) countEl.textContent = count + ' Selected';
    };

    // Locality Input Map Pin Sync
    const neighborhoodInput = document.getElementById('predNeighborhood');
    const citySelect = document.getElementById('predCity');
    const pinBadgeText = document.getElementById('pinBadgeText');

    function updateLocationPin() {
        const loc = neighborhoodInput ? (neighborhoodInput.value.trim() || 'Custom Locality') : 'Bandra West';
        let cityName = 'Mumbai';
        if (citySelect && citySelect.options[citySelect.selectedIndex]) {
            cityName = citySelect.options[citySelect.selectedIndex].text.split(',')[0].split('(')[0].trim();
        }
        if (pinBadgeText) {
            pinBadgeText.textContent = `Pin located: ${loc}, ${cityName}`;
        }
    }

    if (neighborhoodInput) neighborhoodInput.addEventListener('input', updateLocationPin);
    if (citySelect) citySelect.addEventListener('change', updateLocationPin);

    // ==========================================================================
    // 4. ANIMATED COUNT-UP NUMBER UTILITY
    // ==========================================================================
    function animateCountUp(elementId, finalVal, prefix = '', suffix = '', duration = 750) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const numVal = parseFloat(finalVal);
        if (isNaN(numVal)) {
            el.textContent = `${prefix}${finalVal}${suffix}`;
            return;
        }

        let startTimestamp = null;
        const startVal = 0;

        function step(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentVal = Math.floor(progress * (numVal - startVal) + startVal);

            let formatted = currentVal.toLocaleString();
            if (numVal % 1 !== 0) formatted = (progress * numVal).toFixed(2);

            el.textContent = `${prefix}${formatted}${suffix}`;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                let finalFormatted = numVal.toLocaleString();
                if (numVal % 1 !== 0) finalFormatted = numVal.toFixed(2);
                el.textContent = `${prefix}${finalFormatted}${suffix}`;
            }
        }

        window.requestAnimationFrame(step);
    }

    // ==========================================================================
    // 5. INITIAL DASHBOARD DATA FETCH
    // ==========================================================================
    initDashboard();

    async function initDashboard() {
        try {
            initAutoPilot();
            initAudioControl();
            initQuantumSurgeSimulator();
            initUpgradeMatrixUI();

            await fetchOverview();
            await fetchAnalytics();
            await fetchModelInfo();
            await fetchTreeStructure(3);
            await fetchDatasetRecords();

            // Run initial demo prediction so the Results tab is immediately rich & populated!
            runPredictSubmission(false);
        } catch (err) {
            console.error("Dashboard initialization error:", err);
        }
    }

    // --- OVERVIEW ---
    async function fetchOverview() {
        try {
            const res = await fetch('/api/overview');
            const data = await res.json();
            globalOverview = data;

            animateCountUp('kpiTotalListings', data.total_listings);
            animateCountUp('kpiAvgPrice', getConvertedPrice(data.avg_price), activeCurrencySymbol);
            animateCountUp('kpiMedianPrice', getConvertedPrice(data.median_price), activeCurrencySymbol);
            animateCountUp('kpiCitiesCount', data.total_cities);
            animateCountUp('kpiSuperhostPct', data.superhost_pct, '', '%');

            const superSub = document.getElementById('kpiSuperhostSub');
            if (superSub) superSub.textContent = `${data.superhost_count.toLocaleString()} Superhosts`;

            const listingChip = document.getElementById('headerListingCount');
            if (listingChip) listingChip.textContent = `${data.total_listings.toLocaleString()} Listings`;

            // Populate City Selects
            populateSelect('filterCity', data.cities, 'All Cities (Global)');
            populateSelect('paramTargetCity', data.cities, 'All Cities Combined');
            populateSelect('datasetCityFilter', data.cities, 'All Cities');
            populateSelect('filterRoomType', data.room_types, 'All Room Types');

            // Predictor Selects
            populateSelect('predCity', data.cities, null, 'New York');
            populateSelect('predResponseTime', data.response_times, null, 'within an hour');

            updateLocationPin();
        } catch (err) {
            console.error("Fetch overview error:", err);
        }
    }

    function populateSelect(selectId, items, defaultOptionLabel = null, selectedValue = null) {
        const select = document.getElementById(selectId);
        if (!select || !items) return;

        select.innerHTML = '';
        if (defaultOptionLabel) {
            const opt = document.createElement('option');
            opt.value = 'all';
            opt.textContent = defaultOptionLabel;
            select.appendChild(opt);
        }

        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            if (selectedValue && item === selectedValue) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
    }

    // ==========================================================================
    // 6. LIVE PREDICTOR SUBMISSION & VALIDATION
    // ==========================================================================
    const formPricePredictor = document.getElementById('formPricePredictor');
    const predErrorAlert = document.getElementById('predErrorAlert');

    if (formPricePredictor) {
        formPricePredictor.addEventListener('submit', (e) => {
            e.preventDefault();
            runPredictSubmission(true);
        });
    }

    async function runPredictSubmission(switchTabOnSuccess = true) {
        const btn = document.getElementById('predictBtn');
        const btnText = document.getElementById('btnText');
        const btnIcon = document.getElementById('btnIcon');
        const btnSpinner = document.getElementById('btnSpinner');

        if (btn && btnText) {
            btn.disabled = true;
            btnText.textContent = 'Analyzing Market Curves...';
            if (btnIcon) btnIcon.classList.add('hidden');
            if (btnSpinner) btnSpinner.classList.remove('hidden');
        }

        if (predErrorAlert) predErrorAlert.style.display = 'none';

        const payload = {
            city: document.getElementById('predCity')?.value || 'New York',
            room_type: document.getElementById('predRoomType')?.value || 'Entire place',
            property_type: document.getElementById('predPropertyType')?.value || 'Entire apartment',
            neighbourhood: document.getElementById('predNeighborhood')?.value || 'Bandra West',
            accommodates: parseInt(document.getElementById('predAccommodates')?.value) || steppers.guests,
            bedrooms: parseInt(document.getElementById('predBedrooms')?.value) || steppers.bedrooms,
            minimum_nights: parseInt(document.getElementById('predMinNights')?.value) || 2,
            maximum_nights: parseInt(document.getElementById('predMaxNights')?.value) || 365,
            host_response_time: document.getElementById('predResponseTime')?.value || 'within an hour',
            host_is_superhost: parseInt(document.getElementById('predSuperhost')?.value) || 0,
            review_scores_rating: parseInt(document.getElementById('predRating')?.value) || 95,
            review_scores_cleanliness: parseInt(document.getElementById('predCleanliness')?.value) || 9,
            review_scores_location: parseInt(document.getElementById('predLocation')?.value) || 10,
            instant_bookable: parseInt(document.getElementById('predInstant')?.value) || 1
        };

        const t0 = performance.now();
        try {
            const res = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const latencyMs = Math.round(performance.now() - t0);
            const hudLat = document.getElementById('hudLatency');
            if (hudLat) hudLat.textContent = `${latencyMs}ms`;

            const data = await res.json();

            if (!res.ok) {
                if (predErrorAlert) {
                    predErrorAlert.style.display = 'flex';
                    predErrorAlert.innerHTML = `<span class="material-symbols-outlined">warning</span> <span>${data.error || 'Prediction failed'}</span>`;
                }
                return;
            }

            currentPredictionData = data;
            renderPredictionResults(data, payload);
            playFuturisticTone('success');
            fetchUpgradeMatrix(payload);

            // Highlight results indicator
            const resBadge = document.getElementById('resultsAvailableBadge');
            if (resBadge) resBadge.style.display = 'block';

            if (switchTabOnSuccess) {
                switchTab('tab-results');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Prediction execution error:", err);
            if (predErrorAlert) {
                predErrorAlert.style.display = 'flex';
                predErrorAlert.innerHTML = `<span class="material-symbols-outlined">error</span> <span>Error connecting to prediction server</span>`;
            }
        } finally {
            if (btn && btnText) {
                btn.disabled = false;
                btnText.textContent = 'Predict Nightly Price';
                if (btnIcon) btnIcon.classList.remove('hidden');
                if (btnSpinner) btnSpinner.classList.add('hidden');
            }
        }
    }

    // ==========================================================================
    // 7. PREDICTION RESULTS DASHBOARD RENDERING
    // ==========================================================================
    function renderPredictionResults(res, inputPayload) {
        rawPredictionBase = JSON.parse(JSON.stringify(res));
        lastInputPayload = inputPayload;

        // Top Property Context
        const titleEl = document.getElementById('resultsPropertyTitle');
        const locEl = document.getElementById('resultsLocationText');
        const propType = inputPayload.property_type || 'Apartment';
        const locality = inputPayload.neighbourhood || 'Prime Area';

        if (titleEl) titleEl.textContent = `Luxury ${inputPayload.bedrooms}BHK ${propType.replace('Entire ', '')}`;
        if (locEl) locEl.textContent = `${locality}, ${res.city}`;

        updateListingThumb(propType);

        // Benchmark Delta Pct
        const pct = res.price_difference_pct;
        const deltaBadge = document.getElementById('benchmarkDeltaPct');
        if (deltaBadge) {
            deltaBadge.textContent = `${pct >= 0 ? '+' : ''}${pct}% vs avg`;
        }

        // Market Benchmark Pin positioning
        const minP = res.city_min_price || Math.round(res.predicted_price * 0.4);
        const topP = res.city_top_tier_price || Math.round(res.predicted_price * 2.2);
        const ratio = Math.max(0.1, Math.min(0.9, (res.predicted_price - minP) / (topP - minP || 1)));
        const gaugePin = document.getElementById('gaugePinMarker');
        if (gaugePin) gaugePin.style.left = `${Math.round(ratio * 100)}%`;

        // Diagnostic Insights Content
        updateInsightsPanel(res, inputPayload);

        // Apply currency rendering across all elements
        applyCurrentCurrencyView();

        // Default to AI Recommended Strategy
        selectStrategy('rec');
    }

    function applyCurrentCurrencyView() {
        const cfg = CURRENCY_CONFIG[selectedCurrencyCode] || CURRENCY_CONFIG['USD'];

        if (selectedCurrencyCode === 'AUTO') {
            activeCurrencySymbol = (rawPredictionBase && rawPredictionBase.currency) ? rawPredictionBase.currency.split(' ')[0] : '$';
        } else {
            activeCurrencySymbol = cfg.symbol;
        }

        // 1. Update Selector and Indicator Badge UI
        const selector = document.getElementById('currencySelector');
        if (selector) selector.value = selectedCurrencyCode;

        const indText = document.getElementById('resultsCurrencyCodeText');
        if (indText) {
            indText.textContent = `${selectedCurrencyCode === 'AUTO' ? 'Auto' : selectedCurrencyCode} (${activeCurrencySymbol.trim()})`;
        }

        const currEl = document.getElementById('outCurrency');
        if (currEl) currEl.textContent = activeCurrencySymbol;

        // 2. Update Prediction Results if present
        if (rawPredictionBase) {
            const convertedPrice = getConvertedPrice(rawPredictionBase.predicted_price);
            activeNightlyRate = convertedPrice;

            animateCountUp('outPredictedPrice', convertedPrice);

            // Floating Quick Dock
            const dockPriceVal = document.getElementById('dockPriceVal');
            if (dockPriceVal) {
                dockPriceVal.textContent = formatMoney(rawPredictionBase.predicted_price);
            }

            // Confidence interval badge
            const confText = document.getElementById('confidenceRangeText');
            if (confText && rawPredictionBase.confidence_interval) {
                confText.textContent = `${formatMoney(rawPredictionBase.confidence_interval[0])} – ${formatMoney(rawPredictionBase.confidence_interval[1])} (±8% confidence interval)`;
            }

            // Comparison note
            const compText = document.getElementById('outComparisonText');
            const pct = rawPredictionBase.price_difference_pct;
            if (compText) {
                const avgFormatted = formatMoney(rawPredictionBase.city_avg_price);
                if (pct >= 0) {
                    compText.innerHTML = `<span class="text-coral font-bold">+${pct}% higher</span> than average ${rawPredictionBase.city} listing (${avgFormatted})`;
                } else {
                    compText.innerHTML = `<span class="text-sage font-bold">${Math.abs(pct)}% lower</span> than average ${rawPredictionBase.city} listing (${avgFormatted})`;
                }
            }

            // Strategy Cards
            const stratBudgetEl = document.getElementById('stratBudgetPrice');
            const stratRecEl = document.getElementById('stratRecPrice');
            const stratPremEl = document.getElementById('stratPremPrice');

            const budgetRate = rawPredictionBase.strategies?.budget?.rate || Math.round(rawPredictionBase.predicted_price * 0.88);
            const recRate = rawPredictionBase.strategies?.recommended?.rate || rawPredictionBase.predicted_price;
            const premRate = rawPredictionBase.strategies?.premium?.rate || Math.round(rawPredictionBase.predicted_price * 1.20);

            if (stratBudgetEl) stratBudgetEl.textContent = `${formatMoney(budgetRate)}`;
            if (stratRecEl) stratRecEl.textContent = `${formatMoney(recRate)}`;
            if (stratPremEl) stratPremEl.textContent = `${formatMoney(premRate)}`;

            // Market Benchmark Gauge
            const gaugeMin = document.getElementById('gaugeMinLabel');
            const gaugeAvg = document.getElementById('gaugeAvgLabel');
            const gaugeTop = document.getElementById('gaugeTopLabel');
            const gaugeNote = document.getElementById('gaugeCurrentListingNote');

            const minP = rawPredictionBase.city_min_price || Math.round(rawPredictionBase.predicted_price * 0.4);
            const avgP = rawPredictionBase.city_avg_price || rawPredictionBase.predicted_price;
            const topP = rawPredictionBase.city_top_tier_price || Math.round(rawPredictionBase.predicted_price * 2.2);

            if (gaugeMin) gaugeMin.textContent = `Min: ${formatMoney(minP)}`;
            if (gaugeAvg) gaugeAvg.textContent = `${rawPredictionBase.city} Avg: ${formatMoney(avgP)}`;
            if (gaugeTop) gaugeTop.textContent = `Top Tier: ${formatMoney(topP)}`;
            if (gaugeNote) gaugeNote.textContent = `Your Listing: ${formatMoney(rawPredictionBase.predicted_price)}`;

            // 12-Month Projected Rates Chart
            renderProjectedRatesChart(convertedPrice, activeCurrencySymbol);

            // Potential Revenue Calculator
            const slider = document.getElementById('occupancy-range');
            updateCalculator(slider ? slider.value : 75);

            // Traversal & Sensitivity
            renderDecisionPath(rawPredictionBase.decision_path, activeCurrencySymbol);
            renderSensitivityCards(rawPredictionBase.sensitivity, activeCurrencySymbol);

            // 5. Update Quantum Surge Simulation & Upgrade Matrix
            updateSurgeSimulation();
            renderUpgradeMatrixCards();
        }

        // 3. Update Analytics KPI Cards
        if (globalOverview) {
            animateCountUp('kpiAvgPrice', getConvertedPrice(globalOverview.avg_price), activeCurrencySymbol);
            animateCountUp('kpiMedianPrice', getConvertedPrice(globalOverview.median_price), activeCurrencySymbol);
        }

        // 4. Update Dataset Explorer Table
        updateDatasetTablePrices();
    }

    function updateDatasetTablePrices() {
        if (lastDatasetData) {
            renderDatasetTable(lastDatasetData);
        }
    }

    // Dynamic Strategy Selection
    window.selectStrategy = (stratKey) => {
        const budgetCard = document.getElementById('strat-budget');
        const recCard = document.getElementById('strat-rec');
        const premCard = document.getElementById('strat-prem');

        [budgetCard, recCard, premCard].forEach(c => c?.classList.remove('active'));

        let occ = 78;
        let baseRate = (rawPredictionBase?.predicted_price) || 145;

        if (stratKey === 'budget') {
            budgetCard?.classList.add('active');
            occ = 92;
            baseRate = rawPredictionBase?.strategies?.budget?.rate || Math.round((rawPredictionBase?.predicted_price || 145) * 0.88);
        } else if (stratKey === 'rec') {
            recCard?.classList.add('active');
            occ = 78;
            baseRate = rawPredictionBase?.strategies?.recommended?.rate || (rawPredictionBase?.predicted_price || 145);
        } else if (stratKey === 'prem') {
            premCard?.classList.add('active');
            occ = 58;
            baseRate = rawPredictionBase?.strategies?.premium?.rate || Math.round((rawPredictionBase?.predicted_price || 145) * 1.20);
        }

        activeNightlyRate = getConvertedPrice(baseRate);

        const slider = document.getElementById('occupancy-range');
        if (slider) {
            slider.value = occ;
            updateCalculator(occ);
        }
    };

    // Revenue Calculator Slider Handler
    window.updateCalculator = (occPercent) => {
        const occ = parseInt(occPercent) || 75;
        const nights = Math.round(30 * (occ / 100));

        const label = document.getElementById('slider-occupancy-label');
        if (label) label.textContent = `${occ}% (${nights} nights/mo)`;

        const monthlyGross = Math.round(activeNightlyRate * nights);
        const annualGross = monthlyGross * 12;

        const monthlyEl = document.getElementById('calc-monthly');
        const annualEl = document.getElementById('calc-annual');

        if (monthlyEl) monthlyEl.textContent = `${activeCurrencySymbol}${monthlyGross.toLocaleString()}`;
        if (annualEl) annualEl.textContent = `${activeCurrencySymbol}${annualGross.toLocaleString()}`;
    };

    // 12-Month Projected Rates Chart
    function renderProjectedRatesChart(baseRate, currency) {
        const chartEl = document.getElementById('chartProjectedRates');
        if (!chartEl) return;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const multipliers = [0.95, 0.98, 1.02, 1.05, 1.08, 1.15, 0.90, 0.94, 1.05, 1.12, 1.25, 1.38];
        const compMultipliers = [0.90, 0.92, 0.96, 0.98, 1.00, 1.05, 0.85, 0.88, 0.96, 1.02, 1.12, 1.20];

        const optimalSeries = multipliers.map(m => Math.round(baseRate * m));
        const compSeries = compMultipliers.map(m => Math.round(baseRate * m * 0.92));

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        const options = {
            series: [
                { name: 'AI Optimal Rate', data: optimalSeries },
                { name: 'Comp Baseline', data: compSeries }
            ],
            chart: {
                type: 'area',
                height: 240,
                width: '100%',
                redrawOnParentResize: true,
                redrawOnWindowResize: true,
                background: 'transparent',
                toolbar: { show: false },
                animations: { enabled: true, easing: 'easeinout', speed: 600 }
            },
            colors: ['#ff5a5f', '#94a3b8'],
            stroke: { curve: 'smooth', width: [3, 2], dashArray: [0, 4] },
            fill: {
                type: ['gradient', 'solid'],
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.35,
                    opacityTo: 0.0,
                    stops: [0, 100]
                }
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: months,
                labels: { style: { colors: isDark ? '#94a3b8' : '#5a5b5e', fontSize: '11px' } },
                axisBorder: { show: false }
            },
            yaxis: {
                labels: {
                    formatter: (val) => `${currency}${val}`,
                    style: { colors: isDark ? '#94a3b8' : '#5a5b5e', fontSize: '11px' }
                }
            },
            grid: {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
                y: { formatter: (val) => `${currency}${val} / night` }
            },
            legend: { show: false },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        chart: { height: 210 },
                        xaxis: {
                            tickAmount: 6,
                            labels: {
                                style: { fontSize: '9px', colors: isDark ? '#94a3b8' : '#5a5b5e' },
                                hideOverlappingLabels: true
                            }
                        },
                        yaxis: {
                            labels: {
                                style: { fontSize: '9.5px', colors: isDark ? '#94a3b8' : '#5a5b5e' },
                                offsetX: -6
                            }
                        }
                    }
                },
                {
                    breakpoint: 420,
                    options: {
                        chart: { height: 185 },
                        xaxis: {
                            tickAmount: 4,
                            labels: {
                                style: { fontSize: '8.5px', colors: isDark ? '#94a3b8' : '#5a5b5e' },
                                hideOverlappingLabels: true
                            }
                        },
                        yaxis: {
                            labels: {
                                style: { fontSize: '8.5px', colors: isDark ? '#94a3b8' : '#5a5b5e' },
                                offsetX: -10
                            }
                        }
                    }
                }
            ]
        };

        if (chartInstances.projectedRates) chartInstances.projectedRates.destroy();
        chartInstances.projectedRates = new ApexCharts(chartEl, options);
        chartInstances.projectedRates.render();
    }

    window.setChartRange = (rangeMonths) => {
        ['3m', '6m', '12m'].forEach(t => {
            document.getElementById('tab-' + t)?.classList.remove('active');
        });
        document.getElementById('tab-' + rangeMonths + 'm')?.classList.add('active');

        const tooltip = document.getElementById('chart-tooltip-text');
        if (!tooltip) return;

        if (rangeMonths === 3) {
            tooltip.textContent = `Next 90 Days: Stable high-velocity booking season (+9% over baseline)`;
        } else if (rangeMonths === 6) {
            tooltip.textContent = `Summer/Monsoon cycle: Mid-year seasonal adjustments expected`;
        } else {
            tooltip.textContent = `November-December: +15% peak holiday surge`;
        }
    };

    function updateInsightsPanel(res, input) {
        const loc = document.getElementById('insightLocationText');
        const cap = document.getElementById('insightCapacityText');
        const amen = document.getElementById('insightAmenityText');
        const sea = document.getElementById('insightSeasonText');

        if (loc) {
            loc.innerHTML = `Prime <strong>${input.neighbourhood || res.city}</strong> location commands a <strong class="text-highlight">+${Math.abs(res.price_difference_pct)}% premium</strong> over outer market comps.`;
        }
        if (cap) {
            cap.innerHTML = `Accommodating <strong>${input.accommodates} guests</strong> in <strong>${input.bedrooms} bedrooms</strong> increases target yield by <strong class="text-highlight">18%</strong> over standard units.`;
        }
        if (amen) {
            amen.innerHTML = `Selected premium amenities directly elevate your ADR tier to the top <strong class="text-highlight">15%</strong> of listings.`;
        }
        if (sea) {
            sea.innerHTML = `Peak seasonal demand factor applied; dynamic holiday rate rules recommended for maximum annual run-rate.`;
        }
    }

    function renderDecisionPath(path, currency) {
        const container = document.getElementById('treePathContainer');
        if (!container) return;

        container.innerHTML = '';
        if (!path || path.length === 0) {
            container.innerHTML = `<div class="empty-state">No traversal path available</div>`;
            return;
        }

        path.forEach((step, idx) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'path-step';
            if (step.leaf) {
                const leafFormatted = formatMoney(step.predicted_price, currency);
                stepEl.innerHTML = `
                    <div class="step-node-badge">${idx + 1}</div>
                    <div class="step-rule text-sage font-bold">
                        <span class="material-symbols-outlined icon-sage-sm">eco</span> Leaf Node Reached => Predicted Price: ${leafFormatted}
                    </div>
                    <div class="step-samples">${step.samples.toLocaleString()} sample listings</div>
                `;
            } else {
                stepEl.innerHTML = `
                    <div class="step-node-badge">${idx + 1}</div>
                    <div class="step-rule">Evaluate <strong>${step.feature}</strong> (Value: ${step.raw_value}) => <em>${step.decision}</em></div>
                    <div class="step-samples">${step.samples.toLocaleString()} samples</div>
                `;
            }
            container.appendChild(stepEl);
        });
    }

    function renderSensitivityCards(sens, currency) {
        const container = document.getElementById('sensitivityContainer');
        if (!container) return;

        container.innerHTML = '';
        if (!sens || sens.length === 0) {
            container.innerHTML = `<div class="empty-state">No sensitivity data available</div>`;
            return;
        }

        sens.forEach(s => {
            const card = document.createElement('div');
            card.className = 'sensitivity-card';
            const isPos = s.delta >= 0;
            const priceFormatted = formatMoney(s.predicted_price, currency);
            const deltaFormatted = formatMoney(Math.abs(s.delta), currency);
            card.innerHTML = `
                <span class="sensitivity-param">${s.parameter}</span>
                <span class="sensitivity-price">${priceFormatted}</span>
                <span class="sensitivity-delta ${isPos ? 'positive' : 'negative'}">
                    ${isPos ? '+' : '-'}${deltaFormatted}
                </span>
            `;
            container.appendChild(card);
        });
    }

    // ==========================================================================
    // 8. EXPLORATORY ANALYTICS (EDA CHARTS)
    // ==========================================================================
    const btnApplyFilters = document.getElementById('btnApplyFilters');
    if (btnApplyFilters) {
        btnApplyFilters.addEventListener('click', () => {
            fetchAnalytics();
        });
    }

    async function fetchAnalytics() {
        const cityVal = document.getElementById('filterCity')?.value || 'all';
        const roomVal = document.getElementById('filterRoomType')?.value || 'all';
        const bedVal = document.getElementById('filterBedrooms')?.value || 'all';

        try {
            const res = await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city: cityVal, room_type: roomVal, bedrooms: bedVal })
            });
            const data = await res.json();
            renderAnalyticsCharts(data);
        } catch (err) {
            console.error("Analytics fetch error:", err);
        }
    }

    function renderAnalyticsCharts(data) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#5a5b5e';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

        // 1. City Price Distribution
        if (data.city_chart && data.city_chart.length > 0) {
            const cities = data.city_chart.map(c => c.city);
            const avgPrices = data.city_chart.map(c => c.avg_price);
            const medPrices = data.city_chart.map(c => c.median_price);

            const options = {
                series: [
                    { name: 'Average Price', data: avgPrices },
                    { name: 'Median Price', data: medPrices }
                ],
                chart: {
                    type: 'bar',
                    height: 280,
                    width: '100%',
                    redrawOnParentResize: true,
                    redrawOnWindowResize: true,
                    background: 'transparent',
                    toolbar: { show: false }
                },
                colors: ['#ff5a5f', '#22c55e'],
                plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 4 } },
                dataLabels: { enabled: false },
                xaxis: { categories: cities, labels: { style: { colors: textColor, fontSize: '11px' }, rotate: -35 } },
                yaxis: { labels: { style: { colors: textColor } } },
                grid: { borderColor: gridColor },
                tooltip: { theme: isDark ? 'dark' : 'light' },
                responsive: [
                    {
                        breakpoint: 768,
                        options: {
                            chart: { height: 245 },
                            plotOptions: { bar: { columnWidth: '65%', borderRadius: 2 } },
                            xaxis: {
                                labels: {
                                    rotate: -45,
                                    rotateAlways: true,
                                    style: { fontSize: '9px', colors: textColor },
                                    trim: true,
                                    maxHeight: 52
                                }
                            },
                            yaxis: { labels: { style: { fontSize: '9px', colors: textColor }, offsetX: -6 } },
                            legend: { position: 'top', horizontalAlign: 'right', fontSize: '10px' }
                        }
                    },
                    {
                        breakpoint: 420,
                        options: {
                            chart: { height: 220 },
                            xaxis: { labels: { style: { fontSize: '8px', colors: textColor }, rotate: -50 } },
                            yaxis: { labels: { style: { fontSize: '8px', colors: textColor }, offsetX: -8 } }
                        }
                    }
                ]
            };

            if (chartInstances.cityPrices) chartInstances.cityPrices.destroy();
            chartInstances.cityPrices = new ApexCharts(document.getElementById('chartCityPrices'), options);
            chartInstances.cityPrices.render();
        }

        // 2. Price Histogram
        if (data.histogram && data.histogram.length > 0) {
            const bins = data.histogram.map(h => h.bin);
            const counts = data.histogram.map(h => h.count);

            const options = {
                series: [{ name: 'Listings Count', data: counts }],
                chart: {
                    type: 'area',
                    height: 280,
                    width: '100%',
                    redrawOnParentResize: true,
                    redrawOnWindowResize: true,
                    background: 'transparent',
                    toolbar: { show: false }
                },
                colors: ['#8b5cf6'],
                fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.0 } },
                stroke: { curve: 'smooth', width: 2 },
                xaxis: {
                    categories: bins,
                    tickAmount: 10,
                    labels: { style: { colors: textColor, fontSize: '10px' }, rotate: -40, hideOverlappingLabels: true }
                },
                yaxis: { labels: { style: { colors: textColor } } },
                grid: { borderColor: gridColor },
                tooltip: { theme: isDark ? 'dark' : 'light' },
                responsive: [
                    {
                        breakpoint: 768,
                        options: {
                            chart: { height: 235 },
                            xaxis: {
                                tickAmount: 6,
                                labels: { rotate: -30, style: { fontSize: '9px', colors: textColor }, hideOverlappingLabels: true }
                            },
                            yaxis: { labels: { style: { fontSize: '9px', colors: textColor }, offsetX: -6 } }
                        }
                    },
                    {
                        breakpoint: 420,
                        options: {
                            chart: { height: 210 },
                            xaxis: {
                                tickAmount: 4,
                                labels: { rotate: -30, style: { fontSize: '8px', colors: textColor }, hideOverlappingLabels: true }
                            },
                            yaxis: { labels: { style: { fontSize: '8px', colors: textColor }, offsetX: -8 } }
                        }
                    }
                ]
            };

            if (chartInstances.priceHist) chartInstances.priceHist.destroy();
            chartInstances.priceHist = new ApexCharts(document.getElementById('chartPriceHist'), options);
            chartInstances.priceHist.render();
        }

        // 3. Room Type Average Price
        if (data.room_chart && data.room_chart.length > 0) {
            const rooms = data.room_chart.map(r => r.room_type);
            const avgP = data.room_chart.map(r => r.avg_price);

            const options = {
                series: [{ name: 'Average Price', data: avgP }],
                chart: {
                    type: 'bar',
                    height: 280,
                    width: '100%',
                    redrawOnParentResize: true,
                    redrawOnWindowResize: true,
                    background: 'transparent',
                    toolbar: { show: false }
                },
                colors: ['#f59e0b'],
                plotOptions: { bar: { horizontal: true, barHeight: '50%', borderRadius: 4 } },
                xaxis: { labels: { style: { colors: textColor } } },
                yaxis: {
                    categories: rooms,
                    labels: { maxWidth: 110, trim: true, style: { colors: textColor, fontSize: '11px' } }
                },
                grid: { borderColor: gridColor },
                tooltip: { theme: isDark ? 'dark' : 'light' },
                responsive: [
                    {
                        breakpoint: 768,
                        options: {
                            chart: { height: 220 },
                            yaxis: {
                                labels: {
                                    maxWidth: 85,
                                    trim: true,
                                    style: { fontSize: '9.5px', colors: textColor },
                                    offsetX: -4
                                }
                            },
                            xaxis: { labels: { style: { fontSize: '9px', colors: textColor } } }
                        }
                    },
                    {
                        breakpoint: 420,
                        options: {
                            chart: { height: 200 },
                            yaxis: {
                                labels: {
                                    maxWidth: 70,
                                    trim: true,
                                    style: { fontSize: '8.5px', colors: textColor },
                                    offsetX: -6
                                }
                            }
                        }
                    }
                ]
            };

            if (chartInstances.roomType) chartInstances.roomType.destroy();
            chartInstances.roomType = new ApexCharts(document.getElementById('chartRoomType'), options);
            chartInstances.roomType.render();
        }

        // 4. Capacity Scaling
        if (data.acc_chart && data.acc_chart.length > 0) {
            const accs = data.acc_chart.map(a => a.accommodates);
            const prices = data.acc_chart.map(a => a.avg_price);

            const options = {
                series: [{ name: 'Average Price', data: prices }],
                chart: {
                    type: 'line',
                    height: 280,
                    width: '100%',
                    redrawOnParentResize: true,
                    redrawOnWindowResize: true,
                    background: 'transparent',
                    toolbar: { show: false }
                },
                colors: ['#06b6d4'],
                stroke: { curve: 'straight', width: 3 },
                markers: { size: 4 },
                xaxis: {
                    categories: accs,
                    tickAmount: 8,
                    title: { text: 'Guests Accommodated', style: { color: textColor } },
                    labels: { style: { colors: textColor } }
                },
                yaxis: { labels: { style: { colors: textColor } } },
                grid: { borderColor: gridColor },
                tooltip: { theme: isDark ? 'dark' : 'light' },
                responsive: [
                    {
                        breakpoint: 768,
                        options: {
                            chart: { height: 235 },
                            xaxis: {
                                tickAmount: 6,
                                title: { text: 'Guests', style: { fontSize: '10px', color: textColor } },
                                labels: { style: { fontSize: '9px', colors: textColor } }
                            },
                            yaxis: { labels: { style: { fontSize: '9px', colors: textColor }, offsetX: -6 } }
                        }
                    },
                    {
                        breakpoint: 420,
                        options: {
                            chart: { height: 210 },
                            xaxis: {
                                tickAmount: 4,
                                labels: { style: { fontSize: '8.5px', colors: textColor } }
                            },
                            yaxis: { labels: { style: { fontSize: '8.5px', colors: textColor }, offsetX: -8 } }
                        }
                    }
                ]
            };

            if (chartInstances.accommodates) chartInstances.accommodates.destroy();
            chartInstances.accommodates = new ApexCharts(document.getElementById('chartAccommodates'), options);
            chartInstances.accommodates.render();
        }

        // 5. Feature Correlations
        if (data.correlations && data.correlations.length > 0) {
            const feats = data.correlations.map(c => c.feature.replace('_', ' ').toUpperCase());
            const corrs = data.correlations.map(c => c.correlation);

            const options = {
                series: [{ name: 'Pearson Correlation', data: corrs }],
                chart: {
                    type: 'bar',
                    height: 260,
                    width: '100%',
                    redrawOnParentResize: true,
                    redrawOnWindowResize: true,
                    background: 'transparent',
                    toolbar: { show: false }
                },
                colors: ['#ff5a5f'],
                plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4 } },
                xaxis: { labels: { style: { colors: textColor } } },
                yaxis: {
                    categories: feats,
                    labels: { maxWidth: 110, trim: true, style: { colors: textColor, fontSize: '10px' } }
                },
                grid: { borderColor: gridColor },
                tooltip: { theme: isDark ? 'dark' : 'light' },
                responsive: [
                    {
                        breakpoint: 768,
                        options: {
                            chart: { height: 260 },
                            yaxis: {
                                labels: {
                                    maxWidth: 90,
                                    trim: true,
                                    style: { fontSize: '9px', colors: textColor },
                                    offsetX: -4
                                }
                            },
                            xaxis: { labels: { style: { fontSize: '9px', colors: textColor } } }
                        }
                    },
                    {
                        breakpoint: 420,
                        options: {
                            chart: { height: 235 },
                            yaxis: {
                                labels: {
                                    maxWidth: 75,
                                    trim: true,
                                    style: { fontSize: '8px', colors: textColor },
                                    offsetX: -6
                                }
                            }
                        }
                    }
                ]
            };

            if (chartInstances.correlations) chartInstances.correlations.destroy();
            chartInstances.correlations = new ApexCharts(document.getElementById('chartCorrelations'), options);
            chartInstances.correlations.render();
        }
    }

    // ==========================================================================
    // 9. DECISION TREE MODEL CONSOLE & TUNING
    // ==========================================================================
    const formModelTuning = document.getElementById('formModelTuning');
    const paramMaxDepth = document.getElementById('paramMaxDepth');
    const paramMinSplit = document.getElementById('paramMinSplit');
    const paramMinLeaf = document.getElementById('paramMinLeaf');

    if (paramMaxDepth) {
        paramMaxDepth.addEventListener('input', (e) => {
            const d = document.getElementById('valMaxDepth');
            if (d) d.textContent = e.target.value;
        });
    }
    if (paramMinSplit) {
        paramMinSplit.addEventListener('input', (e) => {
            const d = document.getElementById('valMinSplit');
            if (d) d.textContent = e.target.value;
        });
    }
    if (paramMinLeaf) {
        paramMinLeaf.addEventListener('input', (e) => {
            const d = document.getElementById('valMinLeaf');
            if (d) d.textContent = e.target.value;
        });
    }

    if (formModelTuning) {
        formModelTuning.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnTrainModel');
            const origHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined">sync</span> Retraining Model...';

            try {
                const payload = {
                    max_depth: parseInt(paramMaxDepth?.value || 14),
                    min_samples_split: parseInt(paramMinSplit?.value || 10),
                    min_samples_leaf: parseInt(paramMinLeaf?.value || 4),
                    criterion: document.getElementById('paramCriterion')?.value || 'squared_error',
                    filter_outliers: document.getElementById('paramFilterOutliers')?.checked ?? true,
                    target_city: document.getElementById('paramTargetCity')?.value || 'all'
                };

                const res = await fetch('/api/train', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                updateModelUI(data);
                await fetchTreeStructure(parseInt(document.getElementById('selectExportDepth')?.value || 3));
            } catch (err) {
                console.error("Retrain error:", err);
            } finally {
                btn.disabled = false;
                btn.innerHTML = origHTML;
            }
        });
    }

    async function fetchModelInfo() {
        try {
            const res = await fetch('/api/model-info');
            const data = await res.json();
            updateModelUI(data);
        } catch (err) {
            console.error("Fetch model info error:", err);
        }
    }

    function updateModelUI(data) {
        const m = data.metrics || {};
        const r2LogEl = document.getElementById('metricR2Log');
        const r2ActEl = document.getElementById('metricR2Actual');
        const trainR2El = document.getElementById('metricTrainR2');
        const rmseEl = document.getElementById('metricRMSE');
        const maeEl = document.getElementById('metricMAE');
        const treeMetaEl = document.getElementById('metricTreeMeta');
        const leafCountEl = document.getElementById('metricLeafCount');
        const headerR2 = document.getElementById('headerR2Text');

        if (r2LogEl) r2LogEl.textContent = m.r2_log ?? '--';
        if (r2ActEl) r2ActEl.textContent = m.r2_actual ?? '--';
        if (trainR2El) trainR2El.textContent = m.train_r2_log ?? '--';
        if (rmseEl) rmseEl.textContent = m.rmse ? formatMoney(m.rmse) : '--';
        if (maeEl) maeEl.textContent = m.mae ? formatMoney(m.mae) : '--';
        if (treeMetaEl) treeMetaEl.textContent = `Depth: ${m.tree_depth ?? '--'}`;
        if (leafCountEl) leafCountEl.textContent = `${(m.leaf_count || 0).toLocaleString()} Leaves`;

        if (headerR2) headerR2.textContent = `AI Model v4.2 • R²: ${m.r2_log ?? 0.72}`;

        if (data.feature_importances) {
            renderFeatureImportances(data.feature_importances);
        }
        if (data.residuals_sample) {
            renderResiduals(data.residuals_sample);
        }
    }

    function renderFeatureImportances(featData) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f8fafc' : '#1b1c1c';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

        const topFeats = featData.slice(0, 10);
        const categories = topFeats.map(d => d.feature.replace('_target_enc', ' (Level)').replace(/_/g, ' '));
        const importances = topFeats.map(d => parseFloat((d.importance * 100).toFixed(2)));

        const options = {
            series: [{ name: 'Importance %', data: importances }],
            chart: {
                type: 'bar',
                height: 280,
                width: '100%',
                redrawOnParentResize: true,
                redrawOnWindowResize: true,
                background: 'transparent',
                toolbar: { show: false }
            },
            colors: ['#22c55e'],
            plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4 } },
            dataLabels: { enabled: true, formatter: (val) => `${val}%` },
            xaxis: { labels: { style: { colors: isDark ? '#94a3b8' : '#5a5b5e' } } },
            yaxis: {
                categories,
                labels: { maxWidth: 120, trim: true, style: { colors: textColor, fontWeight: 600 } }
            },
            grid: { borderColor: gridColor },
            tooltip: { theme: isDark ? 'dark' : 'light' },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        chart: { height: 260 },
                        yaxis: {
                            labels: {
                                maxWidth: 95,
                                trim: true,
                                style: { fontSize: '9.5px', colors: textColor },
                                offsetX: -4
                            }
                        },
                        dataLabels: { style: { fontSize: '8.5px' } }
                    }
                },
                {
                    breakpoint: 420,
                    options: {
                        chart: { height: 240 },
                        yaxis: {
                            labels: {
                                maxWidth: 75,
                                trim: true,
                                style: { fontSize: '8.5px', colors: textColor },
                                offsetX: -6
                            }
                        }
                    }
                }
            ]
        };

        if (chartInstances.featureImportances) chartInstances.featureImportances.destroy();
        chartInstances.featureImportances = new ApexCharts(document.getElementById('chartFeatureImportances'), options);
        chartInstances.featureImportances.render();
    }

    async function fetchTreeStructure(maxDepth = 3) {
        try {
            const res = await fetch(`/api/tree-structure?max_depth=${maxDepth}`);
            const treeData = await res.json();
            renderTreeVisualizer(treeData);
        } catch (err) {
            console.error("Tree structure error:", err);
        }
    }

    const selectExportDepth = document.getElementById('selectExportDepth');
    if (selectExportDepth) {
        selectExportDepth.addEventListener('change', (e) => {
            fetchTreeStructure(parseInt(e.target.value));
        });
    }

    function renderTreeVisualizer(rootNode) {
        const container = document.getElementById('treeVisualizer');
        if (!container) return;

        function buildNodeHTML(node) {
            if (!node) return '';
            const isLeaf = node.is_leaf;

            let childrenHTML = '';
            if (!isLeaf && (node.left || node.right)) {
                childrenHTML = `
                    <div class="tree-children-row">
                        <div class="tree-branch">
                            <span class="branch-label">True (≤ ${node.threshold})</span>
                            ${buildNodeHTML(node.left)}
                        </div>
                        <div class="tree-branch">
                            <span class="branch-label">False (> ${node.threshold})</span>
                            ${buildNodeHTML(node.right)}
                        </div>
                    </div>
                `;
            }

            return `
                <div class="tree-node-wrapper">
                    <div class="tree-node-card ${isLeaf ? 'is-leaf' : ''}">
                        <div class="tree-node-title">${isLeaf ? 'Terminal Leaf' : node.feature}</div>
                        <div class="tree-node-price">$${node.predicted_price}</div>
                        <div class="tree-node-meta">Samples: ${(node.samples || 0).toLocaleString()}</div>
                    </div>
                    ${childrenHTML}
                </div>
            `;
        }

        container.innerHTML = buildNodeHTML(rootNode);
    }

    function renderResiduals(residualsData) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#5a5b5e';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

        const seriesData = residualsData.map(d => ({ x: d.actual, y: d.predicted }));

        const options = {
            series: [{ name: 'Listings', data: seriesData }],
            chart: {
                type: 'scatter',
                height: 280,
                width: '100%',
                redrawOnParentResize: true,
                redrawOnWindowResize: true,
                background: 'transparent',
                toolbar: { show: false }
            },
            colors: ['#06b6d4'],
            xaxis: {
                title: { text: 'Actual Price ($)', style: { color: textColor } },
                labels: { style: { colors: textColor } }
            },
            yaxis: {
                title: { text: 'Predicted Price ($)', style: { color: textColor } },
                labels: { style: { colors: textColor } }
            },
            grid: { borderColor: gridColor },
            tooltip: { theme: isDark ? 'dark' : 'light' },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        chart: { height: 235 },
                        markers: { size: 2.5 },
                        xaxis: {
                            title: { text: 'Actual ($)', style: { fontSize: '9.5px', color: textColor } },
                            labels: { style: { fontSize: '8.5px', colors: textColor } }
                        },
                        yaxis: {
                            title: { text: 'Pred ($)', style: { fontSize: '9.5px', color: textColor } },
                            labels: { style: { fontSize: '8.5px', colors: textColor }, offsetX: -6 }
                        }
                    }
                },
                {
                    breakpoint: 420,
                    options: {
                        chart: { height: 210 },
                        markers: { size: 2 },
                        xaxis: { labels: { style: { fontSize: '8px', colors: textColor } } },
                        yaxis: { labels: { style: { fontSize: '8px', colors: textColor }, offsetX: -8 } }
                    }
                }
            ]
        };

        if (chartInstances.residuals) chartInstances.residuals.destroy();
        chartInstances.residuals = new ApexCharts(document.getElementById('chartResiduals'), options);
        chartInstances.residuals.render();
    }

    // ==========================================================================
    // 10. DATASET EXPLORER (SEARCH, SORT, PAGINATION)
    // ==========================================================================
    async function fetchDatasetRecords() {
        try {
            const res = await fetch('/api/dataset/explorer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datasetState)
            });
            const data = await res.json();
            renderDatasetTable(data);
        } catch (err) {
            console.error("Dataset explorer fetch error:", err);
        }
    }

    function renderDatasetTable(data) {
        lastDatasetData = data;
        datasetState.totalPages = data.total_pages;
        datasetState.totalRecords = data.total_records;

        const curPage = document.getElementById('pageCurrent');
        const totPage = document.getElementById('pageTotal');
        const recTotal = document.getElementById('recordsTotal');

        if (curPage) curPage.textContent = data.page;
        if (totPage) totPage.textContent = data.total_pages;
        if (recTotal) recTotal.textContent = (data.total_records || 0).toLocaleString();

        const btnPrev = document.getElementById('btnPrevPage');
        const btnNext = document.getElementById('btnNextPage');
        if (btnPrev) btnPrev.disabled = (data.page <= 1);
        if (btnNext) btnNext.disabled = (data.page >= data.total_pages);

        const tbody = document.getElementById('datasetTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (!data.records || data.records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="empty-state">No matching listings found</td></tr>`;
            return;
        }

        data.records.forEach(r => {
            const tr = document.createElement('tr');
            const isSuper = (r.host_is_superhost === 1);
            const priceFormatted = (selectedCurrencyCode === 'AUTO') 
                ? `${r.currency ? r.currency.split(' ')[0] : '$'}${r.price}`
                : formatMoney(r.price);
            tr.innerHTML = `
                <td><strong>${r.city}</strong></td>
                <td>${r.neighbourhood}</td>
                <td>${r.property_type}</td>
                <td>${r.room_type}</td>
                <td>${r.accommodates}</td>
                <td>${r.bedrooms}</td>
                <td><strong class="text-coral">${priceFormatted}</strong></td>
                <td>${r.minimum_nights}</td>
                <td><span class="badge-tag ${isSuper ? 'superhost' : 'standard'}">${isSuper ? 'Superhost' : 'Standard'}</span></td>
                <td>${r.review_scores_rating || 0}/100</td>
            `;
            tbody.appendChild(tr);
        });
    }

    const searchInput = document.getElementById('datasetSearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                datasetState.search = e.target.value;
                datasetState.page = 1;
                fetchDatasetRecords();
            }, 300);
        });
    }

    const datasetCityFilter = document.getElementById('datasetCityFilter');
    if (datasetCityFilter) {
        datasetCityFilter.addEventListener('change', (e) => {
            datasetState.city = e.target.value;
            datasetState.page = 1;
            fetchDatasetRecords();
        });
    }

    const datasetSortBy = document.getElementById('datasetSortBy');
    if (datasetSortBy) {
        datasetSortBy.addEventListener('change', (e) => {
            datasetState.sortBy = e.target.value;
            fetchDatasetRecords();
        });
    }

    const datasetSortOrder = document.getElementById('datasetSortOrder');
    if (datasetSortOrder) {
        datasetSortOrder.addEventListener('change', (e) => {
            datasetState.sortOrder = e.target.value;
            fetchDatasetRecords();
        });
    }

    const btnPrevPage = document.getElementById('btnPrevPage');
    if (btnPrevPage) {
        btnPrevPage.addEventListener('click', () => {
            if (datasetState.page > 1) {
                datasetState.page--;
                fetchDatasetRecords();
            }
        });
    }

    const btnNextPage = document.getElementById('btnNextPage');
    if (btnNextPage) {
        btnNextPage.addEventListener('click', () => {
            if (datasetState.page < datasetState.totalPages) {
                datasetState.page++;
                fetchDatasetRecords();
            }
        });
    }

    // ==========================================================================
    // 7. SCROLL ANIMATIONS & STITCH DESIGN DOCK ENGINE
    // ==========================================================================
    function initScrollAnimations() {
        const scrollProgressLine = document.getElementById('scrollProgressLine');
        const header = document.getElementById('staywiseHeader');
        const floatingDock = document.getElementById('floatingQuickDock');
        const orb1 = document.querySelector('.ambient-glow-orb.orb-1');
        const orb2 = document.querySelector('.ambient-glow-orb.orb-2');
        const btnScrollTop = document.getElementById('btnDockScrollTop');
        const btnDockTune = document.getElementById('btnDockTune');

        let ticking = false;

        function handleScroll() {
            const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

            // 1. Top gradient scroll progress line
            if (scrollProgressLine) {
                scrollProgressLine.style.width = `${Math.min(100, Math.max(0, scrollPct))}%`;
            }

            // 2. Header shadow & elevation on scroll
            if (header) {
                if (scrollY > 20) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }

            // 3. Floating quick action dock reveal
            if (floatingDock) {
                if (scrollY > 220) {
                    floatingDock.classList.add('visible');
                } else {
                    floatingDock.classList.remove('visible');
                }
            }

            // 4. Parallax depth on ambient glow orbs
            if (orb1) {
                orb1.style.transform = `translate3d(0, ${scrollY * 0.07}px, 0)`;
            }
            if (orb2) {
                orb2.style.transform = `translate3d(0, ${-scrollY * 0.05}px, 0)`;
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(handleScroll);
                ticking = true;
            }
        }, { passive: true });

        // Run once on initial load
        handleScroll();

        // 5. Intersection Observer for Scroll Reveals
        const revealElements = document.querySelectorAll('.scroll-reveal');
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.08,
                rootMargin: '0px 0px -30px 0px'
            });

            revealElements.forEach(el => revealObserver.observe(el));
        } else {
            revealElements.forEach(el => el.classList.add('revealed'));
        }

        // Reveal elements visible immediately in initial viewport
        setTimeout(() => {
            revealElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight + 50) {
                    el.classList.add('revealed');
                }
            });
        }, 50);

        // 6. Floating Dock Scroll-to-Top Button
        if (btnScrollTop) {
            btnScrollTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (btnDockTune) {
            btnDockTune.addEventListener('click', () => {
                window.goToPredictorTab();
            });
        }

        // 7. Stitch Mobile Bottom Navigation Dock tab sync
        const bottomDockItems = document.querySelectorAll('.stitch-bottom-dock .dock-item');
        bottomDockItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetTab = item.getAttribute('data-tab');
                if (targetTab) {
                    switchTab(targetTab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // ==========================================================================
    // 10. AUDIO SYNTHESIZER & TACTILE SCI-FI SOUND ENGINE (WEB AUDIO API)
    // ==========================================================================
    function playFuturisticTone(type = 'click') {
        if (!audioFeedbackEnabled) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const now = ctx.currentTime;
            if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            } else if (type === 'success') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'surge') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            }
        } catch (e) {
            // Audio policy restriction
        }
    }

    function initAudioControl() {
        const btn = document.getElementById('btnAudioToggle');
        const icon = document.getElementById('audioIcon');
        function renderState() {
            if (btn) btn.classList.toggle('active', audioFeedbackEnabled);
            if (icon) icon.textContent = audioFeedbackEnabled ? 'volume_up' : 'volume_off';
            localStorage.setItem('staywise_audio', audioFeedbackEnabled);
        }
        if (btn) {
            btn.addEventListener('click', () => {
                audioFeedbackEnabled = !audioFeedbackEnabled;
                if (audioFeedbackEnabled) playFuturisticTone('success');
                renderState();
            });
        }
        renderState();
    }

    // ==========================================================================
    // 11. AUTONOMOUS AI YIELD AUTO-PILOT ENGINE
    // ==========================================================================
    function initAutoPilot() {
        const btn = document.getElementById('btnAutoPilotToggle');
        const statusText = document.getElementById('autoPilotStatusText');
        function renderState() {
            if (btn) btn.classList.toggle('active', autoPilotActive);
            if (statusText) statusText.textContent = autoPilotActive ? 'ACTIVE' : 'OFFLINE';
            const surgeStatus = document.getElementById('surgeAutoPilotStatus');
            if (surgeStatus) {
                surgeStatus.textContent = autoPilotActive ? 'ENGAGED' : 'MANUAL';
                surgeStatus.className = autoPilotActive ? 'surge-kpi-val text-cyan font-mono' : 'surge-kpi-val text-muted font-mono';
            }
            localStorage.setItem('staywise_autopilot', autoPilotActive);
        }
        if (btn) {
            btn.addEventListener('click', () => {
                autoPilotActive = !autoPilotActive;
                playFuturisticTone(autoPilotActive ? 'success' : 'click');
                renderState();
            });
        }
        renderState();
    }

    // ==========================================================================
    // 12. QUANTUM HIGH-DEMAND SURGE & EVENT SIMULATOR
    // ==========================================================================
    function initQuantumSurgeSimulator() {
        const pills = document.querySelectorAll('.surge-event-pill');
        const slider = document.getElementById('surgeRangeInput');

        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const mult = parseFloat(pill.getAttribute('data-mult')) || 1.0;
                activeSurgeMultiplier = mult;
                if (slider) slider.value = mult;
                playFuturisticTone('surge');
                updateSurgeSimulation();
            });
        });

        if (slider) {
            slider.addEventListener('input', (e) => {
                activeSurgeMultiplier = parseFloat(e.target.value) || 1.0;
                pills.forEach(p => p.classList.remove('active'));
                updateSurgeSimulation();
            });
        }
    }

    function updateSurgeSimulation() {
        const baseUSD = rawPredictionBase?.predicted_price || 145;
        const mult = activeSurgeMultiplier || 1.0;
        const multPct = Math.round((mult - 1.0) * 100);

        const badgeVal = document.getElementById('surgeMultiplierVal');
        const sliderLabel = document.getElementById('surgeSliderLabel');
        if (badgeVal) badgeVal.textContent = `${mult.toFixed(2)}x`;
        if (sliderLabel) {
            sliderLabel.textContent = `${mult.toFixed(2)}x (${multPct >= 0 ? '+' : ''}${multPct}% Surge ADR)`;
        }

        const surgedUSD = baseUSD * mult;
        const deltaUSD = surgedUSD - baseUSD;
        const monthlyRevUSD = surgedUSD * 25;
        const baseMonthlyUSD = baseUSD * 22;
        const monthlyGainUSD = monthlyRevUSD - baseMonthlyUSD;
        const occPct = Math.min(98, Math.round(78 * (1.0 / Math.pow(mult, 0.4))));

        const adrEl = document.getElementById('surgeNightlyAdr');
        const deltaEl = document.getElementById('surgeAdrDelta');
        const revEl = document.getElementById('surgeMonthlyRev');
        const gainEl = document.getElementById('surgeMonthlyGain');
        const occEl = document.getElementById('surgeProjectedOcc');

        if (adrEl) adrEl.textContent = formatMoney(surgedUSD);
        if (deltaEl) deltaEl.textContent = `${deltaUSD >= 0 ? '+' : '-'}${formatMoney(Math.abs(deltaUSD))} vs base`;
        if (revEl) revEl.textContent = formatMoney(monthlyRevUSD);
        if (gainEl) gainEl.textContent = `${monthlyGainUSD >= 0 ? '+' : '-'}${formatMoney(Math.abs(monthlyGainUSD))} net uplift`;
        if (occEl) occEl.textContent = `${occPct}%`;
    }

    // ==========================================================================
    // 14. QUANTUM UPGRADE ROI MATRIX ("WHAT-IF" NEURAL OPTIMIZER)
    // ==========================================================================
    async function fetchUpgradeMatrix(payload) {
        try {
            const res = await fetch('/api/upgrade/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.recommendations) {
                lastUpgradeRecommendations = data.recommendations;
                renderUpgradeMatrixCards();
            }
        } catch (err) {
            console.error("Upgrade matrix error:", err);
        }
    }

    function renderUpgradeMatrixCards() {
        const container = document.getElementById('quantumUpgradeCards');
        if (!container) return;

        if (!lastUpgradeRecommendations || lastUpgradeRecommendations.length === 0) {
            container.innerHTML = `<div class="empty-state">No upgrade recommendations available</div>`;
            return;
        }

        container.innerHTML = '';
        lastUpgradeRecommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'upgrade-rec-card';

            const dailyGain = formatMoney(rec.daily_delta);
            const monthlyGain = formatMoney(rec.monthly_delta);

            card.innerHTML = `
                <div class="upgrade-rec-header">
                    <div class="upgrade-title-wrap">
                        <span class="material-symbols-outlined upgrade-icon">${rec.icon || 'star'}</span>
                        <span class="upgrade-rec-title">${rec.title}</span>
                    </div>
                    <span class="upgrade-badge">${rec.badge}</span>
                </div>
                <div class="upgrade-numbers-row">
                    <div>
                        <span class="upgrade-daily-gain">+${dailyGain}</span>
                        <span class="text-xs text-muted"> / night</span>
                    </div>
                    <div class="upgrade-monthly-gain text-right">
                        <strong class="text-sage">+${monthlyGain}</strong>
                        <div class="text-xs text-muted">est. / month</div>
                    </div>
                </div>
                <div class="upgrade-meta-row">
                    <span>⚡ Velocity: <strong>${rec.occupancy_impact}</strong></span>
                    <span>⏳ Payback: <strong>${rec.payback_days === 0 ? 'Instant' : rec.payback_days + ' days'}</strong></span>
                </div>
                <button type="button" class="upgrade-apply-btn" data-key="${rec.param_key}" data-val="${rec.param_val}">
                    <span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span>
                    <span>${rec.action_label}</span>
                </button>
            `;

            const btn = card.querySelector('.upgrade-apply-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    const key = btn.getAttribute('data-key');
                    const val = btn.getAttribute('data-val');
                    applyUpgradeParam(key, val);
                });
            }

            container.appendChild(card);
        });
    }

    function applyUpgradeParam(paramKey, paramVal) {
        playFuturisticTone('success');
        if (paramKey === 'host_is_superhost') {
            const el = document.getElementById('predSuperhost');
            if (el) el.value = paramVal;
        } else if (paramKey === 'instant_bookable') {
            const el = document.getElementById('predInstant');
            if (el) el.value = paramVal;
        } else if (paramKey === 'review_scores_rating') {
            const el = document.getElementById('predRating');
            if (el) el.value = paramVal;
        } else if (paramKey === 'bedrooms') {
            steppers.bedrooms = parseInt(paramVal);
            steppers.guests = parseInt(paramVal) * 2;
            const bVal = document.getElementById('bedroomsValue');
            const bIn = document.getElementById('predBedrooms');
            const gVal = document.getElementById('guestsValue');
            const gIn = document.getElementById('predAccommodates');
            if (bVal) bVal.textContent = steppers.bedrooms;
            if (bIn) bIn.value = steppers.bedrooms;
            if (gVal) gVal.textContent = steppers.guests;
            if (gIn) gIn.value = steppers.guests;
        }

        runPredictSubmission(true);
    }

    function initUpgradeMatrixUI() {
        const btn = document.getElementById('btnRefreshUpgrades');
        if (btn) {
            btn.addEventListener('click', () => {
                if (lastInputPayload) {
                    playFuturisticTone('click');
                    fetchUpgradeMatrix(lastInputPayload);
                }
            });
        }
    }

    // Initialize scrolling engine
    initScrollAnimations();
});
