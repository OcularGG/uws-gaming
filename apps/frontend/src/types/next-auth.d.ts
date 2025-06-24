import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string
    user: {
      discordId?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    discordId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    discordId?: string
  }
}

declare module 'next-auth/providers/discord' {
  interface DiscordProfile {
    id: string
    username: string
    avatar: string | null
    discriminator: string
    public_flags: number
    flags: number
    banner: string | null
    accent_color: number | null
    global_name: string | null
    avatar_decoration: string | null
    display_name: string | null
    banner_color: string | null
  }
}
