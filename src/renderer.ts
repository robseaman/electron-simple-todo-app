// This file is required by the index.html file and will
// be executed in the renderer process for that window.
import { ipcRenderer } from "electron";

const list = document.querySelector("ul");

ipcRenderer.on("todo:add", (event, todo) => {
  const li = document.createElement("li");
  const text = document.createTextNode(todo);

  li.appendChild(text);
  if (list) list.appendChild(li);
});

ipcRenderer.on("todo:clear", () => {
  if (list) list.innerHTML = "";
});
