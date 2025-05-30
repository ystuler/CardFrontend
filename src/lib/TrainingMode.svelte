<script lang="ts">
  import { 
    getTrainingCards,
    type CardsByCollectionID
  } from '$lib/api';
  import { user } from '$lib/stores';
  import { onMount } from 'svelte';

  export let collectionId: number;
  export let collectionName: string;
  export let onBack: () => void;

  let trainingCards: CardsByCollectionID[] = [];
  let currentCardIndex = 0;
  let showAnswer = false;
  let loading = false;
  let error = '';
  let trainingComplete = false;

  onMount(async () => {
    await loadTrainingCards();
  });

  async function loadTrainingCards() {
    if (!$user?.token) return;
    
    loading = true;
    error = '';
    
    try {
      const response = await getTrainingCards($user.token, collectionId);
      trainingCards = response.cards || [];
      
      if (trainingCards.length === 0) {
        error = 'В коллекции нет карточек для изучения';
        return;
      }
      
      // Сброс состояния
      currentCardIndex = 0;
      showAnswer = false;
      trainingComplete = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ошибка загрузки карточек для изучения';
    } finally {
      loading = false;
    }
  }

  function showCardAnswer() {
    showAnswer = true;
  }

  function nextCard() {
    if (currentCardIndex < trainingCards.length - 1) {
      currentCardIndex++;
      showAnswer = false;
    } else {
      trainingComplete = true;
    }
  }

  function restartTraining() {
    currentCardIndex = 0;
    showAnswer = false;
    trainingComplete = false;
    loadTrainingCards(); // Загружаем новый набор рандомных карточек
  }

  $: currentCard = trainingCards[currentCardIndex];
  $: progress = trainingCards.length > 0 ? ((currentCardIndex + 1) / trainingCards.length) * 100 : 0;
</script>

<div class="training-container">  <div class="header">
    <div class="header-left">
      <button on:click={onBack} class="back-btn">← Назад</button>
      <h2 title={collectionName}>Изучение: {collectionName}</h2>
    </div>
    
    {#if !loading && !error && trainingCards.length > 0 && !trainingComplete}
      <div class="progress-info">
        Карточка {currentCardIndex + 1} из {trainingCards.length}
      </div>
    {/if}
  </div>

  {#if error}
    <div class="error-state">
      <div class="error">{error}</div>
      <button on:click={onBack} class="back-to-collections">
        Вернуться к коллекциям
      </button>
    </div>
  {:else if loading}
    <div class="loading-state">
      <div class="loading">Загрузка карточек для изучения...</div>
    </div>
  {:else if trainingComplete}
    <div class="completion-state">
      <div class="completion-message">
        <h3>🎉 Поздравляем!</h3>
        <p>Вы завершили изучение всех карточек из коллекции "{collectionName}"</p>
        <p>Изучено карточек: <strong>{trainingCards.length}</strong></p>
      </div>
      
      <div class="completion-actions">
        <button on:click={restartTraining} class="restart-btn">
          🔄 Изучить еще раз
        </button>
        <button on:click={onBack} class="back-btn">
          Вернуться к коллекциям
        </button>
      </div>
    </div>
  {:else if currentCard}
    <!-- Progress bar -->
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
    
    <!-- Training card -->
    <div class="training-card">
      <div class="card-counter">
        Карточка {currentCardIndex + 1} из {trainingCards.length}
      </div>
        <div class="question-section">
        <h3>Вопрос:</h3>
        <div class="question-text" title={currentCard.question}>{currentCard.question}</div>
      </div>
      
      {#if showAnswer}
        <div class="answer-section">
          <h3>Ответ:</h3>
          <div class="answer-text" title={currentCard.answer || 'Ответ не указан'}>
            {#if currentCard.answer}
              {currentCard.answer}
            {:else}
              <span class="no-answer">Ответ не указан</span>
            {/if}
          </div>
        </div>
        
        <div class="actions">
          <button on:click={nextCard} class="next-btn">
            {currentCardIndex < trainingCards.length - 1 ? 'Следующая карточка →' : 'Завершить изучение ✓'}
          </button>
        </div>
      {:else}
        <div class="actions">
          <button on:click={showCardAnswer} class="show-answer-btn">
            Показать ответ
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .training-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 80vh;
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

  .back-btn {
    background-color: #6c757d;
    color: white;
    padding: 0.5rem 1rem;
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
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    max-height: 2.6em;
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .progress-info {
    color: #666;
    font-size: 14px;
    font-weight: 500;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #28a745;
    transition: width 0.3s ease;
  }

  .training-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 2px solid #f8f9fa;
    transition: transform 0.2s ease;
  }

  .training-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .card-counter {
    text-align: center;
    color: #6c757d;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
  }

  .question-section, .answer-section {
    margin-bottom: 2rem;
  }

  .question-section h3, .answer-section h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  }
  .question-text, .answer-text {
    font-size: 16px;
    line-height: 1.6;
    color: #555;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #007bff;
    min-height: 60px;
    max-height: 200px;
    overflow-y: auto;
    word-wrap: break-word;
    overflow-wrap: break-word;
    scrollbar-width: thin;
    scrollbar-color: #ccc transparent;
  }
  .answer-text {
    border-left-color: #28a745;
  }

  /* Стили для скроллбара в WebKit браузерах */
  .question-text::-webkit-scrollbar,
  .answer-text::-webkit-scrollbar {
    width: 6px;
  }

  .question-text::-webkit-scrollbar-track,
  .answer-text::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .question-text::-webkit-scrollbar-thumb,
  .answer-text::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  .question-text::-webkit-scrollbar-thumb:hover,
  .answer-text::-webkit-scrollbar-thumb:hover {
    background: #999;
  }

  .no-answer {
    color: #999;
    font-style: italic;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .show-answer-btn {
    background-color: #007bff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.2s;
    min-width: 200px;
  }

  .show-answer-btn:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }

  .next-btn {
    background-color: #28a745;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.2s;
    min-width: 200px;
  }

  .next-btn:hover {
    background-color: #218838;
    transform: translateY(-1px);
  }

  .loading-state, .error-state, .completion-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .loading {
    color: #666;
    font-size: 18px;
  }

  .error {
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 1rem;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 2rem;
  }

  .back-to-collections {
    background-color: #6c757d;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .completion-message {
    margin-bottom: 2rem;
  }

  .completion-message h3 {
    color: #28a745;
    font-size: 24px;
    margin-bottom: 1rem;
  }

  .completion-message p {
    color: #666;
    font-size: 16px;
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .completion-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .restart-btn {
    background-color: #17a2b8;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .restart-btn:hover {
    background-color: #138496;
  }
  @media (max-width: 768px) {
    .training-container {
      padding: 1rem;
    }
    
    .training-card {
      padding: 1.5rem;
    }

    .question-text, .answer-text {
      padding: 1rem;
      font-size: 14px;
      max-height: 150px;
    }
    
    .header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .completion-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .show-answer-btn, .next-btn {
      min-width: 180px;
      padding: 0.75rem 1.5rem;
      font-size: 14px;
    }
  }
</style>
