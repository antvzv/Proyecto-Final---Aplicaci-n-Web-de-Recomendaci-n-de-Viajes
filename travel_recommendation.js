// ==========================================
// Aplicación de Recomendaciones de Viaje
// ==========================================

// Datos incrustados de respaldo (para ejecución local file:// sin servidor CORS)
const fallbackTravelData = {
    countries: [
        {
            id: 1,
            name: "Japón",
            cities: [
                {
                    name: "Tokio, Japón",
                    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
                    description: "Una metrópolis vibrante donde la tecnología de vanguardia se combina con tradiciones milenarias, templos históricos y gastronomía de clase mundial."
                },
                {
                    name: "Kioto, Japón",
                    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
                    description: "Famosa por sus templos budistas clásicos, jardines imperiales, santuarios Shinto y casas de madera tradicionales."
                }
            ]
        },
        {
            id: 2,
            name: "Brasil",
            cities: [
                {
                    name: "Río de Janeiro, Brasil",
                    imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80",
                    description: "Conocida por sus famosas playas de Copacabana e Ipanema, la estatua del Cristo Redentor y el impresionante pan de azúcar."
                },
                {
                    name: "Salvador de Bahía, Brasil",
                    imageUrl: "https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?auto=format&fit=crop&w=800&q=80",
                    description: "Famosa por su arquitectura colonial portuguesa, cultura afrobrasileña, música vibrante y hermosas costas tropicales."
                }
            ]
        }
    ],
    temples: [
        {
            id: 1,
            name: "Angkor Wat, Camboya",
            imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            description: "El monumento religioso más grande del mundo, famoso por sus impresionantes torres talladas en piedra y su historia antigua."
        },
        {
            id: 2,
            name: "Taj Mahal, India",
            imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
            description: "Un imponente mausoleo de mármol blanco, considerado una de las Siete Maravillas del Mundo Moderno y símbolo de amor eterno."
        }
    ],
    beaches: [
        {
            id: 1,
            name: "Bora Bora, Polinesia Francesa",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            description: "Una isla paradisíaca rodeada de bungalows sobre aguas turquesas cristalinas y arrecifes de coral espectaculares."
        },
        {
            id: 2,
            name: "Playa Tulum, México",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            description: "Hermosas playas de arena blanca bordeadas por aguas caribeñas y ruinas mayas históricas situadas sobre acantilados."
        }
    ]
};

let travelData = null;

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const searchResultsSection = document.getElementById('searchResultsSection');
const recommendationsContainer = document.getElementById('recommendationsContainer');
const resultsCount = document.getElementById('resultsCount');
const contactForm = document.getElementById('contactForm');
const clockDisplay = document.getElementById('clockDisplay');

// 1. Cargar Datos desde JSON o Fallback
async function loadTravelData() {
    try {
        const response = await fetch('./travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        travelData = await response.json();
        console.log('Datos cargados exitosamente desde JSON:', travelData);
    } catch (error) {
        console.warn('No se pudo cargar el archivo JSON externamente (usando fallback local):', error.message);
        travelData = fallbackTravelData;
    }
}

// 2. Función de Búsqueda
function handleSearch() {
    if (!travelData) {
        alert('Cargando información de viajes, por favor intenta de nuevo en un momento.');
        return;
    }

    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        alert('Por favor ingresa un término de búsqueda (ej. playa, templo, país, Japón, Brasil).');
        return;
    }

    let results = [];

    // Reglas de búsqueda por palabra clave (soporta español e inglés)
    const isBeachQuery = ['playa', 'playas', 'beach', 'beaches'].some(k => query.includes(k));
    const isTempleQuery = ['templo', 'templos', 'temple', 'temples'].some(k => query.includes(k));
    const isCountryQuery = ['pais', 'país', 'paises', 'países', 'country', 'countries'].some(k => query.includes(k));

    if (isBeachQuery) {
        results = travelData.beaches;
    } else if (isTempleQuery) {
        results = travelData.temples;
    } else if (isCountryQuery) {
        // Retornar las ciudades de todos los países
        travelData.countries.forEach(country => {
            results.push(...country.cities);
        });
    } else {
        // Búsqueda específica por nombre de país o ciudad/lugar
        // A) Buscar coincidencias por país
        const matchedCountry = travelData.countries.find(c => c.name.toLowerCase().includes(query));
        if (matchedCountry) {
            results.push(...matchedCountry.cities);
        } else {
            // B) Buscar en ciudades de países
            travelData.countries.forEach(country => {
                country.cities.forEach(city => {
                    if (city.name.toLowerCase().includes(query) || city.description.toLowerCase().includes(query)) {
                        results.push(city);
                    }
                });
            });

            // C) Buscar en playas
            travelData.beaches.forEach(beach => {
                if (beach.name.toLowerCase().includes(query) || beach.description.toLowerCase().includes(query)) {
                    results.push(beach);
                }
            });

            // D) Buscar en templos
            travelData.temples.forEach(temple => {
                if (temple.name.toLowerCase().includes(query) || temple.description.toLowerCase().includes(query)) {
                    results.push(temple);
                }
            });
        }
    }

    renderResults(results);
}

// 3. Renderizar Tarjetas de Resultados
function renderResults(results) {
    recommendationsContainer.innerHTML = '';
    searchResultsSection.classList.remove('hidden');

    if (results.length === 0) {
        resultsCount.textContent = '0 resultados';
        recommendationsContainer.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-face-frown"></i>
                <p>No se encontraron destinos que coincidan con tu búsqueda.</p>
                <small>Intenta buscar palabras clave como <strong>playa</strong>, <strong>templo</strong>, <strong>Japón</strong> o <strong>Brasil</strong>.</small>
            </div>
        `;
        return;
    }

    resultsCount.textContent = `${results.length} resultado(s) encontrado(s)`;

    results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${item.imageUrl}" alt="${item.name}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';">
            </div>
            <div class="card-body">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-desc">${item.description}</p>
                <button class="btn btn-primary" onclick="exploreDestination('${item.name.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-location-arrow"></i> Explorar
                </button>
            </div>
        `;
        recommendationsContainer.appendChild(card);
    });

    // Desplazar suavemente a los resultados
    searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 4. Función de Limpiar Búsqueda
function handleClear() {
    searchInput.value = '';
    recommendationsContainer.innerHTML = '';
    searchResultsSection.classList.add('hidden');
    resultsCount.textContent = '0 resultados';
}

// 5. Botón interactivo de las tarjetas
function exploreDestination(name) {
    alert(`¡Excelente elección! Próximamente verás más información y ofertas de viaje para: ${name}`);
}

// 6. Enfocar barra de búsqueda desde botón Hero
function focusSearch() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        searchInput.focus();
    }, 300);
}

// 7. Manejo del Formulario de Contacto
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        alert(`¡Gracias ${name}! Hemos recibido tu mensaje desde ${email}. Nos pondremos en contacto contigo pronto.`);
        contactForm.reset();
    });
}

// 8. Reloj Digital en Vivo
function updateClock() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    if (clockDisplay) {
        clockDisplay.textContent = `${now.toLocaleDateString('es-ES', dateOptions)} - ${now.toLocaleTimeString('es-ES', timeOptions)}`;
    }
}

// Event Listeners y Manejo de Teclado
btnSearch.addEventListener('click', handleSearch);
btnClear.addEventListener('click', handleClear);

searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Resaltar elemento activo del menú al hacer scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    loadTravelData();
    updateClock();
    setInterval(updateClock, 1000);
});

