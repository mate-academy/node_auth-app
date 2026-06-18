<template>
  <RouterView />
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0f0f13;
  --surface: #18181f;
  --border: #2a2a35;
  --accent: #7c6aff;
  --accent-hover: #9b8dff;
  --text: #e8e8f0;
  --text-muted: #7a7a90;
  --error: #ff5f5f;
  --success: #4ade80;
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --radius: 12px;
  --transition: 0.18s ease;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.card__title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.4px;
  text-align: center;
}

.card__subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 32px;
  text-align: center;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 15px;
  padding: 11px 14px;
  outline: none;
  transition: border-color var(--transition);
}

input:focus {
  border-color: var(--accent);
}

input.error {
  border-color: var(--error);
}

.field-error {
  color: var(--error);
  font-size: 12px;
  margin-top: 5px;
}

.btn {
  width: 100%;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  padding: 12px;
  transition:
    background var(--transition),
    opacity var(--transition);
  margin-top: 8px;
}

.btn:hover {
  background: var(--accent-hover);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.btn--ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: transparent;
}

.link {
  color: var(--accent);
  text-decoration: none;
  font-size: 14px;
}

.link:hover {
  color: var(--accent-hover);
}

.text-center {
  text-align: center;
}
.mt-16 {
  margin-top: 16px;
}
.mt-24 {
  margin-top: 24px;
}

.alert {
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
}

.alert--error {
  background: rgba(255, 95, 95, 0.1);
  border: 1px solid rgba(255, 95, 95, 0.3);
  color: var(--error);
}
.alert--success {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: var(--success);
}
</style>
