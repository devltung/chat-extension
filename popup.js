function apiFetch(url, body = null, isFormData = false) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type: "API_REQUEST",
      url,
      method: "POST",
      body,
      isFormData
    }, response => {
      if (!response || !response.ok) {
        reject(response?.error || "API Error");
      } else {
        resolve(response.data);
      }
    });
  });
}


const API = "https://noname.mydiscussion.net/api";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const chatPage = document.getElementById("chatPage");
const messagesDiv = document.getElementById("messages");

function show(el){
  [loginForm, registerForm, chatPage].forEach(e=>e.classList.add("hidden"));
  el.classList.remove("hidden");
}

// chuyển form
goRegister.onclick = ()=>show(registerForm);
goLogin.onclick = ()=>show(loginForm);

// AUTO LOGIN nếu có token
chrome.storage.local.get("token", res=>{
  if(res.token){
    show(chatPage);
    loadMessages();
  }
});

// REGISTER
registerBtn.onclick = async () => {
  try {
    const data = await apiFetch(`${API}/register.php`, {
      username: r_user.value,
      password: r_pass.value
    });

    alert(data.msg || "Đăng ký xong");

    if (data.ok) show(loginForm);

  } catch (err) {
    console.error(err);
  }
};



// LOGIN
loginBtn.onclick = async () => {
  try {
    const data = await apiFetch(`${API}/login.php`, {
      username: l_user.value,
      password: l_pass.value
    });

    if (data.ok) {
      chrome.storage.local.set({
        token: data.token,
        username: l_user.value
      });

      show(chatPage);
      loadMessages();
    } else {
      alert("Sai tài khoản");
    }

  } catch (err) {
    console.error(err);
  }
};



// LOAD MESSAGES
async function loadMessages() {
  const { token, username } = await chrome.storage.local.get(["token","username"]);
  if (!token) return;

  const data = await apiFetch(`${API}/messages.php`, { token });
  if (!Array.isArray(data)) return;

  messagesDiv.innerHTML = "";

  data.forEach(m => {
    const isMe = m.username === username;
    const side = isMe ? "me" : "other";

    let content = "";

    if (m.type === "text") {
      content = m.content;
    }

    if (m.type === "image") {
      content = `<img src="${API}/${m.file_path}" style="max-width:100%; border-radius:10px;">`;
    }

    if (m.type === "video") {
      content = `<video src="${API}/${m.file_path}" controls style="max-width:100%; border-radius:10px;"></video>`;
    }

    if (m.type === "file") {
      content = `<a href="${API}/${m.file_path}" target="_blank">📎 Tải file</a>`;
    }

    messagesDiv.innerHTML += `
      <div class="chat-message ${side}">
        <div class="bubble">
          ${!isMe ? `<div style="font-size:11px;opacity:.6">${m.username}</div>` : ""}
          ${content}
        </div>
      </div>
    `;
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}



// SEND MESSAGE
let isSending = false;

async function sendMessage() {
  if (isSending) return;

  const text = msgInput.value.trim();
  if (!text) return;

  const { token } = await chrome.storage.local.get("token");
  if (!token) return;

  isSending = true;

  // clear input NGAY LẬP TỨC
  msgInput.value = "";

  try {
    await apiFetch(`${API}/send.php`, {
      token,
      message: text
    });

    loadMessages();
  } finally {
    isSending = false;
  }
}

sendBtn.onclick = () => {
  sendMessage();
};
msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // chặn xuống dòng
    sendMessage();
  }
});



fileInput.onchange = async ()=>{
  const { token } = await chrome.storage.local.get("token");
  const file = fileInput.files[0];
  if(!file) return;

  let type = "file";
  if(file.type.startsWith("image")) type="image";
  if(file.type.startsWith("video")) type="video";

  const formData = new FormData();
  formData.append("token", token);
  formData.append("type", type);
  formData.append("file", file);

  await fetch(`${API}/upload.php`,{
    method:"POST",
    body: formData
  });
  
  loadMessages();
};


// AUTO REFRESH CHAT
let isLoading = false;

setInterval(async ()=>{
  if(!chatPage.classList.contains("hidden") && !isLoading){
    isLoading = true;
    await loadMessages();
    isLoading = false;
  }
},1000);


