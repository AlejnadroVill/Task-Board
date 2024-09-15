// Retrieve tasks and nextId from localStorage
let taskCollection = JSON.parse(localStorage.getItem("taskCollection")) || [];
let nextTaskId = JSON.parse(localStorage.getItem("nextTaskId")) || 1;

// Function to generate a unique task id
function getNewTaskId() {
  // Increment the taskId by 1 for each new task
  nextTaskId++;
  // Store the updated taskId in localStorage
  localStorage.setItem("nextTaskId", JSON.stringify(nextTaskId));
  return nextTaskId;
}

// Function to build a task card
function buildTaskCard(task) {
  // Create card elements dynamically
  const card = $("<div>")
    .addClass("card task-card resizable my-3")
    .attr("data-task-id", task.id);
  const header = $("<div>").addClass("card-header task-title").text(task.title);
  const body = $("<div>").addClass("card-body");
  const description = $("<p>").addClass("card-details").text(task.description);
  const dueDate = $("<p>").addClass("card-details").text(task.dueDate);
  const removeButton = $("<button>")
    .addClass("btn btn-outline-danger delete-btn")
    .text("Remove")
    .attr("data-task-id", task.id);

  // Attach the delete event handler to the remove button
  removeButton.on("click", removeTaskHandler);

  // Change card colors based on due date
  if (task.dueDate && task.status !== "finished") {
    const today = dayjs();
    const taskDue = dayjs(task.dueDate, "MM/DD/YYYY");
    if (today.isSame(taskDue, "day")) {
      card.addClass("bg-warning text-dark");
    } else if (today.isAfter(taskDue)) {
      card.addClass("bg-danger text-white");
      removeButton.addClass("border-light");
    }
  }

  // Append elements to card body and then append to the main card element
  body.append(description, dueDate, removeButton);
  card.append(header, body);

  return card;
}

// Function to render the task list and make cards draggable
function displayTaskCollection() {
  // Clear existing task cards from each lane
  $("#pending-tasks").empty();
  $("#ongoing-tasks").empty();
  $("#completed-tasks").empty();

  // Loop through the taskCollection and render each task in the correct lane
  taskCollection.forEach((task) => {
    const taskElement = buildTaskCard(task);
    if (task.status === "pending") {
      $("#pending-tasks").append(taskElement);
    } else if (task.status === "ongoing") {
      $("#ongoing-tasks").append(taskElement);
    } else if (task.status === "completed") {
      $("#completed-tasks").append(taskElement);
    }
  });

  // Make task cards draggable
  $(".resizable").draggable({
    opacity: 0.6,
    zIndex: 50,
    helper: function (event) {
      const element = $(event.target).hasClass("resizable")
        ? $(event.target)
        : $(event.target).closest(".resizable");
      return element.clone().css({
        width: element.outerWidth(),
      });
    },
  });
}

// Function to handle adding a new task
function addTaskHandler(event) {
  event.preventDefault();

  // Create a new task object with form inputs
  const newTask = {
    id: getNewTaskId(),
    title: $("#taskNameInput").val(),
    description: $("#taskDescInput").val(),
    dueDate: $("#taskDueDateInput").val(),
    status: "pending",
  };

  // Add the new task to the taskCollection
  taskCollection.push(newTask);
  localStorage.setItem("taskCollection", JSON.stringify(taskCollection));

  // Re-render the task list and clear input fields
  displayTaskCollection();
  $("#taskNameInput").val("");
  $("#taskDescInput").val("");
  $("#taskDueDateInput").val("");
}

// Function to handle deleting a task
function removeTaskHandler(event) {
  event.preventDefault();

  // Retrieve the task ID from the button clicked
  const taskIdToDelete = $(this).attr("data-task-id");

  // Remove the task from the collection
  taskCollection = taskCollection.filter(
    (task) => task.id !== parseInt(taskIdToDelete)
  );

  // Update localStorage and re-render the task list
  localStorage.setItem("taskCollection", JSON.stringify(taskCollection));
  displayTaskCollection();
}

// Function to handle dropping a task into a new status lane
function dropTaskHandler(event, ui) {
  // Get the task ID and new status based on where the task is dropped
  const droppedTaskId = ui.draggable.attr("data-task-id");
  const newLane = event.target.id;

  // Update task status in the collection
  taskCollection.forEach((task) => {
    if (task.id === parseInt(droppedTaskId)) {
      task.status = newLane;
    }
  });

  // Save updated tasks and re-render
  localStorage.setItem("taskCollection", JSON.stringify(taskCollection));
  displayTaskCollection();
}

// Initialize the application
$(document).ready(function () {
  // Render tasks on page load
  displayTaskCollection();

  // Event listener for adding tasks
  $("#addTaskForm").on("submit", addTaskHandler);

  // Make task lanes droppable
  $(".lane").droppable({
    accept: ".resizable",
    drop: dropTaskHandler,
  });

  // Initialize date picker for task due date
  $("#taskDueDateInput").datepicker({
    changeMonth: true,
    changeYear: true,
    dateFormat: "mm/dd/yy", // Ensure the format matches your task's dueDate format
  });
});
