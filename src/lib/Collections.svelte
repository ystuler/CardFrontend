<script lang="ts">
  import { 
    getAllCollections, 
    createCollection, 
    updateCollection, 
    deleteCollection,
    type AllCollections,
    type CreateCollectionReq,
    type UpdateCollectionReq 
  } from '$lib/api';  import { user } from '$lib/stores';
  import { onMount } from 'svelte';
  import Cards from './Cards.svelte';
  import TrainingMode from './TrainingMode.svelte';

  let collections: AllCollections[] = [];
  let loading = false;
  let error = '';
    // View state
  let selectedCollection: AllCollections | null = null;
  let trainingCollection: AllCollections | null = null;
  
  // Form state
  let showCreateForm = false;
  let editingCollection: AllCollections | null = null;
  let formData = {
    name: '',
    description: ''
  };

  onMount(async () => {
    await loadCollections();
  });

  async function loadCollections() {
    if (!$user?.token) return;
    
    loading = true;
    error = '';
    
    try {
      const response = await getAllCollections($user.token);
      collections = response.collections || [];
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ошибка загрузки коллекций';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    if (!$user?.token || !formData.name.trim()) return;
    
    loading = true;
    error = '';

    try {
      if (editingCollection) {
        // Update existing collection
        const updateData: UpdateCollectionReq = {
          id: editingCollection.id,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        };
        await updateCollection($user.token, updateData);
      } else {
        // Create new collection
        const createData: CreateCollectionReq = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        };
        await createCollection($user.token, createData);
      }
      
      await loadCollections();
      resetForm();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ошибка сохранения коллекции';
    } finally {
      loading = false;
    }
  }
  async function handleDelete(collectionId: number) {
    console.log('Delete clicked for collection:', collectionId);
    
    if (!$user?.token) {
      error = 'Нет токена авторизации';
      return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить эту коллекцию?')) {
      return;
    }
    
    loading = true;
    error = '';

    try {
      console.log('Attempting to delete collection:', collectionId);
      await deleteCollection($user.token, collectionId);
      console.log('Collection deleted successfully');
      await loadCollections();
    } catch (e) {
      console.error('Delete error:', e);
      error = e instanceof Error ? e.message : 'Ошибка удаления коллекции';
    } finally {
      loading = false;
    }
  }

  function startEdit(collection: AllCollections) {
    editingCollection = collection;
    formData = {
      name: collection.name,
      description: collection.description || ''
    };
    showCreateForm = true;
  }

  function resetForm() {
    showCreateForm = false;
    editingCollection = null;
    formData = {
      name: '',
      description: ''
    };
  }
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  function openCollection(collection: AllCollections) {
    selectedCollection = collection;
  }

  function startTraining(collection: AllCollections) {
    trainingCollection = collection;
  }

  function backToCollections() {
    selectedCollection = null;
    trainingCollection = null;
  }
</script>

{#if selectedCollection}
  <Cards 
    collectionId={selectedCollection.id} 
    collectionName={selectedCollection.name}
    onBack={backToCollections}
  />
{:else if trainingCollection}
  <TrainingMode 
    collectionId={trainingCollection.id} 
    collectionName={trainingCollection.name}
    onBack={backToCollections}
  />
{:else}

<div class="collections-container">
  <div class="header">
    <h2>Мои коллекции</h2>
    <button on:click={() => showCreateForm = true} class="create-btn" disabled={loading}>
      Создать коллекцию
    </button>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if showCreateForm}
    <div class="form-overlay">
      <div class="form-modal">
        <h3>{editingCollection ? 'Редактировать коллекцию' : 'Создать новую коллекцию'}</h3>
        
        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-group">
            <label for="name">Название *</label>
            <input 
              type="text" 
              id="name"
              bind:value={formData.name}
              placeholder="Введите название коллекции"
              required
              disabled={loading}
            />
          </div>
          
          <div class="form-group">
            <label for="description">Описание</label>
            <textarea 
              id="description"
              bind:value={formData.description}
              placeholder="Введите описание коллекции (необязательно)"
              rows="3"
              disabled={loading}
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" on:click={resetForm} disabled={loading}>
              Отмена
            </button>
            <button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Сохранение...' : (editingCollection ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <div class="collections-grid">
    {#if loading && collections.length === 0}
      <div class="loading">Загрузка коллекций...</div>
    {:else if collections.length === 0}
      <div class="empty-state">
        <p>У вас пока нет коллекций</p>
        <button on:click={() => showCreateForm = true} class="create-btn">
          Создать первую коллекцию
        </button>
      </div>
    {:else}
      {#each collections as collection (collection.id)}        <div class="collection-card">
          <div class="card-header">
            <h3 title={collection.name}>{collection.name}</h3>
            <div class="card-actions">
              <button 
                on:click={() => startEdit(collection)} 
                class="edit-btn" 
                title="Редактировать"
                disabled={loading}
              >
                ✏️
              </button>
              <button 
                on:click|stopPropagation={() => handleDelete(collection.id)} 
                class="delete-btn" 
                title="Удалить"
                disabled={loading}
              >
                🗑️
              </button>
            </div>
          </div>
            {#if collection.description}
            <p class="description" title={collection.description}>{collection.description}</p>
          {/if}<div class="card-footer">
            <span class="created-date">Создано: {formatDate(collection.created_at)}</span>
            <div class="footer-actions">
              <button 
                on:click={() => startTraining(collection)} 
                class="train-btn"
                disabled={loading}
                title="Начать изучение карточек"
              >
                🎓 Учить
              </button>
              <button 
                on:click={() => openCollection(collection)} 
                class="view-cards-btn"
                disabled={loading}
              >
                Открыть карточки
              </button>
            </div>
          </div>
        </div>
      {/each}
    {/if}  </div>
</div>

{/if}

<style>
  .collections-container {
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

  .header h2 {
    margin: 0;
    color: #333;
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
    max-width: 500px;
    margin: 1rem;
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

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
  }

  .form-group input:focus,
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
  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .collections-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .collection-card {
      margin: 0;
    }
    
    .card-header {
      align-items: flex-start;
    }
    
    .card-header h3 {
      font-size: 16px;
      margin-right: 0.5rem;
    }
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

  .collection-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .collection-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  .card-header h3 {
    margin: 0;
    color: #333;
    flex: 1;
    margin-right: 1rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    line-height: 1.3;
    max-height: 2.6em; /* Примерно 2 строки */
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
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
  .description {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-height: 4.2em; /* Примерно 3 строки */
  }.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #eee;
    padding-top: 1rem;
  }

  .footer-actions {
    display: flex;
    gap: 0.5rem;
  }

  .created-date {
    color: #999;
    font-size: 12px;
  }

  .train-btn {
    background-color: #17a2b8;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
  }

  .train-btn:hover:not(:disabled) {
    background-color: #138496;
  }

  .train-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .view-cards-btn {
    background-color: #007bff;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
  }

  .view-cards-btn:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .view-cards-btn:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
</style>
