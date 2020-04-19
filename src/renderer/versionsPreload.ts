// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const mainProcesses = ["chrome", "node", "electron"];
  const replaceText = (selector: string, text: string): void => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of mainProcesses) {
    replaceText(`${type}-version`, (process.versions as any)[type]);
  }

  const list = document.getElementById("other-processes");
  const otherProcesses: string[] = Object.keys(process.versions)
    .filter((type) => !mainProcesses.includes(type))
    .sort();
  otherProcesses.forEach((type) => {
    const li = document.createElement("li");
    const text = document.createTextNode(`
    ${type}: ${(process.versions as any)[type]}
    `);
    li.appendChild(text);
    if (list) list.appendChild(li);
  });
});
