const { app, BrowserWindow } = require('electron');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  await win.loadURL('data:text/html,<html><body><h1 id="title">Hello World</h1></body></html>');
  const title = await win.webContents.executeJavaScript('document.getElementById("title").innerText');
  console.log('DOM Evaluation Result:', title);
  app.quit();
});
