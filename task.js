/*let tasks = [];

const todoBtn = document.getElementById("todoBtn");
const plannerBtn = document.getElementById("homeBtn");
const todoView = document.getElementById("todoView");

if(todoBtn){
  todoBtn.addEventListener("click", () => {

    plannerBtn.classList.remove("active");
    todoBtn.classList.add("active");

    document.querySelector(".main-content").style.display = "none";
    todoView.style.display = "block";
  });
}

if(plannerBtn){
  plannerBtn.addEventListener("click", () => {

    todoBtn.classList.remove("active");
    plannerBtn.classList.add("active");

    todoView.style.display = "none";
    document.querySelector(".main-content").style.display = "block";
  });
}
*/

let tasks = [];

const todoBtn = document.getElementById("todoBtn");
const plannerBtn = document.getElementById("homeBtn");
const todoView = document.getElementById("todoView");
const taskTableBody = document.getElementById("taskTableBody");

if(todoBtn){
  todoBtn.addEventListener("click", async () => {
    plannerBtn.classList.remove("active");
    todoBtn.classList.add("active");

    document.getElementById("calendarView").style.display = "none";
document.getElementById("editProjectView").style.display = "none";
todoView.style.display = "block";

    await loadTasks();
    renderTasks();
  });
}

if(plannerBtn){
  plannerBtn.addEventListener("click", () => {
    todoBtn.classList.remove("active");
    plannerBtn.classList.add("active");

    todoView.style.display = "none";
document.getElementById("editProjectView").style.display = "none";
document.getElementById("calendarView").style.display = "block";
  });
}

async function loadTasks(){
  const { data, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .order("sort_order", { ascending:true })
    .order("created_at", { ascending:true });

  if(error){
    console.log(error);
    return;
  }

  tasks = data || [];
}

function renderTasks(){
  if(!taskTableBody) return;

  taskTableBody.innerHTML = "";

  tasks.forEach((task, index) => {
    const project = projects.find(
      p => String(p.id) === String(task.project_id)
    );

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${project ? project.name : "-"}</td>
      <td>${task.task}</td>
      <td>${task.no_deadline ? "No Deadline" : task.deadline || "-"}</td>
      <td>${task.status}</td>
      <td>-</td>
    `;

    taskTableBody.appendChild(tr);
  });
}


const openTaskModal = document.getElementById("openTaskModal");
const taskModal = document.getElementById("taskModal");
const taskProject = document.getElementById("taskProject");

if(openTaskModal){
  openTaskModal.addEventListener("click", () => {
    taskProject.innerHTML = `<option value="">Pilih Project</option>`;

    projects.forEach(project => {
      taskProject.innerHTML += `
        <option value="${project.id}">
          ${project.name}
        </option>
      `;
    });

    taskModal.classList.add("active");
  });
}

const closeTaskModal = document.getElementById("closeTaskModal");

if(closeTaskModal){
  closeTaskModal.addEventListener("click", () => {
    taskModal.classList.remove("active");
  });
}
