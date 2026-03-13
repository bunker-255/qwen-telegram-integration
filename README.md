# Qwen Code Telegram Integration

Telegram bot integration for Qwen Code CLI - interact with Qwen Code remotely through Telegram messenger.

## 🚀 Quick Start

### 1. Create a Bot in @BotFather

1. Open Telegram, search for @BotFather
2. Send `/newbot`
3. Enter name and username (must end with `bot`)
4. Save the token you receive

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/bunker-255/qwen-telegram-integration.git
cd qwen-telegram-integration

# Install dependencies
npm install -g telegraf
```

### 3. Run

```bash
export TELEGRAM_BOT_TOKEN="your_token_here"
node qwen-telegram-server.js
```

Or via qwen-code (if installed):
```bash
export TELEGRAM_BOT_TOKEN="your_token_here"
qwen --telegram
```

## 📋 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | Help information |
| `/clear` | Clear chat history |
| `/status` | Show status |

## 📸 Media Support

The bot supports sending **photos** and **documents**:

- **Photos**: Send an image with an optional caption/question
- **Documents**: Send files with optional captions

**Example:**
```
Send: [photo of code error]
Caption: "What's wrong with this code?"
Bot: [Analyzes and provides fix]
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Bot token from @BotFather |
| `TELEGRAM_ALLOWED_USERS` | ❌ | Comma-separated list of allowed user IDs |

## 📁 Project Structure

```
qwen-telegram-integration/
├── qwen-telegram-server.js    # Telegram bot server
├── cli-wrapper.js             # Wrapper for qwen-code CLI
├── README.md                  # Documentation
├── package.json               # Dependencies
└── .env.example               # Example configuration
```

## 💡 Usage Examples

### Regular Query
```
User: How do I create a task in Obsidian?
Bot: [Qwen response with instructions]
```

### Code Generation
```
User: Write a sorting function in Python
Bot: [Code with comments]
```

## 🔗 Links

- **Qwen Code:** https://github.com/QwenLM/qwen-code
- **Telegraf:** https://github.com/telegraf/telegraf
- **Bunker-255:** https://bunker-255.com

## 📝 Notes

- Chat history is stored in memory (cleared on restart)
- Qwen response timeout: 5 minutes
- Maximum message length: 4000 characters (split into parts)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Developed at Bunker-255 R&D Lab*
