# ApeX Cloner

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

**A powerful and feature-rich Discord server cloner with a beautiful CLI interface**

*Made with love by [ApeX Development](https://youtube.com/@ApeXDevelopment)*

</div>

---

## Features

- Clone server roles with proper hierarchy and permissions
- Clone all channel types (text, voice, categories)
- Clone channel permissions and overwrites
- Clone server emojis
- Clone server icon and name (optional)
- Beautiful progress bars and colored output
- Input validation and error handling
- Rate limit protection with configurable delays
- Easy-to-use interactive prompts

## Preview

```
   █████╗ ██████╗ ███████╗██╗  ██╗     ██████╗██╗      ██████╗ ███╗   ██╗███████╗██████╗ 
  ██╔══██╗██╔══██╗██╔════╝╚██╗██╔╝    ██╔════╝██║     ██╔═══██╗████╗  ██║██╔════╝██╔══██╗
  ███████║██████╔╝█████╗   ╚███╔╝     ██║     ██║     ██║   ██║██╔██╗ ██║█████╗  ██████╔╝
  ██╔══██║██╔═══╝ ██╔══╝   ██╔██╗     ██║     ██║     ██║   ██║██║╚██╗██║██╔══╝  ██╔══██╗
  ██║  ██║██║     ███████╗██╔╝ ██╗    ╚██████╗███████╗╚██████╔╝██║ ╚████║███████╗██║  ██║
  ╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝     ╚═════╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
```

## Requirements

- Node.js 14.0.0 or higher
- A Discord account token
- Admin permissions on the target server

## Installation

1. Clone the repository:
```bash
git clone https://github.com/apex-development/apex-cloner.git
cd apex-cloner
```

2. Install dependencies:
```bash
npm install
```

3. Run the cloner:
```bash
npm start
```

## Quick Start (One-Click Launch)

### Windows
Simply double-click `start.bat` - it will automatically install dependencies and launch the cloner!

### macOS / Linux
```bash
chmod +x start.sh
./start.sh
```

## Usage

1. Start the application with `npm start`
2. Enter your Discord account token when prompted
3. Enter the source server ID (the server you want to clone)
4. Enter the target server ID (the server to clone to)
5. Choose whether to clone the server icon and name
6. Wait for the cloning process to complete

## How to Get Your Discord Token

1. Open Discord in your browser
2. Press `Ctrl + Shift + I` (or `Cmd + Option + I` on Mac) to open Developer Tools
3. Go to the "Network" tab
4. Send any message in Discord
5. Click on any request and find the "Authorization" header
6. Copy the token value

## How to Get a Server ID

1. Enable Developer Mode in Discord Settings > App Settings > Advanced
2. Right-click on the server icon
3. Click "Copy Server ID"

## Configuration

You can modify the delays in `main.js` to adjust the cloning speed:

```javascript
const CONFIG = {
    delays: {
        role: 500,      // Delay between role creations (ms)
        channel: 800,   // Delay between channel creations (ms)
        emoji: 1000     // Delay between emoji creations (ms)
    }
};
```

**Note:** Lower delays may result in rate limiting. Increase delays if you encounter issues.

## What Gets Cloned

| Feature | Status |
|---------|--------|
| Server Name | ✅ |
| Server Icon | ✅ |
| Roles (name, color, permissions) | ✅ |
| Categories | ✅ |
| Text Channels | ✅ |
| Voice Channels | ✅ |
| Channel Permissions | ✅ |
| Channel Topics | ✅ |
| Emojis | ✅ |
| NSFW Settings | ✅ |
| Slowmode | ✅ |
| User Limit (Voice) | ✅ |
| Bitrate (Voice) | ✅ |

## What Doesn't Get Cloned

- Messages
- Members
- Bans
- Invites
- Webhooks
- Integrations
- Server Banner/Splash (Nitro features)

## Disclaimer

This tool is for educational purposes only. Using selfbots violates Discord's Terms of Service and may result in your account being banned. Use at your own risk.

## Support

- Subscribe to [ApeX Development](https://youtube.com/@ApeXDevelopment) on YouTube
- Star this repository if you found it helpful

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

Made with ❤️ by **ApeX Development**

</div>
