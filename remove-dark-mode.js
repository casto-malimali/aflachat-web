const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'components/Navbar.tsx',
  'components/Footer.tsx',
  'app/contact/page.tsx',
  'app/page.tsx',
  'app/download/page.tsx',
  'app/services/page.tsx',
  'app/privacy/page.tsx',
  'app/terms/page.tsx',
  'app/globals.css'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove all classes starting with dark:
    content = content.replace(/dark:[a-zA-Z0-9/-\[\]#]+ /g, '');
    content = content.replace(/dark:[a-zA-Z0-9/-\[\]#]+/g, '');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
