let tasks = [];

const todoBtn = document.getElementById("todoBtn");
const plannerBtn = document.getElementById("homeBtn");
const todoView = document.getElementById("todoView");

if(todoBtn){
  todoBtn.addEventListener("click", () => {
    document.querySelector(".main-content").style.display = "none";
    todoView.style.display = "block";
  });
}

if(plannerBtn){
  plannerBtn.addEventListener("click", () => {
    todoView.style.display = "none";
    document.querySelector(".main-content").style.display = "block";
  });
}
