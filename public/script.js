// Global state
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let sortBy = localStorage.getItem("sortBy") || "input";

// DOM elements
const form = document.querySelector(".add-form");
const todoInput = document.querySelector('input[name="todo"]');
const todoList = document.querySelector(".main ul");
const sortSelect = document.querySelector('select[name="sort"]');
const clearButton = document.querySelector('button[name="clear"]');
const statsFooter = document.querySelector(".stats");

// Event listeners
form.addEventListener("submit", handleSubmit);
sortSelect.addEventListener("change", handleSort);
clearButton.addEventListener("click", handleClearList);

// Initialize
updateUI();

function handleSubmit(e) {
  e.preventDefault();

  const description = todoInput.value;

  if (!description) return;

  const newTodo = { description, completed: false, id: Date.now() };
  todos.push(newTodo);

  todoInput.value = "";

  saveToLocalStorage();
  updateUI();
}

function handleDeleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveToLocalStorage();
  updateUI();
}

function handleToggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveToLocalStorage();
  updateUI();
}

function handleSort(e) {
  sortBy = e.target.value;
  localStorage.setItem("sortBy", sortBy);
  updateUI();
}

function handleClearList() {
  const confirmed = window.confirm(
    "Are you sure you want to delete all todos?"
  );
  if (confirmed) {
    todos = [];
    saveToLocalStorage();
    updateUI();
  }
}

function getSortedTodos() {
  if (sortBy === "input") return todos;
  if (sortBy === "description")
    return [...todos].sort((a, b) =>
      a.description.localeCompare(b.description)
    );
  if (sortBy === "completed")
    return [...todos].sort((a, b) => Number(a.completed) - Number(b.completed));
}

function updateUI() {
  // Update list
  const sortedTodos = getSortedTodos();
  todoList.innerHTML = sortedTodos
    .map(
      (todo) => `
        <li>
            <input type="checkbox" ${
              todo.completed ? "checked" : ""
            } onchange="handleToggleTodo(${todo.id})">
            <div>
              <span style="${
                todo.completed ? "text-decoration: line-through" : ""
              }">${todo.description}</span>
              <button onclick="handleDeleteTodo(${todo.id})">❌</button>
            </div>
        </li>
    `
    )
    .join("");

  // Update stats
  if (todos.length === 0) {
    statsFooter.innerHTML = "<em>Start adding some todos to your list 📝</em>";
  } else {
    const numTodos = todos.length;
    const numCompleted = todos.filter((todo) => todo.completed).length;
    const percentage = Math.round((numCompleted / numTodos) * 100);

    statsFooter.innerHTML =
      percentage === 100
        ? "<em>All tasks completed! Great job! 🎉</em>"
        : `<em>📊 You have ${numTodos} todos on your list, and you've completed ${numCompleted} (${percentage}%)</em>`;
  }

  // Update sort select
  sortSelect.value = sortBy;
}

function saveToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
