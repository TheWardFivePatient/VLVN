document.addEventListener('DOMContentLoaded', () => {
    // === 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
    const fileSequence = ['html_0.html', 'html_1.html', 'html_2.html', 'html_3.html', 'html_4.html'];
    let particlesInterval;
    let currentPageIndex = 0;
    let pages = document.querySelectorAll('.page');
    // === УМНЫЙ ДЕТЕКТОР СКРОЛЛА (Защита от улетания страниц) ===
function checkPageScrolls() {
    pages.forEach(page => {
        // Сравниваем реальную высоту текста с видимым окном
        // +2px — это микро-погрешность, чтобы браузер не сомневался
        if (page.scrollHeight > page.clientHeight + 2) {
            page.classList.add('flat-turn'); // Текста много: включаем плавное растворение
        } else {
            page.classList.remove('flat-turn'); // Текста мало: возвращаем 3D-перелистывание
        }
    });
}

// Запускаем проверку при первой загрузке книги
setTimeout(checkPageScrolls, 100);
    const theme = document.getElementById('audio-hotline');

    const currentPath = window.location.pathname;
    let currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'html_0.html';
    const urlParams = new URLSearchParams(window.location.search);
    let startPage = parseInt(urlParams.get('page')) || 0;

    // Проверяем, есть ли смещение у текущего файла
    const offset = parseInt(document.body.getAttribute('data-offset')) || 0;

// Если переданный номер страницы больше или равен смещению, вычитаем его.
    // ИСКЛЮЧЕНИЕ: 99 — это системный код для "открыть последнюю страницу" при листании назад.
    if (startPage !== 99 && startPage >= offset) {
        startPage = startPage - offset;
    }

let touchStartX = 0, touchStartY = 0;
let touchEndX = 0, touchEndY = 0;

// =========================================================
// === ИДЕАЛЬНАЯ КАРУСЕЛЬ ФОНОВ И ТЕМ (ПАЦИЕНТ / ПСИХИАТР) ===
// =========================================================

// 1. Складываем фоны по массивам (с правильными префиксами для CSS)
const patientThemes = ['theme-patient', 'theme-patient-raven'];
const doctorThemes = ['theme-doctor', 'theme-doctor-ink'];

// 2. Общий список для зачистки старых следов
const allThemes = [...patientThemes, ...doctorThemes];

// 3. Находим кнопки в меню
const btnPatient = document.getElementById('theme-patient');
const btnDoctor = document.getElementById('theme-doctor');

// 4. Главный мотор переключения
function switchTheme(newTheme) {
    // Безпощадно счищаем все старые классы тем с body
    document.body.classList.remove(...allThemes);

    // Надеваем новый фон
    document.body.classList.add(newTheme);

    // Записываем в память, чтобы при обновлении страницы фон остался
    localStorage.setItem('activeSiteTheme', newTheme);

    // Переключаем активное состояние (золотую или белую подсветку) на кнопках
    if (btnPatient && btnDoctor) {
        btnPatient.classList.remove('active');
        btnDoctor.classList.remove('active');

        // Если новая тема из списка Пациента — подсвечиваем его кнопку
        if (patientThemes.includes(newTheme)) {
            btnPatient.classList.add('active');
        }
        // Если из списка Психиатра — подсвечиваем его
        if (doctorThemes.includes(newTheme)) {
            btnDoctor.classList.add('active');
        }
    }
}

// 5. Логика клика: ПАЦИЕНТ (Карусель)
if (btnPatient) {
    btnPatient.addEventListener('click', () => {
        // Ищем, какой фон пациента сейчас включен
        let currentTheme = patientThemes.find(t => document.body.classList.contains(t));

        let nextIndex = 0; // Если пациент не был активен, начнем с его первой (базовой) темы
        if (currentTheme) {
            // Если мы уже на теме пациента, вычисляем следующую по кругу
            nextIndex = (patientThemes.indexOf(currentTheme) + 1) % patientThemes.length;
        }

        switchTheme(patientThemes[nextIndex]);
        
        // Если у тебя есть функция звука, вызываем её
        if (typeof playSound === 'function') {
            playSound('audio-click', 0.4);
        }
    });
}

// 6. Логика клика: ПСИХИАТР (Карусель)
if (btnDoctor) {
    btnDoctor.addEventListener('click', () => {
        // Ищем, какой фон доктора сейчас включен
        let currentTheme = doctorThemes.find(t => document.body.classList.contains(t));

        let nextIndex = 0; // Если доктор не был активен, начнем с его первой темы
        if (currentTheme) {
            // Вычисляем следующую по кругу
            nextIndex = (doctorThemes.indexOf(currentTheme) + 1) % doctorThemes.length;
        }

        switchTheme(doctorThemes[nextIndex]);
        
        if (typeof playSound === 'function') {
            playSound('audio-click', 0.4);
        }
    });
}

// 7. Восстанавливаем фон при загрузке страницы
const activeSavedTheme = localStorage.getItem('activeSiteTheme') || 'theme-patient';
switchTheme(activeSavedTheme);

    // === ПРЕДЗАГРУЗКА РЕСУРСОВ ===
    const assetsToPreload = [
    '../../audio/kviboruk.mp3', 
    '../../audio/pr.mp3'
    ];
    
    // === 2. ЗВУК И ЭФФЕКТЫ ===
    function playSound(id, volume = 0.5) {
        const sound = document.getElementById(id);
        if (sound) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(() => {}); 
        }
    }

        function preloadAssets(list) {
        list.forEach(url => {
            if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.webp')) {
                const img = new Image();
                img.src = url;
            } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
                const audio = new Audio();
                audio.src = url;
            }
        });
    }

        function fadeAudioOut(audioElement) {
        if (!audioElement || audioElement.paused || audioElement.volume === 0) return;
        
        // Предохранитель: если звук уже затухает, убиваем старый таймер
        if (audioElement.fadeInterval) clearInterval(audioElement.fadeInterval);
        
        audioElement.fadeInterval = setInterval(() => {
            // Проверка на точность, чтобы не уйти в отрицательные значения
            if (audioElement.volume > 0.05) {
                // Из-за особенностей математики JS с дробями, лучше так:
                audioElement.volume = Math.max(0, audioElement.volume - 0.05);
            } else {
                audioElement.volume = 0;
                audioElement.pause();
                clearInterval(audioElement.fadeInterval);
            }
        }, 100);
    }

    // === 3. БЛЁСТКИ ===
    function startParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;
        particlesInterval = setInterval(() => {
            const particle = document.createElement('div');
            particle.classList.add('gold-particle');
            const size = Math.random() * 4 + 2 + 'px';
            particle.style.width = size;
            particle.style.height = size;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.bottom = '-10px';
            const duration = Math.random() * 10 + 10 + 's';
            particle.style.animationDuration = duration;
            container.appendChild(particle);
            setTimeout(() => particle.remove(), parseFloat(duration) * 1000);
        }, 700);
    }

    function stopParticles() {
        if (particlesInterval) clearInterval(particlesInterval);
        const container = document.getElementById('particles-container');
        if (container) container.innerHTML = '';
    }

    // === 4. ЛОГИКА СТРАНИЦ И СОХРАНЕНИЕ ПРОГРЕССА ===
  function goToPage(index, animate = true) {
if (index < 0) {
        let currentFileIndex = fileSequence.indexOf(currentFile);
        if (currentFileIndex > 0) {
            transitionToFile(fileSequence[currentFileIndex - 1], 99);
        }
        return;
    }

    if (index >= pages.length) {
        let currentFileIndex = fileSequence.indexOf(currentFile);
        if (currentFileIndex < fileSequence.length - 1) {
            transitionToFile(fileSequence[currentFileIndex + 1], 0);
        }
        return;
    }
        
    if (animate && index !== currentPageIndex) {
    playSound('audio-page-flip', 0.3);
    }
        
        pages.forEach((page, i) => {
            page.classList.remove('active', 'flipped');
            if (i < index) page.classList.add('flipped');
        });
        
        if (pages[index]) pages[index].classList.add('active');
        currentPageIndex = index;
        
// --- СОХРАНЕНИЕ В LOCALSTORAGE ---
const globalOffset = parseInt(document.body.getAttribute('data-offset') || 0);
localStorage.setItem('jessica_diary_last_file', currentFile);
// Сохраняем абсолютный номер (индекс страницы + смещение файла)
localStorage.setItem('jessica_diary_last_page', index + globalOffset);
        // ---------------------------------
        
        const offset = parseInt(document.body.getAttribute('data-offset') || 0);
        const counter = document.getElementById('page-counter');
        if (counter) {
            counter.innerText = `-${index + 1 + offset}-`;
        }

        if (currentFile === 'html_0.html' && index >= 0) fadeAudioOut(theme);

        if (typeof updateSidebarHighlight === 'function') {
            updateSidebarHighlight(index);
        }
    }

    // === 5. УПРАВЛЕНИЕ ЭКРАНАМИ ===
    function showContent(instant = false) {
        const cover = document.getElementById('screen-cover');
        const content = document.getElementById('screen-content');
        if (!content) return;

        stopParticles();

        if (cover && cover.classList.contains('active')) {
            if (instant) {
                cover.classList.remove('active');
                cover.style.display = 'none';
                content.classList.add('active');
                content.style.opacity = '1';

resizeBook(); // <--- ДОБАВИТЬ СЮДА
            } else {
                cover.style.transition = 'transform 1.5s cubic-bezier(0.645, 0.045, 0.355, 1), opacity 1s ease';
                cover.style.transformOrigin = 'left center';
                cover.style.transform = 'perspective(2000px) rotateY(-100deg) scale(1.1)';
                cover.style.opacity = '0';
                
                setTimeout(() => {
                    cover.classList.remove('active');
                    cover.style.display = 'none';
                    content.classList.add('active');
resizeBook();
                    setTimeout(() => { content.style.opacity = '1'; }, 50);
                }, 1000);
            }
        } else {
            content.classList.add('active');
            content.style.opacity = '1';
resizeBook();
        }
    }

