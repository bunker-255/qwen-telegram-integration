#!/usr/bin/env node
/**
 * Qwen Code Telegram Server
 * Позволяет взаимодействовать с Qwen Code через Telegram бота
 * 
 * Использование:
 *   qwen --telegram
 * 
 * Переменные окружения:
 *   TELEGRAM_BOT_TOKEN - токен бота от @BotFather
 *   TELEGRAM_ALLOWED_USERS - comma-separated список user_id (опционально)
 */

import { Telegraf } from 'telegraf';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Конфигурация
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USERS = process.env.TELEGRAM_ALLOWED_USERS?.split(',').map(id => id.trim()) || [];

if (!BOT_TOKEN) {
    console.error('❌ Ошибка: Не указан TELEGRAM_BOT_TOKEN');
    console.error('Создайте .env файл или экспортируйте переменную:');
    console.error('  export TELEGRAM_BOT_TOKEN="your_bot_token"');
    process.exit(1);
}

// История чатов (в памяти)
const chatHistory = new Map();

// Инициализация бота
const bot = new Telegraf(BOT_TOKEN);

// Middleware для проверки доступа
bot.use(async (ctx, next) => {
    const userId = ctx.from?.id?.toString();
    if (ALLOWED_USERS.length > 0 && !ALLOWED_USERS.includes(userId)) {
        await ctx.reply('⛔ Доступ запрещён');
        return;
    }
    await next();
});

// Команда /start
bot.command('start', async (ctx) => {
    await ctx.reply(
        '👋 *Qwen Code Bot*\n\n' +
        'Я предоставляю доступ к Qwen Code прямо из Telegram.\n\n' +
        '*Команды:*\n' +
        '/help - справка\n' +
        '/clear - очистить историю чата\n' +
        '/status - статус системы\n\n' +
        'Просто отправьте сообщение, и я обработаю его через Qwen Code',
        { parse_mode: 'Markdown' }
    );
});

// Команда /help
bot.command('help', async (ctx) => {
    await ctx.reply(
        '📚 *Справка*\n\n' +
        '*Как использовать:*\n' +
        'Отправьте любое сообщение - я передам его Qwen Code\n\n' +
        '*Примеры:*\n' +
        '• "создай задачу на разработку API"\n' +
        '• "запиши заметку про встречу"\n' +
        '• "выполни код print(2+2)"\n\n' +
        '*Команды:*\n' +
        '/clear - очистить историю\n' +
        '/status - показать статус\n' +
        '/reset - сбросить контекст',
        { parse_mode: 'Markdown' }
    );
});

// Команда /clear
bot.command('clear', async (ctx) => {
    const userId = ctx.from.id.toString();
    chatHistory.delete(userId);
    await ctx.reply('✅ *История чата очищена*', { parse_mode: 'Markdown' });
});

// Команда /status
bot.command('status', async (ctx) => {
    const userId = ctx.from.id.toString();
    const history = chatHistory.get(userId) || [];
    
    await ctx.reply(
        `📊 *Статус*\n\n` +
        "User ID: `" + userId + "`\n" +
        `Сообщений в истории: ${history.length}\n` +
        `Qwen Code: готов`,
        { parse_mode: 'Markdown' }
    );
});

// Обработка сообщений
bot.on('text', async (ctx) => {
    const userId = ctx.from.id.toString();
    const username = ctx.from.username || userId;
    const message = ctx.message.text;
    
    console.log(`[${new Date().toISOString()}] ${username}: ${message.substring(0, 50)}...`);
    
    // Отправляем статус "печатает"
    await ctx.sendChatAction('typing');
    
    try {
        // Получаем историю чата
        let history = chatHistory.get(userId) || [];
        
        // Вызываем qwen через CLI
        const response = await callQwen(message, history);
        
        // Сохраняем в историю
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: response });
        chatHistory.set(userId, history);
        
        // Отправляем ответ с Markdown форматированием
        await sendLongMessage(ctx, response);
        
        console.log(`[${new Date().toISOString()}] Bot: ответ отправлен`);
        
    } catch (error) {
        console.error(`Ошибка: ${error.message}`);
        await ctx.reply(`❌ *Ошибка:* ${escapeMarkdown(error.message)}`, { parse_mode: 'Markdown' });
    }
});

