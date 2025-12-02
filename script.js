// ===== 1. Kategoriler Menüsü İşlevselliği =====
function setupCategoriesMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const menuContent = document.querySelector('.menu-content');
    
    if (menuBtn && menuContent) {
        // Menüyü aç/kapa
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            menuContent.classList.toggle('show');
        });

        // Sayfa herhangi bir yerine tıklandığında menüyü kapat
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-menu')) {
                menuBtn.classList.remove('active');
                menuContent.classList.remove('show');
            }
        });

        // Kategori seçildiğinde menüyü kapat
        menuContent.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                menuBtn.classList.remove('active');
                menuContent.classList.remove('show');
                
                // Kategori seçildiğinde işlem yapabilirsiniz
                const kategori = e.target.textContent.trim();
                console.log(`"${kategori}" kategorisi seçildi.`);
            }
        });
    }
}

// ===== 2. Arama İşlevselliği =====
function setupSearchFunctionality() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchBtn || !searchOverlay || !searchClose || !searchForm || !searchInput || !searchResults) {
        console.error('Arama için gerekli elementler bulunamadı.');
        return;
    }
    
    // Arama butonuna tıklandığında overlay'i aç
    searchBtn.addEventListener('click', function() {
        searchOverlay.classList.add('active');
        searchInput.focus();
        document.body.style.overflow = 'hidden'; // Sayfanın kaydırılmasını engelle
    });
    
    // Kapat butonuna tıklandığında overlay'i kapat
    searchClose.addEventListener('click', function() {
        searchOverlay.classList.remove('active');
        searchResults.classList.remove('show');
        searchInput.value = '';
        document.body.style.overflow = ''; // Sayfanın kaydırılmasını tekrar etkinleştir
    });
    
    // ESC tuşuna basıldığında overlay'i kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
            searchResults.classList.remove('show');
            searchInput.value = '';
            document.body.style.overflow = '';
        }
    });
    
    // Arama formunu gönderme
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length < 2) {
            alert('Lütfen en az 2 karakter girin.');
            return;
        }
        
        performSearch(searchTerm);
    });
}

// ===== 3. Arama İşlemi =====
function performSearch(searchTerm) {
    const searchResults = document.querySelector('.search-results');
    
    if (!searchResults) {
        console.error('Arama sonuçları için gerekli element bulunamadı.');
        return;
    }
    
    // Sayfanın türünü belirle (diziler veya filmler)
    const isDizilerPage = document.querySelector('.diziler-grid') !== null;
    const isFilmlerPage = document.querySelector('.filmler-grid') !== null;
    
    // İçerik kartlarını al
    const contentCards = isDizilerPage ? document.querySelectorAll('.dizi-card') : 
                         isFilmlerPage ? document.querySelectorAll('.film-card') : [];
    
    const results = [];
    
    // İçerik kartlarını filtrele
    contentCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const genre = card.querySelector('p').textContent.toLowerCase();
        const imgSrc = card.querySelector('img').src;
        const rating = card.querySelector('.dizi-rating span, .film-rating span').textContent;
        
        // Film sayfasında süre bilgisini al
        const duration = isFilmlerPage && card.querySelector('.film-duration') ? 
                        card.querySelector('.film-duration').textContent.trim() : '';
        
        if (title.includes(searchTerm) || genre.includes(searchTerm)) {
            results.push({
                title: card.querySelector('h3').textContent,
                genre: card.querySelector('p').textContent,
                imgSrc: imgSrc,
                rating: rating,
                duration: duration,
                trailerUrl: card.getAttribute('data-trailer') || ''
            });
        }
    });
    
    // Sonuçları göster
    displaySearchResults(results, searchTerm);
}

