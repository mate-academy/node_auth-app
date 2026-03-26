/**
 * Contexto React compartilhado para autenticação.
 * Criado aqui separadamente para evitar importação circular
 * entre AuthContext.jsx e useAuth.js.
 */
import { createContext } from 'react';

export const AuthContext = createContext(null);
