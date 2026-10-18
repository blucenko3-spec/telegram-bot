/**
 * Telegram AI-Бот 24/7 (Автономний, без падінь)
 * Працює на чистому Node.js 18+ без зовнішніх npm бібліотек!
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// КОНФІГУРАЦІЯ
const CONFIG = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '8926292181:AAFsUJ9bXAhFIwPCUIoK5DG88Lhj_VgsdDs',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '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',
  AI_MODEL: 'google/gemini-2.0-flash-001',
  STORE_FILE: path.join(__dirname, 'bot_history.json'),
  TEMPERATURE: 0.2
};

// Точна офлайн-база знань
const KNOWLEDGE_BASE = [
  {
    keywords: ['/start', 'start', 'старт'],
    answer: '👋 Привіт! Я твій незламний автономний AI-бот. Працюю 24/7 без падінь завдяки системі Watchdog. Можу відповідати через AI, розвʼязувати математику або працювати повністю офлайн!\n\nСпробуйте надіслати математичний приклад (наприклад, 15*8 або /calc sqrt(144)+16) чи будь-яке запитання!'
  },
  {
    keywords: ['/help', 'help', 'допомога', 'команди'],
    answer: '📋 Команди та можливості:\n• /start — Початок роботи\n• /help — Список можливостей\n• /status — Стан роботи 24/7 та Watchdog\n• /calc <вираз> — Точний математичний калькулятор\n• /ping — Перевірка звʼязку\n\n💡 Ви також можете писати звичайні запитання — бот відповість через AI або офлайн-мозок!'
  },
  {
    keywords: ['/status', 'status', 'стан'],
    answer: '🟢 Стан системи: 100% Онлайн\n• Режим: 24/7 безперервний захист Watchdog\n• Швидкість відповіді: 0-50 мс\n• База знань: Автономна'
  },
  {
    keywords: ['/ping', 'ping', 'пінг'],
    answer: '🏓 Понг! Бот активний, звʼязок стабільний.'
  },
  {
    keywords: ['планети', 'сонячна система', 'скільки планет'],
    answer: '🪐 У Сонячній системі 8 офіційно визнаних планет:\n1. Меркурій, 2. Венера, 3. Земля, 4. Марс,\n5. Юпітер, 6. Сатурн, 7. Уран, 8. Нептун.\n(Плутон із 2006 року вважається карликовою планетою).'
  },
  {
    keywords: ['швидкість світла'],
    answer: '⚡ Точна швидкість світла у вакуумі: 299 792 458 м/с (приблизно 300 000 км/с).'
  },
  {
    keywords: ['столиця україни', 'київ'],
    answer: '🇺🇦 Столицею України є місто-герой Київ — серце нашої держави, розташоване на річці Дніпро.'
  },
  {
    keywords: ['привіт', 'добрий день', 'вітаю', 'hello', 'hi'],
    answer: '👋 Вітаю! Радий вас чути. Чим можу допомогти сьогодні?'
  },
  {
    keywords: ['дякую', 'спасибі'],
    answer: '😊 Будь ласка! Завжди радий допомогти.'
  },
  {
    keywords: ['як справи', 'як ти'],
    answer: '🤖 Все чудово! Працюю 24/7 без перебоїв та готовий відповідати на будь-які ваші запити.'
  },
  {
    keywords: ['чорна діра', 'що таке чорна діра'],
    answer: '🕳️ Чорна діра — це космічний обʼєкт із настільки сильною гравітацією, що ніщо (навіть світло) не може покинути його межі (горизонт подій).'
  },
  {
    keywords: ['штучний інтелект', 'що таке ші', 'ai'],
    answer: '🧠 Штучний інтелект (AI) — це комп\'ютерні системи, здатні навчатися, мислити та вирішувати завдання подібно до людського розуму.'
  },
  {
    keywords: ['еверест', 'найвища гора'],
    answer: '🏔️ Найвища гора на Землі — Еверест (Джомолунгма) у Гімалаях (висота 8 848,86 м).'
  }
];

// Збереження історії діалогів
function logMessage(data) {
  try {
    let history = [];
    if (fs.existsSync(CONFIG.STORE_FILE)) {
      history = JSON.parse(fs.readFileSync(CONFIG.STORE_FILE, 'utf-8'));
    }
    history.push({ ...data, time: new Date().toISOString() });
    if (history.length > 500) history.shift();
    fs.writeFileSync(CONFIG.STORE_FILE, JSON.stringify(history, null, 2));
  } catch (e) {}
}

// Точний математичний калькулятор (0мс затримки)
function solveMath(text) {
  const clean = text.replace(/^\/calc\s*/i, '').trim();
  if (!/^[\d\s\+\-\*\/\^\(\)\.\,\%sqrtabsPIEpie]+$/i.test(clean)) return null;
  if (!/[\+\-\*\/\^\%]|sqrt/i.test(clean)) return null;
  try {
    const sanitized = clean
      .replace(/sqrt\(([^)]+)\)/gi, 'Math.sqrt($1)')
      .replace(/\^/g, '**')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E')
      .replace(/,/g, '.');
    if (/^[\d\s\+\-\*\/\.\(\)Math\.sqrtPIE]+$/.test(sanitized)) {
      const result = Function(`"use strict"; return (${sanitized});`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const fmt = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
        return `🧮 [Точний розрахунок]:\n${clean} = ${fmt}`;
      }
    }
  } catch (e) {}
  return null;
}

