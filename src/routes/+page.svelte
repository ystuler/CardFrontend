<script lang="ts">
  import { isAuthenticated, user } from '$lib/stores';
</script>

<div class="container">
  {#if $isAuthenticated}
    <div class="welcome">
      <h1>Добро пожаловать, {$user?.username}!</h1>
      <p>Вы успешно авторизованы. Здесь будет интерфейс для работы с карточками.</p>
    </div>
  {:else}
    <div class="welcome">
      <h1>Добро пожаловать в Flashcard App</h1>
      <p>Для начала работы необходимо авторизоваться.</p>
      <a href="/auth" class="auth-link">Перейти к авторизации</a>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .welcome {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
  }
  
  .auth-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  .auth-link:hover {
    background-color: #0056b3;
  }
</style>
