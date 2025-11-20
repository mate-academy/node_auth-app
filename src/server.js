import express from 'express';
import cadastroRoutes from './routers/cadastro.router.js';
import perfilRoutes from './routers/perfil.router.js';
import verificacaoRoutes from './routers/verificacao.router.js';
import perfilRoutes from './routers/perfil.router.js';
import logoutRoutes from './routers/logout.router.js';
import alterarSenhaRoutes from './routers/alterarSenha.router.js';
import loginRoutes from './routers/login.router.js';
import redefinirSenhaRoutes from './routers/redefinirSenha.router.js';

const app = express();

app.use(express.json());

app.use('/alterarSenha', alterarSenhaRoutes);
app.use('/cadastro', cadastroRoutes);
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/perfil', perfilRoutes);
app.use('/redefinirSenha', redefinirSenhaRoutes);
app.use('/verificacao', verificacaoRoutes);

export { app };
