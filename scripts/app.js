// scripts/app.js
const API_URL = 'https://dummyjson.com/todos';

document.addEventListener('DOMContentLoaded', async () => {
  // --- User Profile ---
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Show welcome or welcome back message
  const firstLogin = localStorage.getItem('firstLogin');
  if (firstLogin === 'true') {
    showToast(`Welcome, ${user.name}!`);
    localStorage.setItem('firstLogin', 'false');
  } else {
    showToast(`Welcome back, ${user.name}!`);
  }

  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-avatar').src =
    `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`;

  document.getElementById('sign-out').onclick = () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  };

  // --- Tasks State ---
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentPriorityFilter = 'all'; // Default: show all priorities

  // Initial dummy data if first visit
  if (tasks.length === 0) {
    const response = await fetch(API_URL);
    const data = await response.json();
    tasks = data.todos.slice(0, 5).map(todo => ({
      id: Date.now() + Math.random(),
      title: todo.todo,
      priority: '2', // Default to medium priority
      stage: 'todo',
      lastModified: new Date().toLocaleString()
    }));
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // --- Elements ---
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const priorityInput = document.getElementById('priority-input');
  const filterPriority = document.getElementById('filter-priority');

  // Setup filter change listener
  filterPriority.addEventListener('change', () => {
    currentPriorityFilter = filterPriority.value;
    renderTasks();
  });

  // --- Render All Tasks ---
  function renderTasks() {
    ['todo', 'completed', 'archived'].forEach(stage => {
      const container = document.getElementById(`${stage}-tasks`);
      container.innerHTML = '';
      let stageTasks = tasks.filter(t => t.stage === stage);

      // Apply priority filter
      if (currentPriorityFilter !== 'all') {
        stageTasks = stageTasks.filter(t => t.priority === currentPriorityFilter);
      }

      document.getElementById(`${stage}-count`).textContent = stageTasks.length;
      stageTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
          <div class="task-title">
            ${task.title}
            <span class="priority-tag priority-${task.priority}">
              ${getPriorityLabel(task.priority)}
            </span>
          </div>
          <div class="timestamp">${task.lastModified}</div>
          <div class="task-actions">${getActions(task)}</div>
        `;
        // Animate card in
        card.style.opacity = 0;
        setTimeout(() => { card.style.opacity = 1; }, 50);

        container.appendChild(card);

        // Action buttons
        card.querySelectorAll('button').forEach(btn => {
          btn.onclick = () => handleAction(task.id, btn.dataset.action);
        });
      });
    });
  }

  function getPriorityLabel(priority) {
    switch(priority) {
      case '3': return 'High';
      case '2': return 'Medium';
      case '1': return 'Low';
      default: return '';
    }
  }

  function getActions(task) {
    if (task.stage === 'todo') {
      return `
        <button data-action="complete" title="Mark as Completed">✔️</button>
        <button data-action="archive" title="Archive">🗄️</button>
      `;
    }
    if (task.stage === 'completed') {
      return `
        <button data-action="todo" title="Move to Todo">↩️</button>
        <button data-action="archive" title="Archive">🗄️</button>
      `;
    }
    if (task.stage === 'archived') {
      return `
        <button data-action="todo" title="Move to Todo">↩️</button>
        <button data-action="complete" title="Move to Completed">✔️</button>
      `;
    }
    return '';
  }

  function handleAction(id, action) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    if (action === 'complete') tasks[idx].stage = 'completed';
    if (action === 'archive') tasks[idx].stage = 'archived';
    if (action === 'todo') tasks[idx].stage = 'todo';
    tasks[idx].lastModified = new Date().toLocaleString();
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    showToast('Task updated!');
  }

  // --- Add Task ---
  taskForm.onsubmit = e => {
    e.preventDefault();
    const title = taskInput.value.trim();
    const priority = priorityInput.value;

    if (!title) {
      showToast('Task cannot be empty.', true);
      return;
    }
    if (!priority) {
      showToast('Please select a priority.', true);
      return;
    }

    tasks.push({
      id: Date.now() + Math.random(),
      title,
      priority,
      stage: 'todo',
      lastModified: new Date().toLocaleString()
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskInput.value = '';
    priorityInput.value = '';
    renderTasks();
    showToast('Task added!');
  };

  // --- Toast Notification ---
  function showToast(message, isError = false) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = isError ? '#ff6b6b' : '#6C63FF';
    toast.style.color = '#fff';
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '0.8em 2em';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '1.05em';
    toast.style.boxShadow = '0 2px 12px rgba(44,62,80,0.10)';
    toast.style.zIndex = 9999;
    toast.style.opacity = 1;
    setTimeout(() => { toast.style.opacity = 0; }, 1500);
  }

  renderTasks();
});
