const SUPABASE_URL = "https://tvtgizvkgodeiwmpbitb.supabase.co";
const SUPABASE_KEY = "sb_publishable_pTHu3X1wSLHQYsnxb-u4LA_RdpE9YRV";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("Supabase connected:", supabaseClient);

const loginPage = document.getElementById("loginPage");
const app = document.getElementById("app");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

function showApp() {
  if (loginPage) {
    loginPage.style.display = "none";
  }

  if (app) {
    app.classList.add("is-logged-in");
  }
}

async function checkSession() {
    const { data } = await supabaseClient.auth.getSession();
  
    if (data.session) {
      showApp();
      await loadProjects();
await loadPosts();
renderCalendar();
    }
  }

checkSession();

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      loginError.textContent = "Email atau password salah.";
      return;
    }

    showApp();
await loadProjects();
await loadPosts();
renderCalendar();
  });
}
const projectList = document.getElementById("projectList");
const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");

const homeBtn = document.getElementById("homeBtn");
const calendarView = document.getElementById("calendarView");
const editProjectView = document.getElementById("editProjectView");

const projectModal = document.getElementById("projectModal");
const postModal = document.getElementById("postModal");
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const postDetailModal = document.getElementById("postDetailModal");

const postProject = document.getElementById("postProject");
const postDate = document.getElementById("postDate");

const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn){
    logoutBtn.addEventListener("click", async () => {
  
      await supabaseClient.auth.signOut();
  
      location.reload();
  
    });
  }

let currentDate = new Date(2026, 0, 1);
let selectedProjectId = null;
let selectedPostId = null;

let projects = JSON.parse(localStorage.getItem("projects")) || [
  {
    id: 1,
    name: "Luna Creative",
    color: "#3366FF",
    logo: ""
  }
];

let posts = JSON.parse(localStorage.getItem("posts")) || [];

async function getCurrentUser(){
    const { data } = await supabaseClient.auth.getUser();
    return data.user;
  }
  
  async function loadProjects(){

    const { data, error } = await supabaseClient
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true });
  
    if(error){
      console.log(error);
      return;
    }
  
    projects = data || [];
  
    renderProjects();
    renderCalendar();
  }
  
  async function loadPosts(){
  
    const { data, error } = await supabaseClient
      .from("posts")
      .select("*")
      .order("date", { ascending: true });
  
    if(error){
      console.log(error);
      return;
    }
  
    posts = data || [];
  }

  function saveData(){
    localStorage.setItem("projects", JSON.stringify(projects));
    localStorage.setItem("posts", JSON.stringify(posts));
  }