// ===== 4. Arama Sonuçlarını Gösterme =====
function displaySearchResults(results, searchTerm) {
    const searchResults = document.querySelector('.search-results');
    
    if (!searchResults) {
        console.error('Arama sonuçları için gerekli element bulunamadı.');
        return;
    }
    
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>"${searchTerm}" için sonuç bulunamadı.</h3>
                <p>Farklı anahtar kelimeler deneyebilir veya kategorilere göz atabilirsiniz.</p>
            </div>
        `;
    } else {
        const resultHeader = document.createElement('h2');
        resultHeader.textContent = `"${searchTerm}" için ${results.length} sonuç bulundu`;
        resultHeader.style.color = 'white';
        resultHeader.style.marginBottom = '1.5rem';
        resultHeader.style.fontSize = '1.2rem';
        searchResults.appendChild(resultHeader);
        
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            resultItem.innerHTML = `
                <img src="${result.imgSrc}" alt="${result.title}" class="search-result-image">
                <div class="search-result-info">
                    <h4>${result.title}</h4>
                    <p>${result.genre}</p>
                    <div class="search-result-rating">
                        <i class="fas fa-star"></i> ${result.rating}
                    </div>
                    ${result.duration ? `
                        <div style="color: #ccc; font-size: 0.8rem; margin-top: 0.3rem;">
                            <i class="far fa-clock"></i> ${result.duration}
                        </div>
                    ` : ''}
                </div>
            `;
            
            resultItem.addEventListener('click', function() {
                if (result.trailerUrl) {
                    // Fragman varsa aç
                    openTrailer(result.trailerUrl);
                } else {
                    // Detay sayfasına yönlendir
                    alert(`${result.title} detay sayfasına yönlendiriliyorsunuz...`);
                }
            });
            
            searchResults.appendChild(resultItem);
        });
    }
    
    searchResults.classList.add('show');
}

// ===== 5. Fragman İşlevselliği =====
function setupTrailerFunctionality() {
    const trailerModal = document.querySelector('.trailer-modal');
    const trailerClose = document.querySelector('.trailer-close');
    const trailerFrame = document.getElementById('trailerFrame');
    const cards = document.querySelectorAll('.dizi-card, .film-card');
    
    if (!trailerModal || !trailerClose || !trailerFrame) {
        console.log('Fragman modalı için gerekli elementler bulunamadı.');
        return;
    }
    
    // Kartlara tıklandığında fragmanı aç
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const trailerUrl = this.getAttribute('data-trailer');
            if (trailerUrl) {
                openTrailer(trailerUrl);
            } else {
                // Fragman yoksa detay sayfasına yönlendir
                const title = this.querySelector('h3').textContent;
                alert(`${title} detay sayfasına yönlendiriliyorsunuz...`);
            }
        });
    });
    
    // Fragman modalını kapat
    trailerClose.addEventListener('click', function() {
        closeTrailer();
    });
    
    // ESC tuşuna basıldığında fragman modalını kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && trailerModal.classList.contains('active')) {
            closeTrailer();
        }
    });
    
    // Fragman modalının dışına tıklandığında kapat
    trailerModal.addEventListener('click', function(e) {
        if (e.target === trailerModal) {
            closeTrailer();
        }
    });
}

// ===== 6. Fragmanı Aç =====
function openTrailer(url) {
    const trailerModal = document.querySelector('.trailer-modal');
    const trailerFrame = document.getElementById('trailerFrame');
    
    if (!trailerModal || !trailerFrame) {
        console.error('Fragman modalı için gerekli elementler bulunamadı.');
        return;
    }
    
    trailerFrame.src = url;
    trailerModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Sayfanın kaydırılmasını engelle
}

// ===== 7. Fragmanı Kapat =====
function closeTrailer() {
    const trailerModal = document.querySelector('.trailer-modal');
    const trailerFrame = document.getElementById('trailerFrame');
    
    if (!trailerModal || !trailerFrame) {
        console.error('Fragman modalı için gerekli elementler bulunamadı.');
        return;
    }
    
    trailerModal.classList.remove('active');
    setTimeout(() => {
        trailerFrame.src = '';
    }, 300);
    document.body.style.overflow = ''; // Sayfanın kaydırılmasını tekrar etkinleştir
}

// ===== 8. Filtre Butonları İşlevselliği =====
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Aktif butonu güncelle
            document.querySelector('.filter-btn.active').classList.remove('active');
            this.classList.add('active');
            
            // Filtre tipini al
            const filterType = this.textContent.trim().toLowerCase();
            console.log(`"${filterType}" filtresi uygulandı.`);
            
            // Burada gerçek filtreleme yapılabilir
            // Örneğin: filterContent(filterType);
        });
    });
}

// ===== 9. Sayfa Yüklendiğinde Tüm İşlevleri Başlat =====
document.addEventListener('DOMContentLoaded', function() {
    setupCategoriesMenu();
    setupSearchFunctionality();
    setupTrailerFunctionality();
    setupFilterButtons();
    
    console.log('PerdeArkası script.js başarıyla yüklendi.');
});

