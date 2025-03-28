// Get references to UI elements
const taskList = document.querySelector("#taskList")
const taskInput = document.querySelector("#taskInput")

// Add event listener for the input field
taskInput.addEventListener("keypress", (event) => {
  // Check if the Enter key was pressed
  if (event.key === "Enter") {
    event.preventDefault() // Prevent form submission

    // Get the input value
    const taskText = taskInput.value.trim()

    // Only add task if the input is not empty
    if (taskText !== "") {
      // Create a new list item
      const listItem = document.createElement("li")
      listItem.className = "list-group-item"
      listItem.textContent = taskText

      // Add the new item to the list
      taskList.appendChild(listItem)

      // Clear the input field
      taskInput.value = ""
    }
  }
})
