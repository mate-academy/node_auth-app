import passport from 'passport';
import { googleStrategy } from './google.js';
import { githubStrategy } from './githubStrategy.js';

passport.use(googleStrategy);
passport.use(githubStrategy);

export default passport;
