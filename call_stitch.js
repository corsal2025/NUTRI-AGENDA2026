const { spawn } = require('child_process');

// Minified JSON to avoid any formatting issues
const data = JSON.stringify({
    projectId: "10969439908069545557",
    prompt: "Un centro de soporte premium para una plataforma de nutrición con estética glassmorphism, colores fuchsia e indigo. Incluye sección de FAQ, formulario de contacto y chat de ayuda. Diseño ultra moderno y visual.",
    deviceType: "DESKTOP"
});

console.log('Sending data:', data);

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const proc = spawn(command, ['-y', '@_davideast/stitch-mcp', 'tool', 'generate_screen_from_text', '-d', data], {
    shell: false,
    env: { ...process.env, GOOGLE_CLOUD_PROJECT: 'nutri-agenda-5bd9f' }
});

proc.stdout.on('data', (d) => process.stdout.write(d.toString()));
proc.stderr.on('data', (d) => process.stderr.write(d.toString()));

proc.on('close', (code) => {
    console.log(`\nExited with code ${code}`);
});
