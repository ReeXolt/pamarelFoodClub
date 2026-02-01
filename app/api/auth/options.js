import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/user';
import connectToDatabase from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          await connectToDatabase();

          
          // 1. Find user by username
          const user = await User.findOne({ username: credentials.username })
                              .select('+password +isActive');
          if (!user) {
            throw new Error('No user found with this username');
          }

          // 2. Check if account is active
          if (user.status === "pending") {
            throw new Error('your account is not yet activated please contact support.');
          }

          if (user.status === "suspended") {
            throw new Error("your account has been suspended, please contact support.")
          }

          // 3. Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Incorrect password');
          }

          // 4. Return user object if everything is valid
          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email, // Still include email in case it's needed
            username: user.username, // Add username to the session
            role: user.role
          };

        } catch (error) {
          // Throw specific error messages to the client
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.username = user.username; // Add username to JWT
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.username = token.username; // Add username to session
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};