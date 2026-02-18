chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "API_REQUEST") {

    const options = {
      method: msg.method || "POST",
      headers: msg.headers || {},
      credentials: "include" // QUAN TRỌNG
    };

    if (msg.body) {
      if (msg.isFormData) {
        options.body = msg.body;
      } else {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(msg.body);
      }
    }

    fetch(msg.url, options)
      .then(async res => {
        const text = await res.text();

        try {
          const json = JSON.parse(text);
          sendResponse({ ok: true, data: json });
        } catch {
          // log thẳng HTML để debug
          console.error("API HTML response:", text);
          sendResponse({ ok: false, error: "Server blocked request (anti-bot)" });
        }
      })
      .catch(err => sendResponse({ ok: false, error: err.message }));

    return true;
  }
});
