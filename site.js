import { db, auth } from "./firebase-config.js";
import { collection, getDocs, addDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const btn = document.getElementById("loginBtn");
  const userInfo = document.getElementById("userInfo");
  const writePost = document.getElementById("writePost");
  if (user) {
    if (btn) btn.textContent = "Sign Out";
    if (userInfo) userInfo.textContent = `Hi, ${user.displayName}`;
    if (writePost) writePost.style.display = "block";
  } else {
    if (btn) btn.textContent = "Sign in with Google";
    if (userInfo) userInfo.textContent = "";
    if (writePost) writePost.style.display = "none";
  }
});

window.handleLogin = async () => {
  if (currentUser) {
    await signOut(auth);
  } else {
    await signInWithPopup(auth, provider);
  }
};

async function loadBlogs() {
  const blogList = document.getElementById("blogList");
  if (!blogList) return;
  const q = query(collection(db, "blogs"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    blogList.innerHTML = "<p>No blog posts yet.</p>";
    return;
  }
  blogList.innerHTML = snapshot.docs.map(doc => {
    const p = doc.data();
    return `<article class="card">
      <h3>${p.title}</h3>
      <p><strong>${p.date}</strong></p>
      ${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width:100%;border-radius:14px;">` : ""}
      <p>${p.content}</p>
    </article>`;
  }).join("");
}

async function loadGallery() {
  const galleryGrid = document.getElementById("galleryGrid");
  if (!galleryGrid) return;
  const snapshot = await getDocs(collection(db, "gallery"));
  if (snapshot.empty) {
    galleryGrid.innerHTML = "<p>No gallery images yet.</p>";
    return;
  }
  galleryGrid.innerHTML = snapshot.docs.map(doc => {
    const p = doc.data();
    return `<article class="card"><img src="${p.imageUrl}" loading="lazy" style="width:100%"></article>`;
  }).join("");
}

async function publishBlog(e) {
  e.preventDefault();
  const title = document.getElementById("adminBlogTitle").value;
  const date = document.getElementById("adminBlogDate").value;
  const content = document.getElementById("adminBlogContent").value;
  const imageUrl = document.getElementById("adminBlogImageUrl").value;
  await addDoc(collection(db, "blogs"), { title, date, content, imageUrl });
  document.getElementById("adminStatus").textContent = "Blog published!";
  e.target.reset();
}

async function addGalleryImage(e) {
  e.preventDefault();
  const imageUrl = document.getElementById("adminGalleryImageUrl").value;
  await addDoc(collection(db, "gallery"), { imageUrl });
  document.getElementById("adminStatus").textContent = "Image added!";
  e.target.reset();
}

document.getElementById("adminBlogForm")?.addEventListener("submit", publishBlog);
document.getElementById("adminGalleryForm")?.addEventListener("submit", addGalleryImage);

document.getElementById("userBlogForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("userBlogTitle").value;
  const date = document.getElementById("userBlogDate").value;
  const content = document.getElementById("userBlogContent").value;
  const status = document.getElementById("userBlogStatus");
  await addDoc(collection(db, "blogs"), {
    title,
    date,
    content,
    imageUrl: "",
    author: currentUser.displayName,
    authorEmail: currentUser.email
  });
  status.textContent = "Published!";
  e.target.reset();
  loadBlogs();
});

loadBlogs();
loadGallery();