import { ipcRenderer } from "electron";

const formSelector = document.querySelector("form");
if (formSelector) {
  formSelector.addEventListener("submit", (event) => {
    event.preventDefault();

    const { value } = document.querySelector("input") as HTMLInputElement;
    ipcRenderer.send("todo:add", value);
  });
}
