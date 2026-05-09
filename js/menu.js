document.addEventListener('DOMContentLoaded', () => {

    // === 0. ПРИНУДИТЕЛЬНОЕ ПРОБУЖДЕНИЕ (Фикс черного экрана) ===
    document.body.style.opacity = '1';
    const introScreen = document.getElementById('screen-intro');
    if (introScreen) {
        introScreen.style.display = 'flex';
        introScreen.style.opacity = '1';
    }

    // === 1. ОПРЕДЕЛЕНИЕ ТЕКУЩЕГО ЯЗЫКА ===
    const currentLang = document.documentElement.lang === 'uk' ? 'uk' : 'ru';
    const book1Path = `${currentLang}/book1/html_0.html`;

    // === 2. ПЕРЕКЛЮЧАТЕЛИ ЯЗЫКОВ ===
    const btnLangUk = document.getElementById('btn-lang-uk');
    const btnLangRu = document.getElementById('btn-lang-ru');

    const changeLang = (targetFile) => {
        document.body.style.transition = 'opacity 0.4s';
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.replace(targetFile); }, 400);
    };

    if (btnLangUk) btnLangUk.addEventListener('click', () => changeLang('index-uk.html'));
    if (btnLangRu) btnLangRu.addEventListener('click', () => changeLang('index.html'));

    // === 3. ЛОГИКА ВОЗВРАТА ИЗ КНИГИ ===
    if (window.location.search.includes('skipIntro=true')) {
        if (introScreen) {
            introScreen.classList.remove('active');
            introScreen.style.display = 'none';
        }
        const menu = document.getElementById('screen-menu');
        if (menu) {
            menu.classList.add('active');
            menu.style.display = 'flex';
            setTimeout(() => { menu.style.opacity = '1'; }, 50);
        }
    }

    // Функция переключения экранов
    function switchScreen(fromId, toId) {
        const from = document.getElementById(fromId);
        const to = document.getElementById(toId);
        if (!from || !to) return;
        
        from.style.opacity = '0';
        setTimeout(() => {
            from.classList.remove('active');
            from.style.display = 'none'; // Надежно прячем старый
            
            to.style.display = 'flex';   // Надежно показываем новый
            to.classList.add('active');
            setTimeout(() => { to.style.opacity = '1'; }, 50);
        }, 1000);
    }

    // === 4. ЭФФЕКТ ПОГРУЖЕНИЯ ===
    const btnDive = document.getElementById('btn-dive');
    if (btnDive) {
        btnDive.addEventListener('click', () => {
            const loading = document.getElementById('screen-loading');
            if (!introScreen || !loading) return;

            loading.style.transition = 'none'; 
            loading.classList.add('active');
            loading.style.display = 'flex';
            loading.style.opacity = '1';

            startGlitchEffect();

            introScreen.classList.add('diving-through');
            setTimeout(() => {
                introScreen.classList.remove('active', 'diving-through');
                introScreen.style.display = 'none';
                loading.style.transition = 'opacity 1.5s ease-in-out';
            }, 1000);
        });
    }

    // Эффект загрузки (Имена + переход)
function startGlitchEffect() {
        // Списки імен для обох мов
        const namesRu = ["Джессика", "Фрэнсис", "Альба", "Кристиан", "Джон", "Вероника", "Диана", "Марго", "Стефан", "Эллис", "Алиса", "Элиза", "Аарон"];
        const namesUk = ["Джессіка", "Френсіс", "Альба", "Крістіан", "Джон", "Вероніка", "Діана", "Марго", "Стефан", "Елліс", "Аліса", "Еліза", "Аарон"];

        // Вибираємо потрібний список (currentLang визначена вище в скрипті)
        const names = currentLang === 'uk' ? namesUk : namesRu;

        const loading = document.getElementById('screen-loading');
        if (!loading) return;
        
        let interval = setInterval(() => {
            const span = document.createElement('span');
            span.classList.add('floating-name');
            span.innerText = names[Math.floor(Math.random() * names.length)];
            span.style.left = Math.random() * 100 + '%';
            span.style.top = Math.random() * 100 + '%';
            span.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
            const duration = Math.random() * 2 + 2.5;
            span.style.animationDuration = duration + 's';
            
            // ВОЗВРАЩЕНО: Твоя двойная страховка удаления
            span.addEventListener('animationend', () => span.remove());
            loading.appendChild(span);
            setTimeout(() => span.remove(), duration * 1000);
        }, 80);

        setTimeout(() => {
            clearInterval(interval);
            setTimeout(() => {
                switchScreen('screen-loading', 'screen-menu');
            }, 2500); 
        }, 3000);
    }

    // === 5. ПРЕДЗАГРУЗКА И ПЕРЕХОД ===
    setTimeout(() => {
        const prefetchHtml0 = document.createElement('link');
        prefetchHtml0.rel = 'prefetch';
        prefetchHtml0.href = book1Path;
        document.head.appendChild(prefetchHtml0);
    }, 2000); 

    const book1 = document.getElementById('book-1');
    if (book1) {
        book1.addEventListener('click', () => {
            const menu = document.getElementById('screen-menu');
            menu.style.opacity = '0'; 
            setTimeout(() => { window.location.href = book1Path; }, 1000); 
        });
    }

    // === 6. МОДАЛЬНОЕ ОКНО "ПРИМЕЧАНИЕ" ===
    const btnAuthor = document.getElementById('open-note');
    const btnCloseNote = document.getElementById('close-note');
    const noteOverlay = document.getElementById('note-overlay');

    if (btnAuthor && noteOverlay) {
        btnAuthor.addEventListener('click', () => {
            noteOverlay.style.display = 'flex';
            setTimeout(() => noteOverlay.classList.add('active'), 10);
        });
    }

    if (btnCloseNote && noteOverlay) {
        btnCloseNote.addEventListener('click', () => {
            noteOverlay.classList.remove('active');
            setTimeout(() => noteOverlay.style.display = 'none', 600);
        });
    }

    // Закрытие по клику на пустое место
    window.addEventListener('click', (e) => {
        if (e.target === noteOverlay) {
            noteOverlay.classList.remove('active');
            setTimeout(() => noteOverlay.style.display = 'none', 600);
        }
    });

    // === 7. КОПИРОВАНИЕ КОНТАКТОВ ===
    const copyElements = document.querySelectorAll('.js-copy-text');

    copyElements.forEach(element => {
        element.addEventListener('click', function() {
            const textToCopy = this.innerText;
            const tooltip = this.parentElement.querySelector('.js-tooltip');

            navigator.clipboard.writeText(textToCopy).then(() => {
                if (tooltip) {
                    tooltip.classList.add('show'); 
                    setTimeout(() => {
                        tooltip.classList.remove('show');
                    }, 2500);
                }
            // ВОЗВРАЩЕНО: Твой обработчик ошибок
            }).catch(err => {
                console.error('Не удалось скопировать: ', err);
            });
        });
    });

});