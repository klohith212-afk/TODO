const input = document.getElementById('todo-input');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput = document.getElementById('due-date');
const categoryInput = document.getElementById('category-input');
const addbtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');
const sortBtn = document.getElementById('sort-btn');

const saved = localStorage.getItem('todos');
const todos = saved ? JSON.parse(saved) : [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function render(filteredTodos = todos) {
    list.innerHTML = '';
    filteredTodos.forEach((todo, index) => {
        const node = createTodoNode(todo, index);
        list.appendChild(node);
    });
}

function createTodoNode(todo, index) {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!todo.completed;
    checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;
        if (todo.completed) {
            textSpan.classList.add('completed');
        } else {
            textSpan.classList.remove('completed');
        }
        saveTodos();
        applyFilters();
    });

    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';

    const textSpan = document.createElement("span");
    textSpan.className = 'task-text';
    textSpan.textContent = todo.text;
    if (todo.completed) {
        textSpan.classList.add('completed');
    }
    textSpan.addEventListener("dblclick", () => {
        const newText = prompt("Edit task", todo.text);
        if (newText !== null) {
            todo.text = newText.trim();
            textSpan.textContent = todo.text;
            saveTodos();
        }
    });

    const metaSpan = document.createElement('div');
    metaSpan.className = 'task-meta';
    let metaText = `Priority: ${todo.priority}`;
    if (todo.category) metaText += ` | Category: ${todo.category}`;
    if (todo.dueDate) {
        const due = new Date(todo.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        metaText += ` | Due: ${due.toLocaleDateString()}`;
        if (due < today && !todo.completed) {
            metaSpan.classList.add('overdue');
        }
    }
    metaSpan.textContent = metaText;

    const priorityClass = `priority-${todo.priority}`;
    textSpan.classList.add(priorityClass);

    taskDetails.appendChild(textSpan);
    taskDetails.appendChild(metaSpan);

    const delBtn = document.createElement('button');
    delBtn.textContent = "Delete";
    delBtn.addEventListener('click', () => {
        todos.splice(index, 1);
        saveTodos();
        applyFilters();
    });

    li.appendChild(checkbox);
    li.appendChild(taskDetails);
    li.appendChild(delBtn);
    return li;
}

function addTodo() {
    const text = input.value.trim();
    if (!text) return;
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;
    const category = categoryInput.value.trim();
    todos.push({
        text,
        completed: false,
        priority,
        dueDate: dueDate || null,
        category: category || null
    });
    input.value = '';
    categoryInput.value = '';
    dueDateInput.value = '';
    render();
    saveTodos();
}

function applyFilters() {
    let filtered = todos;

    // Search
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(todo =>
            todo.text.toLowerCase().includes(searchTerm) ||
            (todo.category && todo.category.toLowerCase().includes(searchTerm))
        );
    }

    // Priority filter
    const priorityFilter = filterPriority.value;
    if (priorityFilter !== 'all') {
        filtered = filtered.filter(todo => todo.priority === priorityFilter);
    }

    // Status filter
    const statusFilter = filterStatus.value;
    if (statusFilter !== 'all') {
        filtered = filtered.filter(todo =>
            statusFilter === 'completed' ? todo.completed : !todo.completed
        );
    }

    render(filtered);
}

function sortByDueDate() {
    todos.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    saveTodos();
    applyFilters();
}

// Event listeners
addbtn.addEventListener("click", addTodo);
input.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') addTodo();
});

searchInput.addEventListener('input', applyFilters);
filterPriority.addEventListener('change', applyFilters);
filterStatus.addEventListener('change', applyFilters);
sortBtn.addEventListener('click', sortByDueDate);

// Initial render
render();