// === ФИНАЛЬНОЕ И ТОЧНОЕ МАСШТАБИРОВАНИЕ (Вариант Б: через rem) ===
function resizeBook() {
    const viewport = document.querySelector('.book-viewport');
    const book = document.querySelector('.art-book-container');
    if (!viewport || !book) return;

    if (window.innerWidth <= 1024) {
        document.documentElement.style.fontSize = ''; 
        book.style.width = '100%';
        book.style.height = '100%';
        book.style.position = 'relative';
        book.style.left = '0';
        book.style.transform = 'none';
        return; 
    }

    const baseWidth = 830;
    const baseHeight = 950;

    book.style.position = 'absolute';
    book.style.top = '0'; 
    book.style.left = '50%'; 
    book.style.width = `${baseWidth / 16}rem`;
    book.style.height = `${baseHeight / 16}rem`;
    book.style.transformOrigin = 'top center';
    book.style.transform = `translateX(-50%)`;
}

// === ДЕБАУНС ДЛЯ ИЗМЕНЕНИЯ РАЗМЕРА ЭКРАНА ===
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    // Ждем 150мс после окончания поворота/ресайза, и только потом пересчитываем макет
    resizeTimer = setTimeout(() => {
        resizeBook();
        checkPageScrolls(); // <--- ДОБАВЛЯЕМ ЭТУ СТРОЧКУ
    }, 150); 
});

