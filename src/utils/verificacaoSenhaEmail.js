const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function senha(senhaString) {
  if (!senhaString) {
    return { status: 400, message: 'Senha obrigatória.' };
  }

  if (senhaString.length < 8) {
    return {
      status: 400,
      message: 'A senha deve ter pelo menos 8 caracteres.',
    };
  }

  if (!/[A-Z]/.test(senhaString)) {
    return {
      status: 400,
      message: 'A senha deve ter pelo menos 1 letra maiúscula.',
    };
  }

  if (!/[a-z]/.test(senhaString)) {
    return {
      status: 400,
      message: 'A senha deve ter pelo menos 1 letra minúscula.',
    };
  }

  if (!/[0-9]/.test(senhaString)) {
    return { status: 400, message: 'A senha deve ter pelo menos 1 número.' };
  }

  if (!/[^A-Za-z0-9]/.test(senhaString)) {
    return {
      status: 400,
      message: 'A senha deve ter pelo menos 1 caractere especial.',
    };
  }

  return null;
}

function email(emailString) {
  if (!emailString) {
    return { status: 400, message: 'Email é obrigatório.' };
  }

  if (emailString.trim() === '') {
    return { status: 400, message: 'Email não pode estar vazio.' };
  }

  if (!emailRegex.test(emailString)) {
    return { status: 422, message: 'Formato de email inválido.' };
  }

  return null;
}

export const verificacaoSenhaEmail = {
  senha,
  email,
};