function hexToRgba(hex, opacity){
  let cleanHex = hex.replace("#", "");

  if(cleanHex.length !== 6){
    return `rgba(51, 102, 255, ${opacity})`;
  }

  let r = parseInt(cleanHex.substring(0,2), 16);
  let g = parseInt(cleanHex.substring(2,4), 16);
  let b = parseInt(cleanHex.substring(4,6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function showCalendar(){
  calendarView.classList.add("active");
  editProjectView.classList.remove("active");
  homeBtn.classList.add("active");
  selectedProjectId = null;
  renderProjects();
}

function showProjectSettings(projectId){
  selectedProjectId = projectId;

  const project = projects.find(p => p.id === projectId);
  if(!project) return;

  calendarView.classList.remove("active");
  editProjectView.classList.add("active");
  homeBtn.classList.remove("active");

  document.getElementById("editProjectName").value = project.name;
  document.getElementById("editProjectColor").value = project.color;

  renderProjects();
}

function renderProjects(){
  projectList.innerHTML = "";

  projects.forEach(project => {
    const btn = document.createElement("button");
    btn.className = "project-item";

    if(project.id === selectedProjectId){
      btn.classList.add("active");
    }

    btn.innerHTML = `
      ${
        project.logo
          ? `<img src="${project.logo}" class="project-logo">`
          : `<span class="project-dot" style="background:${project.color}"></span>`
      }
      <span>${project.name}</span>
    `;

    btn.addEventListener("click", () => {
      showProjectSettings(project.id);
    });

    projectList.appendChild(btn);
  });

  renderProjectOptions();
}

function renderProjectOptions(){
  postProject.innerHTML = "";

  projects.forEach(project => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;

    postProject.appendChild(option);
  });
}

function renderCalendar(){
  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  monthTitle.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  for(let i = 0; i < startDay; i++){
    const empty = document.createElement("div");
    empty.className = "calendar-day empty-day";
    calendarGrid.appendChild(empty);
  }

  for(let day = 1; day <= lastDate; day++){
    const dateString = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    const dayBox = document.createElement("div");
    dayBox.className = "calendar-day";

    dayBox.innerHTML = `
      <div class="date-row">
        <span class="day-number">${day}</span>
        <button class="add-day-post" data-date="${dateString}">+</button>
      </div>
    `;

    const dayPosts = posts.filter(post => post.date === dateString);

    dayPosts.forEach(post => {
        const project = projects.find(p => p.id === Number(post.project_id || post.projectId));
      if(!project) return;

      const chip = document.createElement("div");
      chip.className = "post-chip";

      const project = projects.find(
  p => p.id === Number(post.project_id || post.projectId)
);

const projectName = project ? project.name : "No Project";

chip.innerHTML = post.status === "posted"
  ? `${projectName} <span class="check-icon">✓</span>`
  : projectName;

      chip.title = `${post.title} - ${post.platforms.join(", ")}`;
      chip.style.color = project.color;
      chip.style.background = hexToRgba(project.color, 0.2);

      chip.addEventListener("click", () => {
        openPostDetail(post.id);
      });

      dayBox.appendChild(chip);
    });

    calendarGrid.appendChild(dayBox);
  }

  document.querySelectorAll(".add-day-post").forEach(btn => {
    btn.addEventListener("click", () => {
      openPostModal(btn.dataset.date);
    });
  });
}

function openPostModal(date = ""){
  if(projects.length === 0){
    alert("Buat project dulu ya.");
    return;
  }

  postDate.value = date;
  document.getElementById("postTitle").value = "";
  document.getElementById("postType").value = "Feed";

  document.querySelectorAll(".checkbox-group input").forEach(cb => {
    cb.checked = false;
  });

  renderProjectOptions();

  postModal.classList.add("active");
}



function openPostDetail(postId){
    
  selectedPostId = postId;

  const post = posts.find(p => p.id === postId);
  if(!post) return;

  const project = projects.find(p => p.id === Number(post.projectId));

  document.getElementById("detailProjectName").textContent = project ? project.name : "-";
  document.getElementById("detailPostDate").textContent = post.date;
  document.getElementById("detailPostType").textContent = post.content_type || post.contentType;
  document.getElementById("detailPostLink").value = post.link || "";
  document.getElementById("detailPostStatus").value = post.status || "unposted";

const deletePostBtn = document.getElementById("deletePostBtn");

if(deletePostBtn){
  deletePostBtn.style.display =
    (post.status || "unposted") === "unposted"
      ? "inline-flex"
      : "none";
}

postDetailModal.classList.add("active");
}

homeBtn.addEventListener("click", showCalendar);

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

document.getElementById("openProjectModal").addEventListener("click", () => {
  projectModal.classList.add("active");
});

document.getElementById("closeProjectModal").addEventListener("click", () => {
  projectModal.classList.remove("active");
});

document.getElementById("addProject").addEventListener("click", async () => {
  const name = document.getElementById("projectName").value.trim();
  const color = document.getElementById("projectColor").value.trim();
  const logoFile = document.getElementById("projectLogo").files[0];

  if(!name || !color){
    alert("Nama project dan warna wajib diisi.");
    return;
  }

  const createProject = async (logo = "") => {

    const user = await getCurrentUser();
  
    const { error } = await supabaseClient
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        color,
        logo
      });
  
    if(error){
      console.log(error);
      alert("Gagal menyimpan project");
      return;
    }
  
    await loadProjects();
  
    document.getElementById("projectName").value = "";
    document.getElementById("projectColor").value = "";
    document.getElementById("projectLogo").value = "";
  
    projectModal.classList.remove("active");
  };

  if(logoFile){
    const reader = new FileReader();

    reader.onload = async () => {
        await createProject(reader.result);
      };

    reader.readAsDataURL(logoFile);
  } else {
    await createProject();
  }
});

