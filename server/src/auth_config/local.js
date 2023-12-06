import passport from 'passport';
import LocalStrategy from 'passport-local';
import { usersService } from "../services/users.service.js";
import bcrypt from'bcrypt';

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
},
	async function (email, password, done) {
		console.log(email, password)
		const currentUser = await usersService.getUserByEmail(email)

		if (!currentUser) {
			return done(null, false, { message: `User with email ${email} does not exist` });
		}

		if (!bcrypt.compareSync(password, currentUser.password)) {
			return done(null, false, { message: `Incorrect password provided` });
		}
		return done(null, currentUser);
	}
));


export const authLocal = passport.authenticate('local', {
});



passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	const currentUser = await usersService.getUserById({id});
	done(null, currentUser);
});
