/**
 * Cafetaria Multi-locatie Website - Main JavaScript
 * Finale versie met belangrijke bugfixes
 */

// Wacht tot de DOM volledig is geladen
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM volledig geladen');
    
    // Direct de preloader verbergen
    handlePreloader();
    
    // Initialiseer alle componenten met vertraging om DOM-manipulatie betrouwbaarder te maken
    setTimeout(() => {
        initializeNavigation();
        initializeLocationSwitcher();
        initializeMenuFilter();
        initializeToasts();
        initializeMobileComponents();
        initializeQuickAdd();
        initializeScrollAnimations();
        
        // Detecteer gebruikerslocatie (indien toestemming gegeven)
        if (localStorage.getItem('locationDetectionDismissed') !== 'true') {
            setTimeout(() => {
                detectUserLocation();
            }, 3000);
        }
    }, 100);
});

/**
 * Preloader afhandeling
 */
function handlePreloader() {
    console.log('Preloader handling gestart');
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        console.log('Preloader element gevonden, verbergen...');
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
            console.log('Preloader volledig verborgen');
        }, 500);
    } else {
        console.log('Preloader element niet gevonden');
    }
}

/**
 * Locatie data voor alle vestigingen
 */
const locationData = {
    geldrop: {
        name: 'Geldrop',
        address: 'Beneden beekloop 32, 5662 HL Geldrop',
        phone: '040-3033255',
        mapUrl: 'https://maps.google.com/?q=Beneden+beekloop+32+5662+HL+Geldrop',
        coordinates: {
            lat: 51.4210,
            lng: 5.5500
        }
    },
    heeze: {
        name: 'Heeze',
        address: 'Jan Deckersstraat 45, 5591 HS Heeze',
        phone: '040-2261135',
        mapUrl: 'https://maps.google.com/?q=Jan+Deckersstraat+45+5591+HS+Heeze',
        coordinates: {
            lat: 51.3839,
            lng: 5.5697
        }
    },
    eindhoven: {
        name: 'Eindhoven (Blixembosch)',
        address: 'Ouverture 133, 5629 PV Eindhoven',
        phone: '040-2427863',
        mapUrl: 'https://maps.google.com/?q=Ouverture+133+5629+PV+Eindhoven',
        coordinates: {
            lat: 51.4741,
            lng: 5.4800
        }
    }
};

/**
 * Initialiseer navigatie interacties
 */
function initializeNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const navLinks = document.querySelectorAll('.mobile-nav-links a');
    
    if (mobileMenuToggle && mobileNavOverlay) {
        mobileMenuToggle.addEventListener('click', function() {
            console.log('Mobile menu toggle geklikt');
            mobileNavOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenuBtn && mobileNavOverlay) {
        closeMenuBtn.addEventListener('click', function() {
            console.log('Close menu button geklikt');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileNavOverlay) {
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

/**
 * Locatie switcher functionaliteit
 */
function initializeLocationSwitcher() {
    console.log('Initializing location switcher');
    
    // Essentiële elementen ophalen
    const locationToggle = document.querySelector('.location-toggle');
    const locationSelector = document.querySelector('.location-selector');
    const locationItems = document.querySelectorAll('.location-item');
    const detectLocationBtn = document.getElementById('detect-location');
    const changeLocationBtn = document.querySelector('.change-location-btn');
    const mobileLocationBtns = document.querySelectorAll('.mobile-location-btn');
    
    console.log('Location toggle element:', locationToggle);
    console.log('Location selector element:', locationSelector);
    console.log('Number of location items:', locationItems.length);
    
    // Haal opgeslagen locatie op of gebruik standaard (Geldrop)
    const savedLocation = localStorage.getItem('selectedLocation') || 'geldrop';
    console.log('Saved location:', savedLocation);
    updateLocationContent(savedLocation);
    
    // Toggle dropdown voor desktop locatie selector
    if (locationToggle && locationSelector) {
        // Verwijder eventuele bestaande event listeners (in geval van dubbele initialisatie)
        const newLocationToggle = locationToggle.cloneNode(true);
        locationToggle.parentNode.replaceChild(newLocationToggle, locationToggle);
        
        // Voeg nieuwe event listener toe
        newLocationToggle.addEventListener('click', function(e) {
            console.log('Location toggle clicked');
            e.preventDefault();
            e.stopPropagation();
            locationSelector.classList.toggle('active');
        });
        
        // Sluit dropdown bij klikken buiten
        document.addEventListener('click', function(e) {
            if (!locationSelector.contains(e.target) && e.target !== newLocationToggle) {
                locationSelector.classList.remove('active');
            }
        });
    }
    
    // Verwerk klikken op locatie-items in dropdown
    locationItems.forEach(item => {
        // Replace with cloned node to remove any existing event listeners
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', function(e) {
            console.log('Location item clicked:', this.getAttribute('data-location'));
            e.preventDefault();
            
            const locationId = this.getAttribute('data-location');
            if (!locationId) return;
            
            // Update alle locatie-items
            locationItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Update content en sla locatie op
            updateLocationContent(locationId);
            localStorage.setItem('selectedLocation', locationId);
            
            // Sluit dropdown
            if (locationSelector) {
                locationSelector.classList.remove('active');
            }
            
            // Toon notificatie
            showToast(`Locatie gewijzigd naar ${locationData[locationId].name}`);
        });
    });
    
    // Verwerk klikken op locatie-items in footer
    const footerLocationItems = document.querySelectorAll('.locations-list .location-item');
    footerLocationItems.forEach(item => {
        // Replace with cloned node to remove any existing event listeners
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        newItem.addEventListener('click', function(e) {
            console.log('Footer location item clicked:', this.getAttribute('data-location'));
            e.preventDefault();
            
            const locationId = this.getAttribute('data-location');
            if (!locationId) return;
            
            // Update alle footer locatie-items
            footerLocationItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Update content en sla locatie op
            updateLocationContent(locationId);
            localStorage.setItem('selectedLocation', locationId);
            
            // Toon notificatie
            showToast(`Locatie gewijzigd naar ${locationData[locationId].name}`);
        });
    });
    
    // Mobiele locatieknoppen
    mobileLocationBtns.forEach(btn => {
        // Replace with cloned node to remove any existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function() {
            console.log('Mobile location button clicked:', this.getAttribute('data-location'));
            
            const locationId = this.getAttribute('data-location');
            if (!locationId) return;
            
            // Update UI
            mobileLocationBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update content
            updateLocationContent(locationId);
            
            // Sla locatie op
            localStorage.setItem('selectedLocation', locationId);
            
            // Toon notificatie
            showToast(`Locatie gewijzigd naar ${locationData[locationId].name}`);
            
            // Sluit mobiel menu na timeout
            setTimeout(() => {
                const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
                if (mobileNavOverlay) {
                    mobileNavOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }, 500);
        });
    });
    
    // Detecteer locatie button
    if (detectLocationBtn) {
        // Replace with cloned node to remove any existing event listeners
        const newDetectLocationBtn = detectLocationBtn.cloneNode(true);
        detectLocationBtn.parentNode.replaceChild(newDetectLocationBtn, detectLocationBtn);
        
        newDetectLocationBtn.addEventListener('click', function(e) {
            console.log('Detect location button clicked');
            e.preventDefault();
            detectUserLocation();
            if (locationSelector) {
                locationSelector.classList.remove('active');
            }
        });
    }
    
    // Change Location knop in banner
    if (changeLocationBtn) {
        // Replace with cloned node to remove any existing event listeners
        const newChangeLocationBtn = changeLocationBtn.cloneNode(true);
        changeLocationBtn.parentNode.replaceChild(newChangeLocationBtn, changeLocationBtn);
        
        newChangeLocationBtn.addEventListener('click', function(e) {
            console.log('Change location button clicked');
            e.preventDefault();
            
            if (window.innerWidth <= 768) {
                // Open mobiel menu en scroll naar locatie sectie
                const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
                const mobileLocations = document.querySelector('.mobile-locations');
                
                if (mobileNavOverlay) {
                    mobileNavOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    
                    // Scroll naar locatie sectie in mobiel menu
                    if (mobileLocations) {
                        setTimeout(() => {
                            mobileLocations.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                    }
                }
            } else {
                // Open desktop dropdown
                if (locationSelector) {
                    locationSelector.classList.add('active');
                }
            }
        });
    }
}

/**
 * Update alle content op basis van geselecteerde locatie
 */
function updateLocationContent(locationId) {
    console.log('Updating location content for:', locationId);
    
    const location = locationData[locationId];
    if (!location) {
        console.error('Location data not found for:', locationId);
        return;
    }
    
    // Update locatie naam in verschillende delen van de pagina
    safeUpdateElement('current-location-text', location.name);
    safeUpdateElement('header-location-text', location.name);
    safeUpdateElement('mobile-location-text', location.name);
    safeUpdateElement('hero-location-text', location.name);
    safeUpdateElement('about-location-text', location.name);
    safeUpdateElement('footer-location-text', location.name);
    safeUpdateElement('banner-location-text', location.name);
    
    // Update alle elementen met de klasse location-text
    document.querySelectorAll('.location-text').forEach(el => {
        el.textContent = location.name;
    });
    
    // Update telefoonnummers
    safeUpdateElement('hero-phone-number', location.phone);
    safeUpdateElement('cta-phone-number', location.phone);
    safeUpdateElement('cta-section-phone-number', location.phone);
    
    document.querySelectorAll('.phone-number-text').forEach(el => {
        el.textContent = location.phone;
    });
    
    // Update telefoon links
    safeUpdateElementAttribute('hero-phone-link', 'href', `tel:${location.phone}`);
    safeUpdateElementAttribute('order-phone-link', 'href', `tel:${location.phone}`);
    safeUpdateElementAttribute('cta-phone-link', 'href', `tel:${location.phone}`);
    safeUpdateElementAttribute('cta-section-phone-link', 'href', `tel:${location.phone}`);
    safeUpdateElementAttribute('mobile-phone-link', 'href', `tel:${location.phone}`);
    safeUpdateElementAttribute('mobile-menu-phone', 'href', `tel:${location.phone}`);
    
    // Update branch details visibility
    document.querySelectorAll('.branch-details').forEach(el => {
        el.style.display = 'none';
    });
    
    const targetBranchDetails = document.getElementById(`${locationId}-details`);
    if (targetBranchDetails) {
        targetBranchDetails.style.display = 'flex';
    }
    
    // Update location-specific content
    toggleActiveClass('.location-specific-content', `${locationId}-about`);
    toggleActiveClass('.location-specific-address', `${locationId}-address`);
    toggleActiveClass('.location-specific-phone', `${locationId}-phone`);
    toggleActiveClass('.location-specific-map', `${locationId}-map`);
    toggleActiveClass('.location-specific-footer', `${locationId}-footer-address`);
    toggleActiveClass('.location-specific-footer', `${locationId}-footer-phone`);
    
    // Update active classes on location selectors
    document.querySelectorAll('.location-item').forEach(item => {
        if (item.getAttribute('data-location') === locationId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.mobile-location-btn').forEach(btn => {
        if (btn.getAttribute('data-location') === locationId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.locations-list .location-item').forEach(item => {
        if (item.getAttribute('data-location') === locationId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    console.log('Location content updated successfully');
}

// Helper functie voor veilige element updates
function safeUpdateElement(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Helper functie voor veilige attribuut updates
function safeUpdateElementAttribute(elementId, attribute, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element[attribute] = value;
    }
}

// Helper functie voor het toevoegen/verwijderen van active classes
function toggleActiveClass(selector, activeElementId) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.classList.remove('active');
    });
    
    const activeElement = document.getElementById(activeElementId);
    if (activeElement) {
        activeElement.classList.add('active');
    }
}

/**
 * Scroll event handling voor header en animaties
 */
function initializeScrollAnimations() {
    const header = document.querySelector('.header');
    const scrollToTop = document.querySelector('.scroll-to-top');
    const processLines = document.querySelectorAll('.process-line');
    const animatedElements = document.querySelectorAll('.animate-when-visible');
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function onScroll() {
        const currentScrollY = window.scrollY;
        
        // Header effecten
        if (header) {
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Verberg/toon header bij scrollen
            if (currentScrollY > 300) {
                if (currentScrollY > lastScrollY) {
                    header.classList.add('scroll-down');
                } else {
                    header.classList.remove('scroll-down');
                }
            }
        }
        
        // Toon/verberg scroll-to-top knop
        if (scrollToTop) {
            if (currentScrollY > 500) {
                scrollToTop.style.opacity = '1';
                scrollToTop.style.visibility = 'visible';
            } else {
                scrollToTop.style.opacity = '0';
                scrollToTop.style.visibility = 'hidden';
            }
        }
        
        // Controleer of elementen in viewport zijn voor animatie
        animatedElements.forEach(el => {
            if (isElementInViewport(el)) {
                el.classList.add('visible');
            }
        });
        
        // Animeer proces lijnen wanneer zichtbaar
        processLines.forEach(line => {
            if (isElementInViewport(line)) {
                line.classList.add('active');
            }
        });
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    });
    
    // Initiële check voor elementen die al in viewport zijn bij laden
    setTimeout(() => {
        onScroll(); // Trigger een initiële scroll event
    }, 500);
    
    // Scroll naar boven knop
    if (scrollToTop) {
        scrollToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Helper functie om te controleren of een element in de viewport is
 */
function isElementInViewport(el) {
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
    );
}

/**
 * Menu categorie filter functionaliteit
 */
function initializeMenuFilter() {
    const categoryButtons = document.querySelectorAll('.cat-btn');
    const foodItems = document.querySelectorAll('.food-item');
    
    if (!categoryButtons.length || !foodItems.length) {
        return;
    }
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            foodItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Quick add knop functionaliteit
 */
function initializeQuickAdd() {
    const quickAddButtons = document.querySelectorAll('.quick-add');
    
    quickAddButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const foodItem = this.closest('.food-item');
            if (!foodItem) return;
            
            const itemNameEl = foodItem.querySelector('h3');
            const itemName = itemNameEl ? itemNameEl.textContent : 'Item';
            
            showToast(`${itemName} toegevoegd aan bestelling`);
        });
    });
}

/**
 * Toast notificatie systeem
 */
function initializeToasts() {
    const toast = document.getElementById('notification-toast');
    const toastClose = document.querySelector('.toast-close');
    
    if (toast && toastClose) {
        toastClose.addEventListener('click', function() {
            toast.classList.remove('show');
        });
    }
}

/**
 * Toon toast notificatie met aangepast bericht
 */
function showToast(message) {
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) {
        console.error('Toast elementen niet gevonden');
        return;
    }
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // Verberg automatisch na 3 seconden
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Detecteer de locatie van gebruiker en switch naar dichtstbijzijnde vestiging
 */
function detectUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            let closestLocation = null;
            let shortestDistance = Infinity;
            
            // Vind dichtstbijzijnde locatie
            for (const [id, location] of Object.entries(locationData)) {
                const distance = calculateDistance(
                    userLat, userLng,
                    location.coordinates.lat, location.coordinates.lng
                );
                
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    closestLocation = id;
                }
            }
            
            // Als de dichtstbijzijnde locatie verschilt van de huidige
            const currentLocation = localStorage.getItem('selectedLocation') || 'geldrop';
            
            if (closestLocation && closestLocation !== currentLocation) {
                showLocationNotification(closestLocation);
            }
        }, error => {
            console.log('Geolocation error:', error);
            showToast('Kon je locatie niet bepalen. Je kunt handmatig een vestiging kiezen.');
        });
    } else {
        showToast('Je browser ondersteunt geen geolocatie. Je kunt handmatig een vestiging kiezen.');
    }
}

