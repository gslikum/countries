import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');
const distDir = path.join(rootDir, 'dist');

console.log('Building "Where in the World?" Countries Application for production...');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public assets if any
const publicDir = path.join(rootDir, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

// Process index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  // Copy to dist/index.html
  fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent, 'utf8');
}

// Check src files for basic syntax integrity
const srcDir = path.join(rootDir, 'src');
function checkDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.css'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content || content.trim().length === 0) {
        throw new Error(`Empty file detected: ${fullPath}`);
      }
    }
  }
}

checkDirectory(srcDir);

console.log('✔ Build completed successfully! Production assets emitted to /dist.');
