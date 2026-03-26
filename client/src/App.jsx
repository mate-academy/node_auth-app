/**
 * App — Componente raiz da aplicação React.
 *
 * Define a estrutura de rotas da SPA:
 * - Rotas de visitante (GuestRoute): login, registro, ativação, reset
 * - Rotas protegidas (ProtectedRoute): dashboard, despesas, categorias, perfil
 * - Página 404 para rotas inexistentes
 *
 * Providers:
 * - ThemeProvider: gerencia tema claro/escuro
 * - BrowserRouter: roteamento via React Router v7
 * - AuthProvider: estado global de autenticação
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './app/components/theme-provider';
import { AppLayout as Layout } from './app/components/app-layout';
import { ProtectedRoute } from './app/components/protected-route';
import { GuestRoute } from './app/components/guest-route';

import { LoginPage } from './app/components/login-page';
import { RegisterPage } from './app/components/register-page';
import { ActivationPage } from './app/components/activation-page';
import { ResetPasswordPage } from './app/components/reset-password-page';
import { ResetConfirmPage } from './app/components/reset-confirm-page';
import { DashboardPage } from './app/components/dashboard-page';
import { ExpensesPage } from './app/components/expenses-page';
import { CategoriesPage } from './app/components/categories-page';
import { ProfilePage } from './app/components/profile-page';
import { NotFoundPage } from './app/components/not-found-page';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          {/* Guest-only routes (no navbar) */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/activate/:token" element={<GuestRoute><ActivationPage /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<GuestRoute><ResetConfirmPage /></GuestRoute>} />

          {/* Protected routes (with navbar) */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}
