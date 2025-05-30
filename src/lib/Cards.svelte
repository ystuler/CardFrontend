<script lang="ts">  import { 
    getCardsByCollection, 
    createCard, 
    updateCard, 
    deleteCard,
    type CardsByCollectionID,
    type CreateCardReq,
    type UpdateCardReq 
  } from '$lib/api';
  import { user } from '$lib/stores';
  import { onMount } from 'svelte';
  import TrainingMode from './TrainingMode.svelte';

  export let collectionId: number;
  export let collectionName: string;
  export let onBack: () => void;

  let cards: CardsByCollectionID[] = [];
  let loading = false;
  let error = '';
  let showTraining = false;
  
  // Form state
  let showCreateForm = false;
  let editingCard: CardsByCollectionID | null = null;
  let formData = {
    question: '',
    answer: ''
  };

  onMount(async () => {
    await loadCards();
  });
  async function loadCards() {
    if (!$user?.token) return;
    
    loading = true;
    error = '';
    
    try {
      const response = await getCardsByCollection($user.token, collectionId);
      // Сортируем карточки по ID для правильного порядка
      cards = (response.cards || []).sort((a, b) => a.id - b.id);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ошибка загрузки карточек';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    if (!$user?.token || !formData.question.trim()) return;
    
    loading = true;
    error = '';

    try {
      if (editingCard) {
        // Update existing card
        const updateData: UpdateCardReq = {
          id: editingCard.id,
          question: formData.question.trim(),
          answer: formData.answer.trim() || undefined
        };
        await updateCard($user.token, updateData);
      } else {
        // Create new card
        const createData: CreateCardReq = {
          question: formData.question.trim(),
          answer: formData.answer.trim() || undefined
        };
        await createCard($user.token, collectionId, createData);
      }
      
      await loadCards();
      resetForm();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ошибка сохранения карточки';
    } finally {
      loading = false;
    }
  }

  async function handleDelete(cardId: number) {
    console.log('Delete clicked for card:', cardId);
    
    if (!$user?.token) {
      error = 'Нет токена авторизации';
      return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить эту карточку?')) {
      return;
    }
    
    loading = true;
    error = '';

    try {
      console.log('Attempting to delete card:', cardId);
      await deleteCard($user.token, cardId);
      console.log('Card deleted successfully');
      await loadCards();
    } catch (e) {
      console.error('Delete error:', e);
      error = e instanceof Error ? e.message : 'Ошибка удаления карточки';
    } finally {
      loading = false;
    }
  }

  function startEdit(card: CardsByCollectionID) {
    editingCard = card;
    formData = {
      question: card.question,
      answer: card.answer || ''
    };
    showCreateForm = true;
  }
  function resetForm() {
    showCreateForm = false;
    editingCard = null;
    formData = {
      question: '',
      answer: ''
    };
  }

  function startTraining() {
    showTraining = true;
  }

  function backFromTraining() {
    showTraining = false;
  }
</script>

{#if showTraining}
  <TrainingMode 
    collectionId={collectionId} 
    collectionName={collectionName}
    onBack={backFromTraining}
  />
{:else}

<div class="cards-container">  <div class="header">
    <div class="header-left">
      <button on:click={onBack} class="back-btn">← Назад</button>
      <h2 title={collectionName}>Карточки: {collectionName}</h2>
    </div>
    <div class="header-actions">
      <button on:click={startTraining} class="train-btn" disabled={loading}>
        🎓 Учить карточки
      </button>
      <button on:click={() => showCreateForm = true} class="create-btn" disabled={loading}>
        Создать карточку
      </button>
    </div>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if showCreateForm}
    <div class="form-overlay">
      <div class="form-modal">
        <h3>{editingCard ? 'Редактировать карточку' : 'Создать новую карточку'}</h3>
        
        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-group">
            <label for="question">Вопрос *</label>
            <textarea 
              id="question"
              bind:value={formData.question}
              placeholder="Введите вопрос"
              required
              disabled={loading}
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="answer">Ответ</label>
            <textarea 
              id="answer"
              bind:value={formData.answer}
              placeholder="Введите ответ (необязательно)"
              rows="3"
              disabled={loading}
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" on:click={resetForm} disabled={loading}>
              Отмена
            </button>
            <button type="submit" disabled={loading || !formData.question.trim()}>
              {loading ? 'Сохранение...' : (editingCard ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <div class="cards-grid">
    {#if loading && cards.length === 0}
      <div class="loading">Загрузка карточек...</div>
    {:else if cards.length === 0}
      <div class="empty-state">
        <p>В этой коллекции пока нет карточек</p>
        <button on:click={() => showCreateForm = true} class="create-btn">
          Создать первую карточку
        </button>
      </div>    {:else}
      {#each cards as card, index (card.id)}
        <div class="card-item">
          <div class="card-header">
            <span class="card-label">Карточка #{index + 1}</span>
            <div class="card-actions">
              <button 
                on:click={() => startEdit(card)} 
                class="edit-btn" 
                title="Редактировать"
                disabled={loading}
              >
                ✏️
              </button>
              <button 
                on:click|stopPropagation={() => handleDelete(card.id)} 
                class="delete-btn" 
                title="Удалить"
                disabled={loading}
              >
                🗑️
              </button>
            </div>
          </div>
            <div class="card-content">
            <div class="question-section">
              <h4>Вопрос:</h4>
              <p title={card.question}>{card.question}</p>
            </div>
            
            {#if card.answer}
              <div class="answer-section">
                <h4>Ответ:</h4>
                <p title={card.answer}>{card.answer}</p>
              </div>
            {:else}
              <div class="answer-section">
                <h4>Ответ:</h4>
                <p class="no-answer">Ответ не указан</p>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .cards-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .back-btn {
    background-color: #6c757d;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .back-btn:hover {
    background-color: #5a6268;
  }  .header h2 {
    margin: 0;
    color: #333;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;    -webkit-line-clamp: 2;
    line-clamp: 2;
    max-height: 2.6em;
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .train-btn {
    background-color: #17a2b8;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .train-btn:hover:not(:disabled) {
    background-color: #138496;
  }

  .train-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .create-btn {
    background-color: #28a745;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .create-btn:hover:not(:disabled) {
    background-color: #218838;
  }

  .create-btn:disabled {
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

  .form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .form-modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 600px;
    margin: 1rem;
    max-height: 90vh;
    overflow-y: auto;
  }

  .form-modal h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
  }

  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
    font-family: inherit;
    resize: vertical;
  }

  .form-group textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .form-actions button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .form-actions button[type="button"] {
    background-color: #6c757d;
    color: white;
  }

  .form-actions button[type="submit"] {
    background-color: #007bff;
    color: white;
  }

  .form-actions button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .form-actions button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .loading, .empty-state {
    text-align: center;
    padding: 3rem;
    color: #666;
    grid-column: 1 / -1;
  }

  .empty-state p {
    margin-bottom: 1rem;
    font-size: 18px;
  }

  .card-item {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .card-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .card-label {
    color: #666;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn, .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    transition: background-color 0.2s;
  }

  .edit-btn:hover:not(:disabled) {
    background-color: #e9ecef;
  }

  .delete-btn:hover:not(:disabled) {
    background-color: #f8d7da;
  }

  .edit-btn:disabled, .delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .question-section, .answer-section {
    flex: 1;
  }

  .question-section h4, .answer-section h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 14px;
    font-weight: 600;
  }
  .question-section p, .answer-section p {
    margin: 0;
    line-height: 1.4;
    color: #555;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;    -webkit-line-clamp: 3;
    line-clamp: 3;
    max-height: 4.2em;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }  .no-answer {
    color: #999;
    font-style: italic;
  }

  /* Адаптивные стили для мобильных устройств */
  @media (max-width: 768px) {
    .cards-container {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .header-left {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .header-actions {
      justify-content: space-between;
    }

    .cards-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .card-item {
      padding: 1rem;
    }

    .form-modal {
      margin: 0.5rem;
      padding: 1rem;
    }
  }
</style>

{/if}
