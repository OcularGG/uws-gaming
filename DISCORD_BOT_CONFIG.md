# Discord Bot Configuration for KrakenGaming

## 🤖 Bot Credentials (Production)
- **Application ID**: 1386828263350862025
- **Public Key**: e4122667917ea35f076405d3465ee4618abbf7f5c74ad7ba3212b0c0d651b96f
- **OAuth2 Client ID**: 1386828263350862025
- **OAuth2 Client Secret**: Pj89xzjlPiOhkCxMT5Stk9iRQ9NpyQ0a
- **Bot Token**: MTM4NjgyODI2MzM1MDg2MjAyNQ.GTOjAV.O4Toi91JUYXb8VwBJ_Qgaraz7kJ5xKWfhTX_e4

## 🏰 Discord Server Information
- **Guild ID**: 1386130264895520868
- **Server Name**: KrakenGaming
- **Invite Bot to Server**: Use the invite URL below to add the bot to this specific server

## 🔗 OAuth2 Redirects to Configure

### In Discord Developer Portal:
1. Go to: https://discord.com/developers/applications/1386828263350862025/oauth2/general
2. Add these **Redirect URIs**:

```
# Production
https://krakengaming.org/api/auth/callback/discord

# Preview/Staging
https://preview.krakengaming.org/api/auth/callback/discord

# Local Development
http://localhost:3000/api/auth/callback/discord

# Current Cloud Run URLs (temporary)
https://kraken-frontend-prod-1044201442446.us-central1.run.app/api/auth/callback/discord
https://kraken-frontend-preview-1044201442446.us-central1.run.app/api/auth/callback/discord
```

## 🎯 Bot Intents to Enable

### Required Intents for KrakenGaming:
1. **GUILD_MEMBERS** ✅ - Read server member info
2. **GUILD_MESSAGES** ✅ - Read messages (for commands)
3. **MESSAGE_CONTENT** ✅ - Read message content (required for slash commands)
4. **GUILDS** ✅ - Access basic guild information

### Optional Intents (Recommended):
5. **GUILD_MESSAGE_REACTIONS** ✅ - For reaction-based features
6. **GUILD_VOICE_STATES** ✅ - For voice channel management
7. **GUILD_PRESENCES** ⚠️ - Member status (requires verification for 100+ servers)

## 🏗️ Production vs Preview Bot Setup

### Recommendation: **Use ONE Discord Bot for Both**
✅ **Reasons to use single bot:**
- Simpler credential management
- Same Discord server for testing and production
- OAuth redirects handle environment routing
- Cost effective (no duplicate Discord app fees)

### Environment-Based Configuration:
```env
# Production Environment
DISCORD_CLIENT_ID=1386828263350862025
DISCORD_CLIENT_SECRET=Pj89xzjlPiOhkCxMT5Stk9iRQ9NpyQ0a
DISCORD_BOT_TOKEN=MTM4NjgyODI2MzM1MDg2MjAyNQ.GTOjAV.O4Toi91JUYXb8VwBJ_Qgaraz7kJ5xKWfhTX_e4
DISCORD_GUILD_ID=1386130264895520868
NEXTAUTH_URL=https://krakengaming.org

# Preview Environment
DISCORD_CLIENT_ID=1386828263350862025
DISCORD_CLIENT_SECRET=Pj89xzjlPiOhkCxMT5Stk9iRQ9NpyQ0a
DISCORD_BOT_TOKEN=MTM4NjgyODI2MzM1MDg2MJAyNQ.GTOjAV.O4Toi91JUYXb8VwBJ_Qgaraz7kJ5xKWfhTX_e4
DISCORD_GUILD_ID=1386130264895520868
NEXTAUTH_URL=https://preview.krakengaming.org
```

## 🛡️ Bot Permissions (Server-level)

### Basic Permissions:
- [x] View Channels
- [x] Send Messages
- [x] Send Messages in Threads
- [x] Embed Links
- [x] Attach Files
- [x] Read Message History
- [x] Use Slash Commands

### Administrative Permissions:
- [x] Manage Roles (for rank assignment)
- [x] Manage Channels (for dynamic channels)
- [x] Kick Members (for moderation)
- [x] Ban Members (for moderation)
- [x] Manage Messages (for cleanup)

## 🔧 Bot Invite URLs

### ⚠️ IMPORTANT: Use the Correct Invite URL

**Current URL in config has issues!** The permissions=8 gives ADMINISTRATOR which is overkill and risky.

### ✅ Quick Setup URL (Administrator Permissions):
```
https://discord.com/api/oauth2/authorize?client_id=1386828263350862025&permissions=8&scope=bot%20applications.commands%20identify%20email%20guilds%20guilds.join%20guilds.members.read%20messages.read
```

### 🛡️ What This URL Includes:

#### **Scopes:**
- `bot` - Basic bot functionality
- `applications.commands` - Slash commands support
- `identify` - Read user info
- `email` - Access user email
- `guilds` - Access guild info
- `guilds.join` - Join guilds on user's behalf
- `guilds.members.read` - Read guild members
- `messages.read` - Read message history

#### **Permissions (Administrator: 8):**
#### **Permissions (Administrator: 8):**
**Administrator Permission Includes:**
- ✅ **ALL SERVER PERMISSIONS** - Complete control over the server
- ✅ View Channels, Send Messages, Manage Messages
- ✅ Manage Roles, Channels, Members
- ✅ Kick/Ban Members, Manage Server
- ✅ Voice Permissions, File Attachments
- ✅ Slash Commands, External Emojis
- ✅ **Everything a Discord server owner can do**

**Note**: Administrator permission (8) gives the bot complete control over the server. This is convenient for development but should be restricted in production for security.

### 🚨 **Administrator Permission (Current Setup)**
```
# CURRENT SETUP - Administrator with all scopes:
https://discord.com/api/oauth2/authorize?client_id=1386828263350862025&permissions=8&scope=bot%20applications.commands%20identify%20email%20guilds%20guilds.join%20guilds.members.read%20messages.read
```

### ⚠️ **Future: Restrict Permissions for Production**
Once testing is complete, consider using specific permissions instead of Administrator for better security.

### 🔍 **Permission Calculator**
You can verify/customize permissions at: https://discordapi.com/permissions.html
- Current: Administrator permission (8) - gives all permissions
- All scopes included for maximum compatibility during development

## ⚠️ Security Notes
- Bot token should be stored in Google Secret Manager
- Never commit credentials to git
- Use environment-specific NEXTAUTH_URL
- Rotate tokens if compromised
