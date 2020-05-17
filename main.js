const { app, BrowserWindow, dialog, screen }= require('electron');
const path = require('path');
const url= require('url');
const usbDetect = require('usb-detection');
const { fork } = require('child_process');
const { Worker , isMainThread} = require('worker_threads')

let mainWindow;
let workerThread;
let childThread;


const createWindow= ()=>{
	process.env.ELECTRON_DISABLE_SECURITY_WARNINGS= true;
//create a new browser window
	mainWindow= new BrowserWindow({
		width: 800,
		height: 600,
		allowEval: false,
		icon: path.join(__dirname, 'assets/img/sysinfo.png'),
	 webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });
// load window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	usbDetect.startMonitoring();
	mainWindow.ELECTRON_DISABLE_SECURITY_WARNINGS;

//	mainWindow.webContents.openDevTools();

// Protect screen from capturing
	mainWindow.setContentProtection(true);
	mainWindow.on('close', ()=>{
		mainWindow= null;
		usbDetect.stopMonitoring();
	});	

// USB detection
	usbDetect.find(function(err, devices) { if(devices.length){
		const connectedDevices= devices.filter(device=>!!device.deviceName && !device.deviceName.includes('Controller') && !device.deviceName.includes('Integrated'));
		if(connectedDevices.length) {
			dialog.showMessageBox(mainWindow, {type: 'info',
		 title: 'connected devices',
		  message: `${connectedDevices.length} devices already connected to the system\n ${connectedDevices.map(device=>device.deviceName).join(', \n')}`,
		  buttons: ['OK']
		});
		}		
	}
	});

	usbDetect.on('add', function(device) { dialog.showMessageBox(mainWindow, {type: 'info', title: 'New Device',buttons: ['OK'], message: 'A new device connected.'}) });
	usbDetect.on('remove', function(device) { dialog.showMessageBox(mainWindow, {type: 'info', title: 'Device Removed', buttons: ['OK'], message: 'A device removed.'}) });

// HDMI Detection
	const displays = screen.getAllDisplays();
	const externalDisplay = displays.find((display) => display.bounds.x !== 0 || display.bounds.y !== 0);
	if(externalDisplay){
		dialog.showMessageBox(mainWindow, {type: 'info',
		 title: 'Screen connected',
		  message: 'Screen already connected to the system',
		  buttons: ['OK']
		});
	}

	screen.on('display-added', function(device) { dialog.showMessageBox(mainWindow, {type: 'info', title: 'New Screen',buttons: ['OK'], message: 'A new screen connected.'}) });
	screen.on('display-removed', function(device) { dialog.showMessageBox(mainWindow, {type: 'info', title: 'Screen Removed', buttons: ['OK'], message: 'A screen removed.'}) });	
 
}

app.allowRendererProcessReuse= true;
app.disableHardwareAcceleration();

app.on('ready', ()=>{
	try {
		createWindow();
	// iohook to detect mouse and keyboard events
		childThread= fork(path.join(__dirname,'iohook.js'));
	// close vlc and other media players
		workerThread= new Worker(path.join(__dirname, 'close-media-players.js'));
		
		workerThread.on('exit', ()=>console.log('Worker thread exited'));
		childThread.on('exit', ()=>console.log('child thread exited'));
	} catch(e) {
		console.log(e);
	}
});

app.on('window-all-closed', (a)=>{	
	if(process.platform !== 'darwin') {
		app.quit();
	}	
	usbDetect.stopMonitoring();
	workerThread.terminate();
	childThread.kill('SIGINT');
});
