import { spawn } from 'child_process';

console.log('🔍 Checking for existing Chrome/Chromium processes...\n');

// Function to run a command and return output
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { shell: true });
    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', (code) => {
      resolve({ code, output });
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Check for Chrome processes
async function checkChromeProcesses() {
  try {
    console.log('🔍 Checking for Chrome processes...');
    const { output } = await runCommand('tasklist', ['/FI', 'IMAGENAME eq chrome.exe']);
    
    if (output.includes('chrome.exe')) {
      console.log('⚠️  Found Chrome processes:');
      console.log(output);
      console.log('\n💡 Consider closing Chrome browser completely before testing');
    } else {
      console.log('✅ No Chrome processes found');
    }
  } catch (error) {
    console.log('❌ Could not check Chrome processes:', error.message);
  }
}

// Check for Chromium processes
async function checkChromiumProcesses() {
  try {
    console.log('\n🔍 Checking for Chromium processes...');
    const { output } = await runCommand('tasklist', ['/FI', 'IMAGENAME eq chromium.exe']);
    
    if (output.includes('chromium.exe')) {
      console.log('⚠️  Found Chromium processes:');
      console.log(output);
    } else {
      console.log('✅ No Chromium processes found');
    }
  } catch (error) {
    console.log('❌ Could not check Chromium processes:', error.message);
  }
}

// Check for Node processes (in case previous tests didn't clean up)
async function checkNodeProcesses() {
  try {
    console.log('\n🔍 Checking for Node processes...');
    const { output } = await runCommand('tasklist', ['/FI', 'IMAGENAME eq node.exe']);
    
    const lines = output.split('\n').filter(line => line.includes('node.exe'));
    if (lines.length > 1) { // More than just this current process
      console.log('⚠️  Multiple Node processes found:');
      lines.forEach(line => {
        if (line.trim()) console.log(line.trim());
      });
      console.log('\n💡 You might have other Node processes running');
    } else {
      console.log('✅ Only current Node process found');
    }
  } catch (error) {
    console.log('❌ Could not check Node processes:', error.message);
  }
}

// Clean up function
async function suggestCleanup() {
  console.log('\n🧹 CLEANUP SUGGESTIONS:');
  console.log('1. Close all Chrome/Chromium browsers manually');
  console.log('2. If you have stuck processes, run:');
  console.log('   taskkill /F /IM chrome.exe');
  console.log('   taskkill /F /IM chromium.exe');
  console.log('3. Wait 30 seconds after cleanup');
  console.log('4. Then run: node test-safe.js\n');
  
  console.log('🛡️  ANTI-DETECTION TIPS:');
  console.log('• Use educational queries first (like "what is HTML")');
  console.log('• Wait at least 8+ seconds between requests');
  console.log('• If blocked, wait 10+ minutes before retrying');
  console.log('• Consider using a VPN to change your IP');
  console.log('• Try different times of day (off-peak hours)');
}

// Run all checks
async function main() {
  console.log('🔧 System Check for AI Overview Scraper\n');
  
  await checkChromeProcesses();
  await checkChromiumProcesses(); 
  await checkNodeProcesses();
  await suggestCleanup();
}

main().catch(console.error);