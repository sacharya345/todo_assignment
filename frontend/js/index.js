// API URL - change this to match your backend server address
const API_URL = "http://localhost:3000/api"

// DOM Elements
const taskList = document.querySelector("#taskList")
const todoForm = document.querySelector("#todoForm")
const taskInput = document.querySelector("#taskInput")
const statusMessage = document.querySelector("#statusMessage")

// Show status message
function showMessage(message, isError = false) {
  statusMessage.textContent = message
  statusMessage.classList.remove("d-none", "alert-success", "alert-danger")
  statusMessage.classList.add(isError ? "alert-danger" : "alert-success")

  // Hide message after 3 seconds
  setTimeout(() => {
    statusMessage.classList.add("d-none")
  }, 3000)
}

// Create a todo item element
function createTodoElement(todo) {
  const listItem = document.createElement("li")
  listItem.className = "list-group-item todo-item"
  listItem.dataset.id = todo.id

  // Checkbox for completion status
  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.className = "form-check-input"
  checkbox.checked = todo.completed
  checkbox.addEventListener("change", () => toggleTodoStatus(todo.id, checkbox.checked))

  // Todo text
  const todoText = document.createElement("span")
  todoText.className = `todo-text ${todo.completed ? "completed" : ""}`
  todoText.textContent = todo.task

  // Delete button
  const deleteBtn = document.createElement("span")
  deleteBtn.className = "btn-action text-danger"
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id))

  // Actions container
  const actionsDiv = document.createElement("div")
  actionsDiv.className = "todo-actions"
  actionsDiv.appendChild(deleteBtn)

  // Add all elements to the list item
  listItem.appendChild(checkbox)
  listItem.appendChild(todoText)
  listItem.appendChild(actionsDiv)

  return listItem
}

// Fetch all todos from the API
async function fetchTodos() {
  try {
    taskList.classList.add("loading")
    const response = await fetch(`${API_URL}/todos`)

    if (!response.ok) {
      throw new Error("Failed to fetch todos")
    }

    const todos = await response.json()

    // Clear the current list
    taskList.innerHTML = ""

    // Add each todo to the list
    todos.forEach((todo) => {
      taskList.appendChild(createTodoElement(todo))
    })

    if (todos.length === 0) {
      const emptyMessage = document.createElement("li")
      emptyMessage.className = "list-group-item text-center text-muted"
      emptyMessage.textContent = "No tasks yet. Add one above!"
      taskList.appendChild(emptyMessage)
    }
  } catch (error) {
    console.error("Error fetching todos:", error)
    showMessage("Failed to load tasks. Please try again.", true)
  } finally {
    taskList.classList.remove("loading")
  }
}

// Add a new todo
async function addTodo(task) {
  try {
    const response = await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    })

    if (!response.ok) {
      throw new Error("Failed to add todo")
    }

    const newTodo = await response.json()

    // If this is the first todo, clear the "No tasks yet" message
    if (taskList.querySelector(".text-muted")) {
      taskList.innerHTML = ""
    }

    // Add the new todo to the list
    taskList.prepend(createTodoElement(newTodo))
    showMessage("Task added successfully!")
  } catch (error) {
    console.error("Error adding todo:", error)
    showMessage("Failed to add task. Please try again.", true)
  }
}

// Toggle todo completion status
async function toggleTodoStatus(id, completed) {
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed }),
    })

    if (!response.ok) {
      throw new Error("Failed to update todo")
    }

    const updatedTodo = await response.json()

    // Update the UI
    const todoItem = taskList.querySelector(`li[data-id="${id}"]`)
    const todoText = todoItem.querySelector(".todo-text")

    if (updatedTodo.completed) {
      todoText.classList.add("completed")
    } else {
      todoText.classList.remove("completed")
    }

    showMessage("Task updated successfully!")
  } catch (error) {
    console.error("Error updating todo:", error)
    showMessage("Failed to update task. Please try again.", true)

    // Revert the checkbox state
    const todoItem = taskList.querySelector(`li[data-id="${id}"]`)
    const checkbox = todoItem.querySelector('input[type="checkbox"]')
    checkbox.checked = !completed
  }
}

// Delete a todo
async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete todo")
    }

    // Remove the todo from the UI
    const todoItem = taskList.querySelector(`li[data-id="${id}"]`)
    todoItem.remove()

    // If no todos left, show the "No tasks yet" message
    if (taskList.children.length === 0) {
      const emptyMessage = document.createElement("li")
      emptyMessage.className = "list-group-item text-center text-muted"
      emptyMessage.textContent = "No tasks yet. Add one above!"
      taskList.appendChild(emptyMessage)
    }

    showMessage("Task deleted successfully!")
  } catch (error) {
    console.error("Error deleting todo:", error)
    showMessage("Failed to delete task. Please try again.", true)
  }
}

// Event Listeners
todoForm.addEventListener("submit", (event) => {
  event.preventDefault()

  const taskText = taskInput.value.trim()

  if (taskText !== "") {
    addTodo(taskText)
    taskInput.value = ""
  }
})

// Initialize the app
document.addEventListener("DOMContentLoaded", fetchTodos)