// === 6 и 7. ЛОГИКА САЙДБАРА, АККОРДЕОНА, МАРШРУТИЗАЦИИ И ЗОН НАВИГАЦИИ ===
    function attachDynamicEvents() {
        // Аккордеон
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.onclick = function(e) {
                if(e.target.hasAttribute('data-target')) return; 

                const parentItem = this.parentElement; // Текущий <li>
                const wasActive = parentItem.classList.contains('active');
                const siblings = parentItem.parentElement.children;
                
                for (let sibling of siblings) {
                    if (sibling !== parentItem) {
                        sibling.classList.remove('active');
                    }
                }

                parentItem.classList.toggle('active', !wasActive);
            };
        });

        // Ссылки меню
        document.querySelectorAll('.submenu-list li[data-target]').forEach(link => {
            link.onclick = function(e) {
                e.stopPropagation();
                
                const targetFile = this.getAttribute('data-file');
                const targetPage = parseInt(this.getAttribute('data-target'));
                
                if (!targetFile || targetFile === currentFile) {
                    if (currentFile === 'html_0.html') showContent(false);
                    
                    // Вычисляем локальную страницу, вычитая offset
                    const currentOffset = parseInt(document.body.getAttribute('data-offset')) || 0;
                    let localPage = targetPage;
                    if (localPage >= currentOffset) {
                        localPage = localPage - currentOffset;
                    }
                    
                    goToPage(localPage);
                    
                    if (window.innerWidth <= 1024) {
                        document.querySelector('.sidebar')?.classList.remove('mobile-open');
                        document.getElementById('mobile-menu-btn')?.classList.remove('active');
                    }
                } else {
                    // Закрываем мобильное меню при переходе на новую главу
                    if (window.innerWidth <= 1024) {
                        document.querySelector('.sidebar')?.classList.remove('mobile-open');
                        document.getElementById('mobile-menu-btn')?.classList.remove('active');
                    }
                    
                    // Плавно подгружаем новый файл без потери Fullscreen
                    transitionToFile(targetFile, targetPage);
                }
            };
        });
     }
    // Инициализируем события при первой загрузке
    attachDynamicEvents();