/**
 * Toon notificatie voor nabije locatie
 */
function showLocationNotification(locationId) {
    const notification = document.getElementById('location-notification');
    const locationName = document.getElementById('detected-location-name');
    const switchButton = document.getElementById('switch-to-nearby');
    const dismissButton = document.getElementById('dismiss-notification');
    
    if (!notification || !locationName || !switchButton || !dismissButton) {
        console.error('Benodigde elementen voor locatie notificatie ontbreken');
        return;
    }
    
    // Reset eventlisteners om dubbele binding te voorkomen
    const newSwitchButton = switchButton.cloneNode(true);
    const newDismissButton = dismissButton.cloneNode(true);
    
    switchButton.parentNode.replaceChild(newSwitchButton, switchButton);
    dismissButton.parentNode.replaceChild(newDismissButton, dismissButton);
    
    // Toon de locatienaam
    locationName.textContent = locationData[locationId].name;
    
    // Switch button
    newSwitchButton.addEventListener('click', function() {
        updateLocationContent(locationId);
        localStorage.setItem('selectedLocation', locationId);
        notification.classList.remove('show');
    });
    
    // Dismiss button
    newDismissButton.addEventListener('click', function() {
        notification.classList.remove('show');
        localStorage.setItem('locationDetectionDismissed', 'true');
    });
    
    // Toon notificatie
    notification.classList.add('show');
}

