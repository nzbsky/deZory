/**
 * De'Зорі — script.js
 * Vanilla JS: зірки, паралакс, скрол-анімації, календар бронювання, модальна форма
 */

/* ============================================================
   CONFIG — підмінити/розширити для реального бекенду
============================================================ */

// Ціни за ніч (гривні)
const PRICE_WEEKDAY = 2800; // понеділок–четвер
const PRICE_WEEKEND = 3500; // п'ятниця–неділя

/**
 * Зайняті дати (формат: 'YYYY-MM-DD').
 * Щоб підключити бекенд — замінити цей масив на fetch('/api/busy-dates')
 * і передати результат у функцію renderCalendar(year, month, busyDates).
 */
const BUSY_DATES = [
  '2026-06-22','2026-06-23','2026-06-24',
  '2026-06-28','2026-06-29',
  '2026-07-04','2026-07-05','2026-07-06','2026-07-07','2026-07-08',
  '2026-07-11','2026-07-12',
  '2026-07-18','2026-07-19','2026-07-20',
  '2026-07-25','2026-07-26','2026-07-27',
  '2026-08-01','2026-08-02','2026-08-03',
  '2026-08-08','2026-08-09','2026-08-10',
  '2026-08-15','2026-08-16','2026-08-17','2026-08-18',
  '2026-08-22','2026-08-23','2026-08-24',
];

const BUSY_SET = new Set(BUSY_DATES);

/* ============================================================
   ДОПОМІЖНІ ФУНКЦІЇ
============================================================ */

/** Форматує Date як 'YYYY-MM-DD' */
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** Форматує Date як 'ДД МІСЯЦЬ РРРР' (українською) */
const UA_MONTHS = ['січня','лютого','березня','квітня','травня','червня',
                   'липня','серпня','вересня','жовтня','листопада','грудня'];
function formatDateUA(d) {
  return `${d.getDate()} ${UA_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Назва місяця у називному відмінку */
const UA_MONTHS_NOM = ['Січень','Лютий','Березень','Квітень','Травень','Червень',
                        'Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];

/** Повертає true, якщо день — вихідний (пт, сб, нд) */
function isWeekend(d) {
  const dow = d.getDay(); // 0=нд, 5=пт, 6=сб
  return dow === 0 || dow === 5 || dow === 6;
}

/** Рахує суму за діапазон дат [checkIn, checkOut) */
function calcTotal(checkIn, checkOut) {
  let total = 0;
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    total += isWeekend(cur) ? PRICE_WEEKEND : PRICE_WEEKDAY;
    cur.setDate(cur.getDate() + 1);
  }
  return total;
}

/** Форматує суму з роздільником тисяч */
function fmtMoney(n) {
  return n.toLocaleString('uk-UA') + ' грн';
}

/* ============================================================
   ЗОРЯНЕ НЕБО (canvas)
============================================================ */
(function initStars() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawStars();
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const count = Math.floor((canvas.width * canvas.height) / 1800);

    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      // Зірки переважно у верхній 2/3 екрану
      const y = Math.random() * canvas.height * 0.75;
      const r = Math.random() * 1.2 + 0.2;
      const alpha = Math.random() * 0.7 + 0.3;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,245,240,${alpha})`;
      ctx.fill();
    }
  }

  // Мерехтіння зірок
  function twinkle() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) {
        const delta = (Math.random() - 0.5) * 20;
        data[i] = Math.max(60, Math.min(230, data[i] + delta));
      }
    }
    ctx.putImageData(imageData, 0, 0);
    setTimeout(twinkle, 120 + Math.random() * 300);
  }

  resize();
  window.addEventListener('resize', resize);
  setTimeout(twinkle, 1000);
})();

/* ============================================================
   ПАРАЛАКС HERO при скролі
============================================================ */
(function initParallax() {
  const moon      = document.querySelector('.moon');
  const mountains = document.querySelector('.mountains');
  const hero      = document.querySelector('.hero');

  if (!moon || !mountains || !hero) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroH   = hero.offsetHeight;
    if (scrollY > heroH) return;

    const ratio = scrollY / heroH;
    moon.style.transform      = `translateY(${scrollY * 0.25}px)`;
    mountains.style.transform = `translateY(${scrollY * 0.15}px)`;
  }, { passive: true });
})();