// === 8. ИНИЦИАЛИЗАЦИЯ И ЗАПУСК (ЧТЕНИЕ ПРОГРЕССА) ===
    const btnTurnPage = document.getElementById('btn-turn-page');
    if (btnTurnPage) {
        btnTurnPage.addEventListener('click', () => {
            playSound('audio-cover-flip', 0.8);
            if (theme) fadeAudioOut(theme);

            const savedFile = localStorage.getItem('jessica_diary_last_file');
            const savedPage = localStorage.getItem('jessica_diary_last_page');

            if (savedFile && savedPage !== null && (savedFile !== 'html_0.html' || savedPage !== "0")) {
                   if (savedFile === currentFile) {
                   showContent(false);
                   const currentOffset = parseInt(document.body.getAttribute('data-offset') || 0);
                   goToPage(parseInt(savedPage) - currentOffset); // Вычитаем смещение
                } else {
                    document.body.style.transition = 'opacity 0.8s ease';
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                        window.location.href = `${savedFile}?page=${savedPage}`;
                    }, 1200);
                }
            } else {
                showContent(false);
                goToPage(0); 
            }
        });
    }

// === 9. ГЛОБАЛЬНАЯ НАВИГАЦИЯ (КЛИКИ, СВАЙПЫ, КЛАВИАТУРА) ===

let isAnimating = false; // Блокировка от двойных нажатий

function isGalleryClosed() {
    const modal = document.getElementById('gallery-modal');
    return !modal || modal.style.display === 'none' || modal.style.display === '';
}

const zoneNext = document.getElementById('zone-next');
const zonePrev = document.getElementById('zone-prev');

// Клик по ПРАВОЙ стороне (идем вперед) -> страница уезжает ВЛЕВО
if (zoneNext) {
    zoneNext.addEventListener('click', () => {
        if (!isGalleryClosed() || isAnimating) return; // Проверяем замок
        if (window.innerWidth <= 1024) changePageMobile('next');
        else goToPage(currentPageIndex + 1);
    });
}

// Клик по ЛЕВОЙ стороне (идем назад) -> страница уезжает ВПРАВО
if (zonePrev) {
    zonePrev.addEventListener('click', () => {
        if (!isGalleryClosed() || isAnimating) return; // Проверяем замок
        if (window.innerWidth <= 1024) changePageMobile('prev');
        else goToPage(currentPageIndex - 1);
    });
}

// Управление клавиатурой
document.addEventListener('keydown', (e) => {
    if (!isGalleryClosed() || isAnimating) return; // Проверяем замок
    if (e.key === 'ArrowRight' && zoneNext) zoneNext.click();
    if (e.key === 'ArrowLeft' && zonePrev) zonePrev.click();
});

