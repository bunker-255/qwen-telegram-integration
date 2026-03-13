#!/usr/bin/env node
/**
 * Qwen Code Wrapper с поддержкой Telegram режима
 * Использование: qwen [--telegram] [остальные аргументы]
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Проверяем флаг --telegram
const telegramMode = process.argv.includes('--telegram');

if (telegramMode) {
    // Запускаем Telegram сервер
    console.log('🚀 Запуск Telegram режима...');
    
    // Путь к скрипту Telegram сервера
    const telegramScript = join(__dirname, 'qwen-telegram-server.js');
    
    if (!fs.existsSync(telegramScript)) {
        console.error('❌ Ошибка: Telegram сервер не найден:', telegramScript);
        process.exit(1);
    }
    
    // Запускаем Telegram сервер
    const telegram = spawn('node', [telegramScript, ...process.argv.slice(3)], {
        stdio: 'inherit',
        env: process.env
    });
    
    telegram.on('error', (err) => {
        console.error('Ошибка запуска Telegram сервера:', err);
        process.exit(1);
    });
    
    telegram.on('close', (code) => {
        process.exit(code);
    });
    
} else {
    // Обычный режим - запускаем оригинальный qwen CLI
    const originalCLI = join(__dirname, 'cli-original.js');
    
    // Перенаправляем аргументы (убираем --telegram если был)
    const args = process.argv.slice(2).filter(arg => arg !== '--telegram');
    
    const qwen = spawn('node', [originalCLI, ...args], {
        stdio: 'inherit',
        env: process.env
    });
    
    qwen.on('error', (err) => {
        console.error('Ошибка запуска qwen:', err);
        process.exit(1);
    });
    
    qwen.on('close', (code) => {
        process.exit(code);
    });
}
