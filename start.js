// Startup script with compatibility fixes
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Polyfill for File API if missing (fixes undici issue)
if (typeof globalThis.File === 'undefined') {
  globalThis.File = class File extends Blob {
    constructor(fileBits, fileName, options = {}) {
      super(fileBits, options);
      this.name = fileName;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

// Set up __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load and start the main server
import('./src/server.js').catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});