// Свайпы
document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
    if (!isGalleryClosed() || window.innerWidth > 1024 || isAnimating) return; // Проверяем замок
    
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > 100 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) changePageMobile('next');
        else changePageMobile('prev');
    }
}, { passive: true });

// === ФУНКЦИЯ МОБИЛЬНОГО ПЕРЕЛИСТЫВАНИЯ ===
function changePageMobile(direction) {
    if (isAnimating) return; 
    
    const pages = document.querySelectorAll('.page');
    const currentPage = pages[currentPageIndex];
    let nextIdx = (direction === 'next') ? currentPageIndex + 1 : currentPageIndex - 1;

    if (nextIdx >= 0 && nextIdx < pages.length) {
        isAnimating = true; // ЗАКРЫВАЕМ ЗАМОК
        
        const nextPage = pages[nextIdx];

        [currentPage, nextPage].forEach(p => p.classList.remove('exit-left', 'exit-right', 'enter-left', 'enter-right', 'flipped'));

        if (direction === 'next') {
            currentPage.classList.add('exit-left');
            nextPage.classList.add('active', 'enter-right');
        } else {
            currentPage.classList.add('exit-right');
            nextPage.classList.add('active', 'enter-left');
        }

        currentPageIndex = nextIdx;
        const currentOffset = parseInt(document.body.getAttribute('data-offset') || 0);
        localStorage.setItem('jessica_diary_last_page', currentPageIndex + currentOffset);

        setTimeout(() => {
            currentPage.classList.remove('active', 'exit-left', 'exit-right');
            nextPage.classList.remove('enter-left', 'enter-right');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            const offset = parseInt(document.body.getAttribute('data-offset') || 0);
            const counter = document.getElementById('page-counter');
            if (counter) counter.innerText = `-${currentPageIndex + 1 + offset}-`;
            
            isAnimating = false; // ОТКРЫВАЕМ ЗАМОК (через 600мс)
        }, 600); 
        
    } else {
        const curFileIdx = fileSequence.indexOf(currentFile);
        if (direction === 'next' && curFileIdx < fileSequence.length - 1) {
            transitionToFile(fileSequence[curFileIdx + 1], 0);
        } else if (direction === 'prev' && curFileIdx > 0) {
            transitionToFile(fileSequence[curFileIdx - 1], 99);
        }
    }
}

// === АВТОМАТИЧЕСКОЕ СКРЫТИЕ ПОДСКАЗКИ ПРИ ПОЛНОМ ЭКРАНЕ ===
document.addEventListener('fullscreenchange', () => {
    // Укажите здесь ID или класс вашей подсказки
    const f11Hint = document.querySelector('.f11-hint') || document.querySelector('.fullscreen-prompt'); 
    
    if (document.fullscreenElement) {
        // Если вошли в полноэкранный режим — плавно прячем
        if (f11Hint) {
            f11Hint.style.transition = 'opacity 0.5s ease';
            f11Hint.style.opacity = '0';
            // Полностью убираем из потока через полсекунды
            setTimeout(() => { f11Hint.style.display = 'none'; }, 500);
        }
    } else {
        // Если вышли из полноэкранного режима — возвращаем
        if (f11Hint) {
            f11Hint.style.display = 'block';
            setTimeout(() => { f11Hint.style.opacity = '1'; }, 50);
        }
    }
});

// === 10. МОБИЛЬНОЕ УПРАВЛЕНИЕ САЙДБАРОМ (БЕЗ КОНФЛИКТОВ) ===
const sidebar = document.querySelector('.sidebar');
const bookViewport = document.querySelector('.book-viewport');