document.getElementById("openPostModal").addEventListener("click", () => {
  openPostModal();
});

document.getElementById("closePostModal").addEventListener("click", () => {
  postModal.classList.remove("active");
});

document.getElementById("addPost").addEventListener("click", async () => {
  const projectId = postProject.value;
  const date = postDate.value;
  const title = document.getElementById("postTitle").value.trim();
  const contentType = document.getElementById("postType").value;

  const platforms = Array.from(
    document.querySelectorAll(".checkbox-group input:checked")
  ).map(cb => cb.value);

  if(!projectId || !date || !title || platforms.length === 0){
    alert("Project, tanggal, judul konten, dan platform wajib diisi.");
    return;
  }

  const user = await getCurrentUser();

const { error } = await supabaseClient
  .from("posts")
  .insert({
    user_id: user.id,
    project_id: Number(projectId),
    date,
    title,
    content_type: contentType,
    platforms,
    status: "unposted",
    link: ""
  });

if(error){
  console.log(error);
  alert("Gagal menyimpan post");
  return;
}

await loadPosts();
renderCalendar();

  postModal.classList.remove("active");
});

document.getElementById("saveProjectChanges").addEventListener("click", () => {
  const project = projects.find(p => p.id === selectedProjectId);
  if(!project) return;

  const newColor = document.getElementById("editProjectColor").value.trim();
  const logoFile = document.getElementById("editProjectLogo").files[0];

  const saveProject = (logo = null) => {
    project.color = newColor;

    if(logo){
      project.logo = logo;
    }

    saveData();
    renderProjects();
    renderCalendar();

    alert("Project berhasil disimpan.");
  };

  if(logoFile){
    const reader = new FileReader();

    reader.onload = () => {
      saveProject(reader.result);
    };

    reader.readAsDataURL(logoFile);
  } else {
    saveProject();
  }
});

document.getElementById("deleteProject").addEventListener("click", () => {
  deleteConfirmModal.classList.add("active");
});

document.getElementById("cancelDelete").addEventListener("click", () => {
  deleteConfirmModal.classList.remove("active");
});

document.getElementById("confirmDelete").addEventListener("click", () => {
  projects = projects.filter(p => p.id !== selectedProjectId);
  posts = posts.filter(post => post.projectId !== selectedProjectId);

  saveData();

  deleteConfirmModal.classList.remove("active");
  showCalendar();
  renderCalendar();
});

document.getElementById("closeDetailModal").addEventListener("click", () => {
  postDetailModal.classList.remove("active");
});

document.getElementById("savePostStatus").addEventListener("click", () => {
  const post = posts.find(p => p.id === selectedPostId);
  if(!post) return;

  post.status = document.getElementById("detailPostStatus").value;
  post.link = document.getElementById("detailPostLink").value.trim();

  saveData();
  renderCalendar();

  postDetailModal.classList.remove("active");
});

const deletePostBtn = document.getElementById("deletePostBtn");

if(deletePostBtn){
  deletePostBtn.addEventListener("click", () => {
    const yakin = confirm("Yakin ingin menghapus post ini?");

    if(!yakin) return;

    posts = posts.filter(post => post.id !== selectedPostId);

    saveData();
    renderCalendar();

    postDetailModal.classList.remove("active");
  });
}