/**
 * Bereken afstand tussen twee coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius van de aarde in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Afstand in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

/**
 * Mobiel-specifieke componenten
 */
function initializeMobileComponents() {
    const mobileOrderBtn = document.querySelector('.mobile-order-btn');
    
    if (mobileOrderBtn) {
        // Voeg pulserende animatie toe aan mobiele bestelknop (met minder frequentie)
        setInterval(() => {
            mobileOrderBtn.classList.add('pulse');
            
            setTimeout(() => {
                mobileOrderBtn.classList.remove('pulse');
            }, 1000);
        }, 8000); // Elke 8 seconden in plaats van 5
    }
    
    // Update openingstijden
    updateOpeningHours();
}

/**
 * Update openingstijden op basis van huidige dag/tijd
 */
function updateOpeningHours() {
    const openingHoursElements = document.querySelectorAll('.opening-hours span');
    const statusBadge = document.querySelector('.status-badge');
    const statusText = document.querySelector('.status-text');
    const statusIndicator = document.querySelector('.status-indicator');
    
    if (!openingHoursElements.length && !statusBadge && !statusText && !statusIndicator) {
        return;
    }
    
    // Huidige dag en tijd
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 (zondag) tot 6 (zaterdag)
    
    // Cafetaria openingstijden (alle dagen 12:00 - 21:00)
    const openHour = 12;
    const closeHour = 21;
    
    // Check of de cafetaria nu open is
    const isOpen = currentHour >= openHour && currentHour < closeHour;
    
    // Update statusbadge
    if (statusBadge && statusText && statusIndicator) {
        if (isOpen) {
            statusText.textContent = 'Nu geopend';
            statusBadge.style.backgroundColor = 'rgba(0, 220, 33, 0.1)';
            statusIndicator.style.backgroundColor = 'var(--primary)';
        } else {
            statusText.textContent = 'Nu gesloten';
            statusBadge.style.backgroundColor = 'rgba(255, 77, 109, 0.1)';
            statusIndicator.style.backgroundColor = 'var(--red)';
        }
    }
    
    // Update opening hours display
    openingHoursElements.forEach(el => {
        if (el) {
            el.textContent = `Vandaag ${isOpen ? 'open' : 'gesloten'}: ${openHour}:00 - ${closeHour}:00`;
        }
    });
    
    // Highlight huidige dag in openingstijdenrooster
    const hoursGrid = document.querySelector('.hours-grid');
    if (hoursGrid) {
        const dayElements = hoursGrid.querySelectorAll('.day');
        const timeElements = hoursGrid.querySelectorAll('.time');
        
        if (dayElements.length === timeElements.length) {
            dayElements.forEach((dayEl, index) => {
                // Reset styling
                dayEl.style.fontWeight = 'var(--weight-medium)';
                dayEl.style.color = 'var(--black)';
                
                if (timeElements[index]) {
                    timeElements[index].style.fontWeight = 'normal';
                    timeElements[index].style.color = 'var(--gray)';
                }
                
                // Highlight huidige dag
                if (index === currentDay) {
                    dayEl.style.fontWeight = 'var(--weight-bold)';
                    dayEl.style.color = 'var(--primary)';
                    
                    if (timeElements[index]) {
                        timeElements[index].style.fontWeight = 'var(--weight-medium)';
                        timeElements[index].style.color = 'var(--primary)';
                    }
                }
            });
        }
    }
}