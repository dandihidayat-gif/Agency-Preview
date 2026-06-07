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
      <td class="task-actions">

  <button class="action-btn move-up" data-id="${task.id}">
    <img src="icons/up.svg" alt="">
  </button>

  <button class="action-btn move-down" data-id="${task.id}">
    <img src="icons/down.svg" alt="">
  </button>

  <button class="action-btn task-menu-btn" data-id="${task.id}">
    <img src="icons/threedot.svg" alt="">
  </button>

</td>
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

const addLinkRowBtn = document.getElementById("addLinkRow");
const saveTaskBtn = document.getElementById("saveTask");
const taskLinks = document.getElementById("taskLinks");

if(addLinkRowBtn){
  addLinkRowBtn.addEventListener("click", () => {
    const currentRows = taskLinks.querySelectorAll(".task-link-row");

    if(currentRows.length >= 3){
      alert("Maksimal 3 link.");
      return;
    }

    const row = document.createElement("div");
    row.className = "task-link-row";

    row.innerHTML = `
      <input type="text" placeholder="Nama Link" class="link-name">
      <input type="text" placeholder="https://..." class="link-url">
    `;

    taskLinks.appendChild(row);
  });
}

if(saveTaskBtn){
  saveTaskBtn.addEventListener("click", async () => {
    const projectId = document.getElementById("taskProject").value;
    const taskName = document.getElementById("taskName").value.trim();
    const deadline = document.getElementById("taskDeadline").value;
    const noDeadline = document.getElementById("noDeadline").checked;

    if(!projectId || !taskName){
      alert("Project dan nama task wajib diisi.");
      return;
    }

    if(!noDeadline && !deadline){
      alert("Isi deadline atau centang No Deadline.");
      return;
    }

    const linkRows = taskLinks.querySelectorAll(".task-link-row");

    const links = Array.from(linkRows)
      .map(row => {
        return {
          name: row.querySelector(".link-name").value.trim(),
          url: row.querySelector(".link-url").value.trim()
        };
      })
      .filter(link => link.name || link.url);

    const user = await getCurrentUser();

    const maxSort =
      tasks.length > 0
        ? Math.max(...tasks.map(task => task.sort_order || 0))
        : 0;

    const { error } = await supabaseClient
      .from("tasks")
      .insert({
        user_id: user.id,
        project_id: Number(projectId),
        task: taskName,
        deadline: noDeadline ? null : deadline,
        no_deadline: noDeadline,
        status: "pending",
        links,
        sort_order: maxSort + 1
      });

    if(error){
      console.log(error);
      alert("Gagal membuat task.");
      return;
    }

    document.getElementById("taskName").value = "";
    document.getElementById("taskDeadline").value = "";
    document.getElementById("noDeadline").checked = false;

    taskLinks.innerHTML = `
      <div class="task-link-row">
        <input type="text" placeholder="Nama Link" class="link-name">
        <input type="text" placeholder="https://..." class="link-url">
      </div>
    `;

    taskModal.classList.remove("active");

    await loadTasks();
    renderTasks();
  });
}