/* ============================================================
   NAVIGATION: scroll-class + burger
============================================================ */
(function initNav() {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('navBurger');
  const links   = document.getElementById('navLinks');

  // Клас .scrolled при прокрутці
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Burger toggle
  burger.addEventListener('click', () => {
    links.classList.toggle('open');
    burger.classList.toggle('open');
  });

  // Закрити при кліку на пункт меню
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('open');
    });
  });

  // Закрити при кліку поза меню
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) {
      links.classList.remove('open');
      burger.classList.remove('open');
    }
  });
})();

/* ============================================================
   SCROLL REVEAL ANIMATIONS
============================================================ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Cascade delay для груп
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let idx = 0;
        siblings.forEach((s, si) => { if (s === entry.target) idx = si; });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   CALENDAR — інтерактивний календар бронювання
============================================================ */
(function initCalendar() {
  // --- State ---
  const today    = new Date();
  today.setHours(0,0,0,0);
  let viewYear   = today.getFullYear();
  let viewMonth  = today.getMonth();
  let checkIn    = null;  // Date | null
  let checkOut   = null;  // Date | null
  let selectStep = 0;     // 0=нічого, 1=заїзд вибрано, 2=повний діапазон

  // --- DOM refs ---
  const calDays      = document.getElementById('calDays');
  const calMonthYear = document.getElementById('calMonthYear');
  const btnPrev      = document.getElementById('prevMonth');
  const btnNext      = document.getElementById('nextMonth');
  const btnBook      = document.getElementById('btnBook');
  const btnClear     = document.getElementById('btnClear');
  const sumCheckIn   = document.getElementById('sumCheckIn');
  const sumCheckOut  = document.getElementById('sumCheckOut');
  const sumNights    = document.getElementById('sumNights');
  const sumTotal     = document.getElementById('sumTotal');
  const sumNote      = document.getElementById('sumNote');

  // --- Перевірка, чи є зайняті дати між двома датами ---
  function hasBusyBetween(from, to) {
    const cur = new Date(from);
    cur.setDate(cur.getDate() + 1); // від наступного дня після заїзду
    while (cur < to) {
      if (BUSY_SET.has(dateKey(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  // --- Рендер місяця ---
  function renderCalendar(year, month) {
    calMonthYear.textContent = `${UA_MONTHS_NOM[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    // Понеділок = 0, ... Неділя = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    calDays.innerHTML = '';

    // Порожні клітинки на початку
    for (let i = 0; i < startDow; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      calDays.appendChild(empty);
    }

    // Дні місяця
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date  = new Date(year, month, d);
      const key   = dateKey(date);
      const cell  = document.createElement('div');
      cell.textContent = d;

      // Визначення класів
      const isPast    = date < today;
      const isBusy    = BUSY_SET.has(key);
      const isWknd    = isWeekend(date);
      const isCheckIn = checkIn  && dateKey(checkIn)  === key;
      const isCheckOt = checkOut && dateKey(checkOut) === key;
      const isRange   = checkIn && checkOut && date > checkIn && date < checkOut;

      const classes = ['cal-day'];
      if (isPast)     classes.push('past');
      else if (isBusy) classes.push('busy');
      else             classes.push('free');
      if (isWknd)     classes.push('weekend');
      if (isCheckIn)  classes.push('check-in');
      if (isCheckOt)  classes.push('check-out');
      if (isRange)    classes.push('in-range');

      cell.className = classes.join(' ');

      // Клік
      if (!isPast && !isBusy) {
        cell.addEventListener('click', () => handleDayClick(date));
      }

      calDays.appendChild(cell);
    }
  }

  // --- Обробка кліку по дню ---
  function handleDayClick(date) {
    if (selectStep === 0) {
      // Перший клік — вибираємо дату заїзду
      checkIn  = date;
      checkOut = null;
      selectStep = 1;
    } else if (selectStep === 1) {
      // Другий клік
      if (date <= checkIn) {
        // Якщо клік раніше/рівно checkIn — скидаємо і починаємо знову
        checkIn  = date;
        checkOut = null;
        selectStep = 1;
      } else if (hasBusyBetween(checkIn, date)) {
        // Між датами є зайняті — показати попередження
        showNote('⚠ Між вибраними датами є зайняті ночі. Оберіть інший діапазон.');
        checkOut = null;
        selectStep = 1;
      } else {
        checkOut   = date;
        selectStep = 2;
        updateSummary();
      }
    } else {
      // Третій клік — починаємо новий вибір
      checkIn  = date;
      checkOut = null;
      selectStep = 1;
      clearSummary();
    }

    renderCalendar(viewYear, viewMonth);
    if (selectStep === 1) {
      sumCheckIn.textContent  = formatDateUA(checkIn);
      sumCheckOut.textContent = '—';
      sumNights.textContent   = '—';
      sumTotal.textContent    = '—';
    }
  }

  // --- Оновлення підсумку ---
  function updateSummary() {
    if (!checkIn || !checkOut) return;

    const nights = Math.round((checkOut - checkIn) / 86400000);
    const total  = calcTotal(checkIn, checkOut);

    sumCheckIn.textContent  = formatDateUA(checkIn);
    sumCheckOut.textContent = formatDateUA(checkOut);
    sumNights.textContent   = `${nights} ${nightWord(nights)}`;
    sumTotal.textContent    = fmtMoney(total);

    // Пояснення про різні ціни
    const hasWknd = [];
    const cur = new Date(checkIn);
    while (cur < checkOut) {
      if (isWeekend(cur)) { hasWknd.push(1); break; }
      cur.setDate(cur.getDate() + 1);
    }
    const hasWkday = nights > hasWknd.length;
    if (hasWknd.length && hasWkday) {
      showNote(`Будні: ${fmtMoney(PRICE_WEEKDAY)}/ніч · Вихідні: ${fmtMoney(PRICE_WEEKEND)}/ніч`);
    } else {
      showNote('');
    }

    btnBook.disabled = false;
  }

  function clearSummary() {
    sumCheckIn.textContent  = '—';
    sumCheckOut.textContent = '—';
    sumNights.textContent   = '—';
    sumTotal.textContent    = '—';
    showNote('');
    btnBook.disabled = true;
  }

  function showNote(text) {
    sumNote.textContent = text;
  }

  function nightWord(n) {
    if (n % 10 === 1 && n % 100 !== 11) return 'ніч';
    if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'ночі';
    return 'ночей';
  }

  // --- Навігація по місяцях ---
  btnPrev.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar(viewYear, viewMonth);
  });

  btnNext.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar(viewYear, viewMonth);
  });

  // --- Скинути вибір ---
  btnClear.addEventListener('click', () => {
    checkIn    = null;
    checkOut   = null;
    selectStep = 0;
    clearSummary();
    renderCalendar(viewYear, viewMonth);
  });

  // --- Відкрити модальне вікно бронювання ---
  const modalOverlay = document.getElementById('modalOverlay');
  const modalDates   = document.getElementById('modalDates');

  btnBook.addEventListener('click', () => {
    if (!checkIn || !checkOut) return;
    const nights = Math.round((checkOut - checkIn) / 86400000);
    const total  = calcTotal(checkIn, checkOut);
    modalDates.textContent =
      `${formatDateUA(checkIn)} — ${formatDateUA(checkOut)} · ${nights} ${nightWord(nights)} · ${fmtMoney(total)}`;
    openModal();
  });

  // --- Перший рендер ---
  renderCalendar(viewYear, viewMonth);
})();

/* ============================================================
   MODAL
============================================================ */
(function initModal() {
  const overlay     = document.getElementById('modalOverlay');
  const btnClose    = document.getElementById('modalClose');
  const form        = document.getElementById('bookingForm');
  const successDiv  = document.getElementById('formSuccess');
  const btnCloseOk  = document.getElementById('btnCloseSuccess');

  window.openModal = function() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    form.hidden        = false;
    successDiv.hidden  = true;
    form.reset();
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  };

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  btnClose.addEventListener('click', closeModal);
  btnCloseOk.addEventListener('click', closeModal);

  // Закрити при кліку на тло
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  // Клавіша Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Відправка форми (демо — без реального бекенду)
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const nameField  = document.getElementById('guestName');
    const phoneField = document.getElementById('guestPhone');

    [nameField, phoneField].forEach(f => f.classList.remove('error'));

    if (!nameField.value.trim()) {
      nameField.classList.add('error');
      valid = false;
    }
    if (!phoneField.value.trim()) {
      phoneField.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    /*
     * ТУТ підключити реальний бекенд:
     * fetch('/api/booking', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ name, phone, comment, checkIn, checkOut })
     * }).then(...)
     */

    // Демо: показати success
    form.hidden       = true;
    successDiv.hidden = false;
  });
})();
