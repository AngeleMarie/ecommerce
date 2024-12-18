import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Authentication from '../models/userModel.js';
import { Auth } from 'googleapis';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/users/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await Authentication.findOne({ googleId: profile.id });
      if (!user) {
        user = new Authentication({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstname: profile.name.givenName,
          lastname: profile.name.familyName,
          isConfirmed: true,
        });
        await user.save();
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Authentication.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});



