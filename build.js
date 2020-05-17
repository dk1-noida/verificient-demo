const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join(__dirname)
  const outPath = path.join(rootPath, 'release')
  console.log(rootPath, outPath);

  return Promise.resolve({
    appDirectory: path.join(outPath, 'verificient-demo-win32-x64/'),
    authors: 'Dinesh',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'verificient-demo.exe',
    setupExe: 'verificient-demo.exe',
    setupIcon: path.join(rootPath, 'assets', 'icons', '1024x1024.ico')
  })
}