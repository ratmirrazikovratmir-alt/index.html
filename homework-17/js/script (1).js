// ==========================================================================
// PixelForge — заявка на разработку
// ==========================================================================

// Вставьте сюда URL вашего развёрнутого Apps Script веб-приложения
// (Deploy -> New deployment -> Web app -> Execute as: Me -> Who has access: Anyone)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxt4xDighTbMlmjb3gNAlqRniZ553cVTG3_4G6E19iNSbcucPB4emo9L9coZgm5ZEgO/exec";

const form = document.getElementById("requestForm");
const submitBtn = document.getElementById("submitBtn");
const toastEl = document.getElementById("toast");

// --------------------------------------------------------------------------
// Утилиты показа/скрытия ошибок
// --------------------------------------------------------------------------
function showError(fieldName, message) {
  const input = form.elements[fieldName];
  const errorEl = document.getElementById(fieldName + "Error");
  if (errorEl) errorEl.textContent = message;
  if (input) input.closest(".field")?.classList.add("has-error");
}

function clearError(fieldName) {
  const input = form.elements[fieldName];
  const errorEl = document.getElementById(fieldName + "Error");
  if (errorEl) errorEl.textContent = "";
  if (input) input.closest(".field")?.classList.remove("has-error");
}

function clearAllErrors() {
  form.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
  form.querySelectorAll(".field").forEach((el) => el.classList.remove("has-error"));
}

// --------------------------------------------------------------------------
// Валидаторы отдельных полей. Каждый возвращает текст ошибки или "" (ок).
// --------------------------------------------------------------------------
const NAME_RE = /^[A-Za-zА-Яа-яЁёʼ' -]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

function validateName(value, label) {
  const v = value.trim();
  if (!v) return `Введите ${label}`;
  if (v.length < 2) return `Минимум 2 символа`;
  if (!NAME_RE.test(v)) return `Только буквы и пробелы`;
  return "";
}

function validateEmail(value) {
  const v = value.trim();
  if (!v) return "Введите email";
  if (!EMAIL_RE.test(v)) return "Некорректный формат email";
  return "";
}

function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  if (!value.trim()) return "Введите телефон";
  if (!digits.startsWith("998") || digits.length !== 12) {
    return "Телефон должен начинаться с +998 и содержать 12 цифр";
  }
  return "";
}

function validateSelect(value, label) {
  if (!value) return `Выберите ${label}`;
  return "";
}

function validateDescription(value) {
  const v = value.trim();
  if (!v) return "Опишите проект";
  if (v.length < 30) return `Минимум 30 символов (сейчас ${v.length})`;
  return "";
}

function validatePagesCount(value) {
  if (!value.trim()) return ""; // необязательное поле
  const n = Number(value);
  if (Number.isNaN(n) || n < 1 || n > 100) return "Число от 1 до 100";
  return "";
}

function validateWebsite(value) {
  if (!value.trim()) return ""; // необязательное поле
  if (!URL_RE.test(value.trim())) return "URL должен начинаться с http:// или https://";
  return "";
}

// --------------------------------------------------------------------------
// Полная проверка формы. Возвращает true, если все поля прошли валидацию.
// --------------------------------------------------------------------------
function validateForm() {
  clearAllErrors();
  let isValid = true;

  const checks = [
    ["firstName", validateName(form.firstName.value, "имя")],
    ["lastName", validateName(form.lastName.value, "фамилию")],
    ["email", validateEmail(form.email.value)],
    ["phone", validatePhone(form.phone.value)],
    ["service", validateSelect(form.service.value, "тип услуги")],
    ["budget", validateSelect(form.budget.value, "бюджет")],
    ["deadline", validateSelect(form.deadline.value, "срок")],
    ["description", validateDescription(form.description.value)],
    ["pagesCount", validatePagesCount(form.pagesCount.value)],
    ["website", validateWebsite(form.website.value)],
  ];

  for (const [field, message] of checks) {
    if (message) {
      showError(field, message);
      isValid = false;
    }
  }

  return isValid;
}

// Убираем ошибку с поля при исправлении (на вводе / изменении)
["firstName", "lastName", "email", "phone", "service", "budget", "deadline",
 "description", "pagesCount", "website"].forEach((name) => {
  const el = form.elements[name];
  if (!el) return;
  const evt = el.tagName === "SELECT" ? "change" : "input";
  el.addEventListener(evt, () => clearError(name));
});

