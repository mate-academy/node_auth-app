export const sendActivationEmail = async (email, token) => {
  const link = `${process.env.BASE_URL}/users/activate/${token}`;

  // тут може бути nodemailer
  return link;
};
