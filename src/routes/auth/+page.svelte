<script lang="ts">
  import { login, signup, type SignInReq, type CreateUserReq } from '$lib/api';
  import { user, isAuthenticated } from '$lib/stores';
  import { goto } from '$app/navigation';
  
  let isLoginMode = true;
  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    if (!username || !password) {
      error = 'Пожалуйста, заполните все поля';
      return;
    }

    loading = true;
    error = '';

    try {
      let response;
      
      if (isLoginMode) {
        response = await login({ username, password });
      } else {
        response = await signup({ username, password });
      }

      // Сохраняем данные пользователя
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      user.set(response);
      isAuthenticated.set(true);
      
      // Переходим на главную страницу
      goto('/');
      
    } catch (e) {
      error = e instanceof Error ? e.message : 'Произошла ошибка';
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    isLoginMode = !isLoginMode;
    error = '';
    username = '';
    password = '';
  }
</script>

<div class="auth-container">
  <div class="auth-form">
    <h2>{isLoginMode ? 'Вход' : 'Регистрация'}</h2>
    
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="username">Логин:</label>
        <input 
          type="text" 
          id="username" 
          bind:value={username}
          placeholder="Введите логин"
          disabled={loading}
        />
      </div>
      
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password}
          placeholder="Введите пароль"
          disabled={loading}
        />
      </div>
      
      {#if error}
        <div class="error">{error}</div>
      {/if}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Загрузка...' : (isLoginMode ? 'Войти' : 'Зарегистрироваться')}
      </button>
    </form>
    
    <div class="toggle-mode">
      <button type="button" on:click={toggleMode} class="link-button">
        {isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
      </button>
    </div>
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
  }
  
  .auth-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
  }
  
  input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  input:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
  
  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  button:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  .error {
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .toggle-mode {
    text-align: center;
    margin-top: 1.5rem;
  }
  
  .link-button {
    background: none;
    border: none;
    color: #007bff;
    text-decoration: underline;
    cursor: pointer;
    font-size: 14px;
    width: auto;
    padding: 0;
  }
  
  .link-button:hover {
    color: #0056b3;
    background: none;
  }
</style>
