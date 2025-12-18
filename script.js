// ---------------- FIREBASE IMPORTS ----------------
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();


// ---------------- DOM ELEMENTS ----------------
const dueDateInput = document.getElementById("dueDateInput");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const authBox = document.getElementById("authBox");
const appBox = document.getElementById("appBox");

const tasksCollection = collection(window.db, "tasks");

let currentFilter = "all";
let currentUser = null;


// ---------------- AUTH BUTTONS ----------------
document.getElementById("loginBtn").onclick = () => {
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .catch(err => alert(err.message));
};

document.getElementById("registerBtn").onclick = () => {
  createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .catch(err => alert(err.message));
};


// ---------------- AUTH STATE LISTENER ----------------
const welcomeText = document.getElementById("welcomeText");

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    welcomeText.textContent = `Welcome, ${user.email}`;
    authBox.style.display = "none";
    appBox.style.display = "block";
    loadTasks();
  } else {
    currentUser = null;
    welcomeText.textContent = "";
    authBox.style.display = "block";
    appBox.style.display = "none";
  }
});



// ---------------- LOAD TASKS ----------------
async function loadTasks() {
  taskList.innerHTML = "";

  const snapshot = await getDocs(tasksCollection);
  let tasks = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.userId === currentUser?.uid) {
      tasks.push({ id: docSnap.id, ...data });
    }
  });

  // ---- Sort by due date ----
  tasks.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  // ---- Apply filter ----
  if (currentFilter === "active") {
    tasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === "completed") {
    tasks = tasks.filter(t => t.completed);
  }

  // ---- Render tasks ----
  tasks.forEach(task => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleTask(task.id, task.completed);

    // Text + due date
    const span = document.createElement("span");
    span.innerHTML =
      task.text +
      (task.dueDate ? ` <small>(due: ${task.dueDate})</small>` : "");
    span.onclick = () => editTask(task.id, task.text);

    // Delete button
    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "✖";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteTask(task.id);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}


// ---------------- ADD TASK ----------------
async function addTask() {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!text) return;

  await addDoc(tasksCollection, {
    userId: currentUser.uid,
    text,
    completed: false,
    dueDate: dueDate || null,
    createdAt: new Date()
  });

  taskInput.value = "";
  dueDateInput.value = "";
  loadTasks();
}


// ---------------- TOGGLE COMPLETE ----------------
async function toggleTask(id, current) {
  await updateDoc(doc(window.db, "tasks", id), {
    completed: !current
  });

  loadTasks();
}


// ---------------- EDIT TASK ----------------
async function editTask(id, currentText) {
  const newText = prompt("Edit task:", currentText);
  if (!newText || newText.trim() === "") return;

  await updateDoc(doc(window.db, "tasks", id), {
    text: newText.trim()
  });

  loadTasks();
}


// ---------------- DELETE TASK ----------------
async function deleteTask(id) {
  await deleteDoc(doc(window.db, "tasks", id));
  loadTasks();
}


// ---------------- EVENTS ----------------
addTaskBtn.addEventListener("click", addTask);

document.querySelectorAll(".filters button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filters button")
      .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");
    currentFilter = button.dataset.filter;
    loadTasks();
  });
});

// ---------------- EXPORT PDF ----------------
window.exportPDF = () => {
  const printWindow = window.open('', '', 'height=700,width=900');

  printWindow.document.write('<html><head><title>Tasks PDF</title></head><body>');
  printWindow.document.write('<h2>My Tasks</h2>');

  document.querySelectorAll("#taskList li").forEach(li => {
    printWindow.document.write(li.innerText + "<br>");
  });

  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};

// ---------------- EXPORT EXCEL ----------------
window.exportExcel = async () => {
  const snapshot = await getDocs(tasksCollection);
  let rows = ["Task,Completed,Due Date"];

  snapshot.forEach(docSnap => {
    const t = docSnap.data();
    if (t.userId === currentUser.uid) {
      rows.push(`${t.text},${t.completed ? "Yes" : "No"},${t.dueDate || ""}`);
    }
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.csv";
  a.click();
};


// ---------------- LOGOUT ----------------
window.logout = () => signOut(auth);
