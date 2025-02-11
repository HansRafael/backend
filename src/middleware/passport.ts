import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';

import * as userService from '../services/user.service';

async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await userService.getUserByEmail(username);
      const isValid = await verifyPassword(password, user.password);

      if (!isValid) {
        done(null, false, { message: 'Invalid password' });
        return;
      }

      done(null, user);
    } catch (erro) {
      done(erro);
    }
  },
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || '',
};

passport.use(new JwtStrategy(opts, async (payload, done) => {
  done(null, payload.user);
}));
