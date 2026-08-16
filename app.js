// Task 5: 새로고침해도 데이터 유지되는 저장 기능 추가
// - localStorage(브라우저 저장소)를 사용해서, 할 일 목록/완료 상태를
//   저장하고, 페이지를 열 때 불러와서 화면에 다시 그려줍니다.

const todoInput = document.getElementById("todo-input");
const categorySelect = document.getElementById("category-select");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const completionRateEl = document.getElementById("completion-rate");

const STORAGE_KEY = "smart-campus-planner-todos";

// -----------------------------
// 저장 / 불러오기 관련 함수
// -----------------------------

// 현재 화면에 있는 모든 할 일 정보를 읽어서 배열로 만든 뒤 localStorage에 저장
function saveTodos() {
  const items = todoList.querySelectorAll("li");
  const todos = [];

  items.forEach((li) => {
    const title = li.querySelector(".todo-title").textContent;
    const category = li.dataset.category;
    const priority = li.dataset.priority;
    const dueDate = li.dataset.dueDate || "";
    const completed = li.dataset.completed === "true";

    todos.push({ title, category, priority, dueDate, completed });
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// localStorage에 저장된 할 일 목록을 불러와서 배열로 반환 (없으면 빈 배열)
function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("저장된 할 일 데이터를 불러오는 중 오류가 발생했습니다.", error);
    return [];
  }
}

// -----------------------------
// 화면에 할 일 항목 추가
// -----------------------------

// 화면에 새로운 할 일 항목(li)을 추가하는 함수
// isCompleted: 저장된 데이터를 불러올 때 완료 상태를 그대로 반영하기 위한 값
function addTodoToList(title, category, priority, dueDate, isCompleted = false) {
  const li = document.createElement("li");

  // 나중에 저장할 때 사용할 원본 정보를 li에 저장해둠
  li.dataset.category = category;
  li.dataset.priority = priority;
  li.dataset.dueDate = dueDate || "";
  li.dataset.completed = String(isCompleted);

  // 완료 체크박스
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = isCompleted;
  checkbox.addEventListener("change", () => {
    toggleComplete(li, checkbox.checked);
    updateCompletionRate();
    saveTodos();
  });

  // 할 일 제목
  const titleEl = document.createElement("span");
  titleEl.className = "todo-title";
  titleEl.textContent = title;

  // 상단 영역: 체크박스 + 제목 + 삭제 버튼
  const topRow = document.createElement("div");
  topRow.className = "todo-top-row";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "삭제";
  deleteBtn.addEventListener("click", () => {
    todoList.removeChild(li);
    updateCompletionRate();
    saveTodos();
  });

  topRow.appendChild(checkbox);
  topRow.appendChild(titleEl);
  topRow.appendChild(deleteBtn);

  // 카테고리 / 중요도 / 마감일을 보여주는 태그 영역
  const metaEl = document.createElement("div");
  metaEl.className = "todo-meta";

  const categoryTag = document.createElement("span");
  categoryTag.className = `tag tag-category-${category}`;
  categoryTag.textContent = category;

  const priorityTag = document.createElement("span");
  priorityTag.className = `tag tag-priority-${priority}`;
  priorityTag.textContent = `중요도: ${priority}`;

  metaEl.appendChild(categoryTag);
  metaEl.appendChild(priorityTag);

  // 마감일이 입력된 경우에만 태그 표시
  if (dueDate) {
    const dueTag = document.createElement("span");
    dueTag.className = "tag tag-due";
    dueTag.textContent = `마감일: ${dueDate}`;
    metaEl.appendChild(dueTag);
  }

  li.appendChild(topRow);
  li.appendChild(metaEl);

  // 저장된 데이터를 불러와서 그릴 때는 처음부터 완료 스타일을 적용
  if (isCompleted) {
    li.classList.add("completed");
  }

  todoList.appendChild(li);
}

// 전체 할 일 대비 완료된 할 일의 비율(%)을 계산해서 화면에 표시하는 함수
function updateCompletionRate() {
  const allTodos = todoList.querySelectorAll("li");
  const totalCount = allTodos.length;

  const completedTodos = todoList.querySelectorAll(
    'li[data-completed="true"]'
  );
  const completedCount = completedTodos.length;

  let rate = 0;
  if (totalCount > 0) {
    rate = Math.round((completedCount / totalCount) * 100);
  }

  completionRateEl.textContent = `완료율: ${rate}%`;
}

// 완료 상태를 토글(변경)하는 함수
function toggleComplete(li, isCompleted) {
  li.dataset.completed = String(isCompleted);

  if (isCompleted) {
    li.classList.add("completed");
  } else {
    li.classList.remove("completed");
  }
}

// "추가" 버튼을 눌렀을 때 실행되는 함수
function handleAddTodo() {
  const title = todoInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value; // 선택 안 하면 빈 문자열

  if (title === "") {
    alert("할 일을 입력해주세요.");
    return;
  }

  addTodoToList(title, category, priority, dueDate, false);
  updateCompletionRate();
  saveTodos();

  // 입력값 초기화 (카테고리/중요도는 편의상 유지하고, 제목/마감일만 초기화)
  todoInput.value = "";
  dueDateInput.value = "";
  todoInput.focus();
}

// 버튼 클릭 시 할 일 추가
addBtn.addEventListener("click", handleAddTodo);

// 제목 입력창에서 Enter 키를 눌러도 할 일이 추가되도록 처리
todoInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleAddTodo();
  }
});

// -----------------------------
// 페이지가 처음 열릴 때: 저장된 할 일 불러와서 화면에 그리기
// -----------------------------
function initTodos() {
  const savedTodos = loadTodos();

  savedTodos.forEach((todo) => {
    addTodoToList(
      todo.title,
      todo.category,
      todo.priority,
      todo.dueDate,
      todo.completed
    );
  });

  updateCompletionRate();
}

initTodos();