if (sidebar) {
    let sidebarTouchStartX = 0;
    let sidebarTouchEndX = 0;

    // 1. Фиксируем начало касания
    sidebar.addEventListener('touchstart', (e) => {
        // ОСТАНАВЛИВАЕМ всплытие, чтобы книга не начала считать этот свайп своим
        e.stopPropagation(); 
        sidebarTouchStartX = e.changedTouches[0].clientX;
    }, { passive: false }); // Изменили на false, чтобы stopPropagation работал четко

    // 2. Логика Свайпа (Открытие и Закрытие)
    sidebar.addEventListener('touchend', (e) => {
        e.stopPropagation(); // Глушим событие здесь тоже
        
        sidebarTouchEndX = e.changedTouches[0].clientX;
        const swipeDistance = sidebarTouchEndX - sidebarTouchStartX;

        // ОТКРЫТИЕ: Тянем язычок вправо
        if (swipeDistance > 5) {
            sidebar.classList.add('mobile-open');
        } 
        // ЗАКРЫТИЕ: Тянем влево
        else if (swipeDistance < -70) {
            sidebar.classList.remove('mobile-open');
        }
    }, { passive: false });

    // 3. Закрытие тапом по тексту (вьюпорту)
    if (bookViewport) {
        bookViewport.addEventListener('click', (e) => {
            if (sidebar.classList.contains('mobile-open')) {
                // Здесь stopPropagation не нужен, тап по тексту не листает страницы
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}

// === КНОПКИ ВОЗВРАТА И УПРАВЛЕНИЯ ===

// Кнопка возврата на главный лендинг
document.getElementById('btn-to-main-landing')?.addEventListener('click', function() {
    playSound('audio-book-close', 0.8);
    if (typeof theme !== 'undefined' && theme) fadeAudioOut(theme);
    
    const mainLanding = document.getElementById('screen-0'); 
    if (mainLanding) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
            screen.style.opacity = '0';
        });
        mainLanding.style.display = 'flex'; 
        setTimeout(() => { mainLanding.style.opacity = '1'; }, 50);
    } else {
        setTimeout(() => { window.location.href = '../../index.html'; }, 1000);
    }
    // Закрываем сайдбар при выходе (используем правильный класс)
    if (sidebar) sidebar.classList.remove('mobile-open');
});

// Кнопка "Назад в меню"
document.getElementById('btn-back-to-menu')?.addEventListener('click', () => {
    playSound('audio-book-close', 0.8);
    if (typeof theme !== 'undefined' && theme) fadeAudioOut(theme);
    setTimeout(() => { window.location.href = '../../index.html?skipIntro=true'; }, 1000);
});

// Фуллскрин
document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
});

// === ПЛАВНАЯ ГАЛЕРЕЯ ===
document.getElementById('open-gallery')?.addEventListener('click', () => {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.classList.add('active'); // Запускаем плавное появление
    }
});

// Закрытие по клику
document.addEventListener('click', function(event) {
    const modal = document.getElementById('gallery-modal');
    
    // Проверяем, открыта ли галерея (есть ли у нее класс active)
    if (!modal || !modal.classList.contains('active')) return;
    
    // Закрываем, если кликнули по кнопке "ЗАКРЫТЬ АРХИВ", по верхнему крестику (если он есть) или по пустому фону
    if (event.target.closest('#close-gallery-bottom') || 
        event.target.closest('#close-gallery') || 
        event.target === modal) {
        modal.classList.remove('active'); // Запускаем плавное исчезновение
    }
});

// Закрытие по кнопке Escape на клавиатуре (обновлено под плавность)
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
        const modal = document.getElementById('gallery-modal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active'); // Запускаем плавное исчезновение
        }
    }
});

// === 11. ФИНАЛЬНОЕ РЕШЕНИЕ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
if (urlParams.has('page') || currentFile !== 'html_0.html') {
    if (typeof showContent === 'function') showContent(true);
    // Используем уже вычисленный в начале файла startPage (с вычетом offset)
    if (startPage === 99 && typeof pages !== 'undefined') startPage = pages.length - 1;
    if (typeof goToPage === 'function') goToPage(startPage, false);
}

else {
    if (typeof startParticles === 'function') startParticles();
    if (typeof preloadAssets === 'function' && typeof assetsToPreload !== 'undefined') preloadAssets(assetsToPreload); 
    
    if (typeof theme !== 'undefined' && theme) {
        theme.volume = 0.6;
        theme.play().catch(() => {});
    }
}

