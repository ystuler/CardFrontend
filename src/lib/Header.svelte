<script lang="ts">
  import { logout as logoutRequest } from '$lib/api';
  import { user, isAuthenticated } from '$lib/stores';
  
  async function logout() {
    const token = $user?.token;

    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // Local session is cleared even if backend logout fails.
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    user.set(null);
    isAuthenticated.set(false);
  }
</script>

<header>
  <div class="header-content">
    <h1>Flashcard App</h1>
    
    <div class="auth-section">
      {#if $isAuthenticated}
        <span>Привет, {$user?.username}!</span>
        <button on:click={logout} class="logout-btn">Выйти</button>
      {:else}
        <a href="/auth" class="auth-btn">Авторизоваться</a>
      {/if}
    </div>
  </div>
</header>

<style>
  header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 0;
  }
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  h1 {
    margin: 0;
    color: #333;
  }
  
  .auth-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .auth-btn, .logout-btn {
    background-color: #007bff;
    color: white;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 14px;
  }
  
  .auth-btn:hover, .logout-btn:hover {
    background-color: #0056b3;
  }
  
  span {
    color: #666;
  }
</style>