// Вызов Qwen Code CLI
async function callQwen(prompt, history = []) {
    return new Promise((resolve, reject) => {
        // Формируем промпт с контекстом
        let fullPrompt = prompt;
        if (history.length > 0) {
            const context = history.slice(-6).map(msg => 
                `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
            ).join('\n');
            fullPrompt = `${context}\n\nUser: ${prompt}`;
        }
        
        // Путь к оригинальному qwen CLI
        const originalCLI = join(__dirname, 'cli-original.js');
        
        // Запускаем qwen с промптом
        const qwen = spawn('node', [originalCLI, '--prompt', fullPrompt], {
            env: { ...process.env, QWEN_CODE_NO_INTERACTIVE: '1' }
        });
        
        let output = '';
        let errorOutput = '';
        
        qwen.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        qwen.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        qwen.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            } else {
                reject(new Error(`Qwen exited with code ${code}: ${errorOutput}`));
            }
        });
        
        qwen.on('error', (err) => {
            reject(err);
        });
        
        // Таймаут 5 минут
        setTimeout(() => {
            qwen.kill();
            reject(new Error('Превышено время ожидания (5 мин)'));
        }, 300000);
    });
}

// Экранирование специальных символов Markdown
function escapeMarkdown(text) {
    const escapeChars = '_*[]()~`>#+-=|{}.!\\';
    let result = '';
    for (const char of text) {
        if (escapeChars.includes(char)) {
            result += '\\';
        }
        result += char;
    }
    return result;
}

// Форматирование кода для Telegram
function formatForTelegram(text) {
    // Заменяем ```markdown на ``` для совместимости
    text = text.replace(/```markdown/g, '```');
    
    // Заменяем заголовки # на *жирный*
    text = text.replace(/^### (.*$)/gim, '*$1*');
    text = text.replace(/^## (.*$)/gim, '*$1*');
    text = text.replace(/^# (.*$)/gim, '*$1*');
    
    return text;
}

// Отправка длинного сообщения с Markdown
async function sendLongMessage(ctx, text, maxLength = 4000) {
    // Форматируем текст для Telegram
    let formattedText = formatForTelegram(text);
    
    if (formattedText.length <= maxLength) {
        await ctx.reply(formattedText, { parse_mode: 'Markdown' });
        return;
    }
    
    // Разбиваем на части по коду
    const codeBlocks = [];
    const textParts = [];
    let remainingText = formattedText;
    
    // Извлекаем блоки кода
    const codeRegex = /```[\s\S]*?```/g;
    let match;
    while ((match = codeRegex.exec(formattedText)) !== null) {
        codeBlocks.push({
            text: match[0],
            index: match.index
        });
    }
    
    // Если есть блоки кода, разбиваем с их учётом
    if (codeBlocks.length > 0) {
        let lastIndex = 0;
        const parts = [];
        let currentPart = '';
        
        for (const codeBlock of codeBlocks) {
            const textBefore = formattedText.slice(lastIndex, codeBlock.index);
            
            if ((currentPart + textBefore + codeBlock.text).length > maxLength) {
                if (currentPart) parts.push(currentPart);
                currentPart = textBefore + codeBlock.text;
            } else {
                currentPart += textBefore + codeBlock.text;
            }
            
            lastIndex = codeBlock.index + codeBlock.text.length;
        }
        
        const textAfter = formattedText.slice(lastIndex);
        if ((currentPart + textAfter).length > maxLength) {
            if (currentPart) parts.push(currentPart);
            currentPart = textAfter;
        } else {
            currentPart += textAfter;
        }
        
        if (currentPart) parts.push(currentPart);
        
        // Отправляем частями
        for (let i = 0; i < parts.length; i++) {
            const suffix = i < parts.length - 1 ? '\n_продолжение следует..._' : '';
            await ctx.reply(parts[i] + suffix, { parse_mode: 'Markdown' });
            await new Promise(r => setTimeout(r, 500));
        }
    } else {
        // Простая разбивка по строкам
        const parts = [];
        let current = '';
        
        for (const line of formattedText.split('\n')) {
            if ((current + line + '\n').length > maxLength) {
                parts.push(current);
                current = line + '\n';
            } else {
                current += line + '\n';
            }
        }
        
        if (current) {
            parts.push(current);
        }
        
        // Отправляем частями
        for (let i = 0; i < parts.length; i++) {
            const suffix = i < parts.length - 1 ? '\n_продолжение следует..._' : '';
            await ctx.reply(parts[i] + suffix, { parse_mode: 'Markdown' });
            await new Promise(r => setTimeout(r, 500));
        }
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Остановка бота...');
    bot.stop('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Остановка бота...');
    bot.stop('SIGTERM');
    process.exit(0);
});

// Запуск
async function main() {
    console.log('🤖 Qwen Code Telegram Server');
    console.log('Запуск бота...');
    
    try {
        await bot.launch({
            dropPendingUpdates: true
        });
        
        const botInfo = await bot.telegram.getMe();
        console.log(`✅ Бот запущен: @${botInfo.username}`);
        console.log('Остановка: Ctrl+C');
        
    } catch (error) {
        console.error('❌ Ошибка запуска:', error.message);
        process.exit(1);
    }
}

main();
