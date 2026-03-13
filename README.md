# Qwen Code Telegram Integration

Интеграция Telegram бота с Qwen Code CLI для удалённого взаимодействия через мессенджер.

## 🚀 Быстрый старт

### 1. Создайте бота в @BotFather

1. Откройте Telegram, найдите @BotFather
2. Отправьте `/newbot`
3. Введите имя и username (должен заканчиваться на `bot`)
4. Сохраните полученный токен

### 2. Установка

```bash
# Клонировать репозиторий
git clone https://github.com/bunker-255/qwen-telegram-integration.git
cd qwen-telegram-integration

# Установить зависимости
npm install -g telegraf
```

### 3. Запуск

```bash
export TELEGRAM_BOT_TOKEN="your_token_here"
node qwen-telegram-server.js
```

Или через qwen-code (если установлен):
```bash
export TELEGRAM_BOT_TOKEN="your_token_here"
qwen --telegram
```

## 📋 Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Приветствие |
| `/help` | Справка |
| `/clear` | Очистить историю чата |
| `/status` | Показать статус |

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Обязательная | Описание |
|------------|--------------|----------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Токен бота от @BotFather |
| `TELEGRAM_ALLOWED_USERS` | ❌ | Список разрешённых user_id через запятую |

## 📁 Структура

```
qwen-telegram-integration/
├── qwen-telegram-server.js    # Telegram сервер
├── cli-wrapper.js             # Wrapper для qwen-code CLI
├── README.md                  # Документация
├── package.json               # Зависимости
└── examples/
    └── .env.example           # Пример конфигурации
```

## 💡 Примеры использования

### Обычный запрос
```
Пользователь: как создать задачу в Obsidian?
Бот: [ответ от Qwen с инструкцией]
```

### Генерация кода
```
Пользователь: напиши функцию сортировки на Python
Бот: [код с комментариями]
```

### Работа с MCP инструментами
```
Пользователь: создай задачу на разработку API
Бот: [структура задачи с подзадачами через task-manager MCP]
```

## 🔗 Ссылки

- **Qwen Code:** https://github.com/QwenLM/qwen-code
- **Telegraf:** https://github.com/telegraf/telegraf
- **Bunker-255:** https://bunker-255.com

## 📝 Заметки

- История чата хранится в памяти (сбрасывается при перезапуске)
- Таймаут ответа от Qwen: 5 минут
- Максимальная длина сообщения: 4000 символов (разбивается на части)

## 🤝 Contributing

1. Fork репозиторий
2. Создай ветку (`git checkout -b feature/amazing-feature`)
3. Закоммить изменения (`git commit -m 'Add amazing feature'`)
4. Отправь (`git push origin feature/amazing-feature`)
5. Открой Pull Request

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

---

*Разработано в Bunker-255 R&D Lab*