// === 12. Запоминалка страниц ===
function updateSidebarHighlight(localIndex) {
    const offset = parseInt(document.body.getAttribute('data-offset') || 0);
    const absoluteTarget = localIndex + offset;
    const currentFile = window.location.pathname.split('/').pop() || 'html_0.html';

    // 1. Убираем старую подсветку
    document.querySelectorAll('.submenu-list li').forEach(li => {
        li.style.color = "";
        li.style.fontWeight = "";
    });

    // 2. Ищем пункт, который соответствует текущему файлу и странице
    const allLinks = Array.from(document.querySelectorAll('.submenu-list li[data-target]'));
    let targetLi = null;

    for (let li of allLinks) {
        const liFile = li.getAttribute('data-file');
        const liTarget = parseInt(li.getAttribute('data-target'));

        if (liFile === currentFile && liTarget <= absoluteTarget) {
            targetLi = li; // Запоминаем последний подходящий пункт (ближайшую дату)
        }
    }

    if (targetLi) {
        // Подсвечиваем
        targetLi.style.color = "var(--gold)";
        targetLi.style.fontWeight = "bold";

        // 3. РАСКРЫВАЕМ РОДИТЕЛЕЙ (Аккордеоны)
        
        // Сначала безжалостно закрываем абсолютно ВСЕ разделы:
        document.querySelectorAll('.accordion-item').forEach(el => {
            el.classList.remove('active');
        });

        // А затем раскрываем ТОЛЬКО ту ветку, где мы сейчас читаем:
        let parent = targetLi.closest('.accordion-item');
        while (parent) {
            parent.classList.add('active');
            // Идем выше к родителю родителя (например, от Главы к Разделу)
            parent = parent.parentElement.closest('.accordion-item');
        }
    }
}

// === ОПТИМИЗАЦИЯ ПАМЯТИ: УПРАВЛЕНИЕ ИСКРАМИ ===

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopParticles(); // Вкладка свернута — ставим на паузу
    } else {
        startParticles(); // Читатель вернулся — снова запускаем магию
    }
});

// === ФУНКЦИЯ ПЛАВНОГО ПЕРЕХОДА МЕЖДУ ФАЙЛАМИ ===
function transitionToFile(targetFileName, startPageIndex = 0) {
    document.body.classList.add('fade-out-site');
    const delay = (currentFile === 'html_0.html') ? 1200 : 800; 
    setTimeout(() => {
        window.location.href = `${targetFileName}?page=${startPageIndex}`;
    }, delay); 
}

// === УМНАЯ ПРЕДЗАГРУЗКА СЛЕДУЮЩЕЙ ГЛАВЫ ===
function preloadNextChapter() {
    const currentIndex = fileSequence.indexOf(currentFile);
    if (currentIndex !== -1 && currentIndex < fileSequence.length - 1) {
        const nextFile = fileSequence[currentIndex + 1];
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch'; 
        prefetchLink.href = nextFile;
        document.head.appendChild(prefetchLink);
    }
}

// Запускаем предзагрузку следующей главы через 3 секунды после открытия текущей, 
// чтобы не тормозить начальную загрузку страницы
setTimeout(preloadNextChapter, 3000);

});

// === ФУНКЦИЯ УПРАВЛЕНИЯ ПЛЕЕРАМИ (ГЛОБАЛЬНАЯ) ===
function stopOthers(current) {
    if (!current.open) {
        // Плеер закрылся: симулируем "ресайз" окна, чтобы скрипт пересчитал страницу и вернул 3D
        setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
        return;
    }

    // 1. Выключаем все остальные плееры
    document.querySelectorAll('.music-box').forEach(el => {
        if (el !== current) {
            el.open = false; 
            el.querySelectorAll('iframe').forEach(f => {
                f.src = ''; // Очистка звука и памяти
            });
        }
    });

    // 2. Активируем текущий плеер (ВАЖНО!)
    current.querySelectorAll('iframe').forEach(f => {
        const realSrc = f.getAttribute('data-src');
        if (realSrc && f.src !== realSrc) {
            f.src = realSrc; // Перекладываем ссылку из заначки в плеер
        }
    });

    // Плеер открылся: симулируем "ресайз", чтобы скрипт вырубил 3D, если страница стала длинной
    setTimeout(() => window.dispatchEvent(new Event('resize')), 250); 
}