// Запит до Telegram API
async function tgRequest(method, body) {
  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Помилка Telegram API');
  return data.result;
}

// Відправка повідомлення в Telegram
async function sendMessage(chatId, text) {
  try {
    return await tgRequest('sendMessage', {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });
  } catch (err) {
    console.error(`Помилка надсилання в чат ${chatId}:`, err.message);
  }
}

// Генерація відповіді (AI + Офлайн каскад)
async function generateAnswer(userText) {
  const trimmed = userText.trim();

  // 1. Математика
  const math = solveMath(trimmed);
  if (math) return math;

  // 2. Вбудована точна база знань
  const lower = trimmed.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    for (const kw of item.keywords) {
      if (lower === kw || (kw.length >= 4 && lower.includes(kw))) {
        return item.answer;
      }
    }
  }

  // 3. Online AI (OpenRouter)
  if (CONFIG.OPENROUTER_API_KEY && CONFIG.OPENROUTER_API_KEY.startsWith('sk-or-v1-')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: CONFIG.AI_MODEL,
          messages: [
            { role: 'system', content: 'Ти розумний і корисний Telegram AI-асистент. Відповідай українською мовою точно та лаконічно.' },
            { role: 'user', content: userText }
          ],
          temperature: CONFIG.TEMPERATURE
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (e) {}
  }

  // 4. Офлайн інтелектуальна відповідь
  if (lower.includes('хто ти')) {
    return '🤖 Я персональний інтелектуальний AI-бот для Telegram. Працюю 24/7 без падінь!';
  } else if (lower.includes('час') || lower.includes('година')) {
    const time = new Date().toLocaleTimeString('uk-UA', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit' });
    return `⏰ Точний час за Києвом: ${time}`;
  }

  return `💡 [Офлайн-відповідь]: Запит «${trimmed}» отримано! Я працюю у безперервному 24/7 режимі. Спробуйте запитати про науку, надіслати математичний приклад (наприклад: 25 * 14) або команду /help.`;
}

// Головний цикл Telegram Long Polling із Watchdog
async function startBot() {
  console.log('🚀 Запуск Telegram AI-бота 24/7...');
  try {
    const me = await tgRequest('getMe');
    console.log(`✅ Бот успішно підключений: @${me.username} (${me.first_name}, ID: ${me.id})`);
  } catch (err) {
    console.error('❌ Помилка токена бота:', err.message);
  }

  let offset = 0;
  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=20`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            const text = update.message.text;
            console.log(`📩 [${new Date().toLocaleTimeString()}] Повідомлення від ${chatId}: ${text}`);
            logMessage({ direction: 'inbound', chatId, text });

            const reply = await generateAnswer(text);
            await sendMessage(chatId, reply);
            logMessage({ direction: 'outbound', chatId, text: reply });
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ Тимчасовий збій мережі: ${err.message}. Відновлення через 3 сек...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// Захист від збоїв процесу (Watchdog)
process.on('uncaughtException', (err) => {
  console.error('[WATCHDOG ЗАПОБІГ ПАДІННЮ]:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[WATCHDOG ЗАПОБІГ ЗБОЮ]:', reason);
});

startBot();
