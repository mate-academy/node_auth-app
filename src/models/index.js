import { RefreshToken } from './refreshToken.js';
import { SocialAccount } from './socialAccount.js';
import { User } from './user.js';

User.hasMany(RefreshToken);
RefreshToken.belongsTo(User);

User.hasMany(SocialAccount);
SocialAccount.belongsTo(User);