// --------------------------------------------------------------------------
// Кнопка "Заполнить рандомно"
// --------------------------------------------------------------------------
const RANDOM_FIRST_NAMES = ["Алишер", "Дилноза", "Тимур", "Малика", "Жасур", "Севара", "Бахтиёр", "Нигора"];
const RANDOM_LAST_NAMES = ["Каримов", "Юсупова", "Рахимов", "Азизова", "Тошев", "Islomova", "Назаров", "Ergasheva"];
const RANDOM_COMPANIES = ["WeCraft Studio", "NovaTech", "Silk Road Group", "BrightLine LLC", "UrbanByte", ""];
const RANDOM_POSITIONS = ["CEO", "Marketing Manager", "Product Owner", "Founder", "COO", ""];
const RANDOM_DOMAINS = ["gmail.com", "wecraft.uz", "novatech.io", "outlook.com"];
const RANDOM_DESCRIPTIONS = [
  "Нужен многостраничный корпоративный сайт для IT-компании. Есть готовый Figma-макет, референсы в описании. Важна адаптивность и SEO-оптимизация.",
  "Хотим лендинг под запуск нового продукта с формой сбора заявок и интеграцией с CRM. Срок сжатый, дизайн — минималистичный.",
  "Требуется интернет-магазин на 200+ товаров с фильтрами, корзиной и онлайн-оплатой. Есть каталог, нужна помощь с UX.",
  "Планируем мобильное приложение для доставки еды: заказы, трекинг курьера, push-уведомления. Есть техническое задание.",
];
const RANDOM_WEBSITES = ["https://wecraft-old.uz", "https://novatech.io", "https://example.com", ""];
const RANDOM_SOURCES = ["Instagram", "Telegram", "Google", "Рекомендация друзей", "Другое"];
const RANDOM_CONTACT_METHODS = ["Telegram", "WhatsApp", "Email", "Телефон"];
const RANDOM_SERVICES = ["Лендинг", "Корпоративный сайт", "Интернет-магазин", "Веб-приложение", "Мобильное приложение", "Дизайн (лого/брендинг)"];
const RANDOM_BUDGETS = ["до 1000$", "1000-5000$", "5000-10000$", "10000-25000$", "свыше 25000$"];
const RANDOM_DEADLINES = ["до 2 недель", "1 месяц", "1-2 месяца", "3+ месяцев", "не срочно"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  const rest = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
  return `+998${rest}`;
}

function randomFutureDate() {
  const d = new Date();
  d.setDate(d.getDate() + 20 + Math.floor(Math.random() * 100));
  return d.toISOString().slice(0, 10);
}

document.getElementById("fillRandomBtn").addEventListener("click", () => {
  const first = pick(RANDOM_FIRST_NAMES);
  const last = pick(RANDOM_LAST_NAMES);

  form.firstName.value = first;
  form.lastName.value = last;
  form.email.value = `${first.toLowerCase()}.${last.toLowerCase()}@${pick(RANDOM_DOMAINS)}`
    .replace(/[^a-z0-9.@]/gi, "");
  form.phone.value = randomPhone();
  form.company.value = pick(RANDOM_COMPANIES);
  form.position.value = pick(RANDOM_POSITIONS);

  form.service.value = pick(RANDOM_SERVICES);
  form.budget.value = pick(RANDOM_BUDGETS);
  form.deadline.value = pick(RANDOM_DEADLINES);
  form.launchDate.value = randomFutureDate();
  form.pagesCount.value = String(1 + Math.floor(Math.random() * 20));
  form.description.value = pick(RANDOM_DESCRIPTIONS);

  form.website.value = pick(RANDOM_WEBSITES);
  form.source.value = pick(RANDOM_SOURCES);
  form.contactMethod.value = pick(RANDOM_CONTACT_METHODS);

  clearAllErrors();
});

// --------------------------------------------------------------------------
// Toast-уведомления
// --------------------------------------------------------------------------
let toastTimer = null;
function showToast(message, type) {
  toastEl.textContent = message;
  toastEl.className = "toast show" + (type ? ` toast--${type}` : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3500);
}

// --------------------------------------------------------------------------
// Отправка формы
// --------------------------------------------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    const firstErrorField = form.querySelector(".field.has-error input, .field.has-error select, .field.has-error textarea");
    firstErrorField?.focus();
    showToast("Проверьте поля, отмеченные красным", "error");
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());

  submitBtn.disabled = true;
  submitBtn.querySelector(".submit-btn__label").textContent = "Отправляем...";

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script веб-приложения не всегда отдают CORS-заголовки
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });

    // При mode: "no-cors" ответ непрозрачен, поэтому считаем успешной саму отправку
    showToast("Заявка отправлена! Мы скоро с вами свяжемся 🎉", "success");
    form.reset();
    clearAllErrors();
  } catch (err) {
    console.error(err);
    showToast("Не удалось отправить заявку. Попробуйте ещё раз.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector(".submit-btn__label").textContent = "Отправить заявку";
  }
});
