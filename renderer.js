const os = require('os');
const drivelist = require('drivelist');
const Store = require('./storage');
const electron = require('electron');
const { desktopCapturer } = electron;
const { screen, dialog } = electron.remote;
const fs= require('fs');
const path= require('path');

const Storage = new Store({  
  configName: 'screenshots-info',
  defaults: {}
});

try {
const output= `<h5 class="page-header">OS information:</h5>
	<ul class="list-group">
	<li class="list-group-item">Available RAM: ${(os.freemem()/(1024*1024*1024)).toFixed(2)} GB</li>
	<li class="list-group-item">Total RAM : ${(os.totalmem()/(1024*1024*1024)).toFixed(2)} GB</li>
	<li class="list-group-item">OS Name: ${os.type()}</li>
	<li class="list-group-item">Platform: ${os.platform()}</li>
	<li class="list-group-item">OS Architecture: ${os.arch()}</li>
	<li class="list-group-item" id='li-hard-drive'>Available hard drive space: 0</li>
	</ul>`;
document.getElementById('root').innerHTML= output;
} catch(e) {
	console.log(e);
}


const screenShot= document.getElementById('screen-shot');

drivelist.list()
.then((drives)=>{
	const diskSize= drives.reduce((total, drive)=>total+drive.size, 0);
	document.getElementById('li-hard-drive').innerHTML= `Hard drive: ${(diskSize/(1024*1024*1024)).toFixed(2)} GB`;
})
.catch(e=>{console.log(e)});

screenShot.addEventListener('click', async()=>{
	try {
		const currentwindow= electron.remote.getCurrentWindow();
		const selectedDirectory= dialog.showOpenDialogSync(currentwindow, {properties: ['openDirectory']});

		if(selectedDirectory && selectedDirectory.length) {
			const directoryPath = selectedDirectory[0];
			const thumbnailSize= determinThumbnail();
			const sources= await desktopCapturer.getSources({types: ['screen', 'window'], thumbnailSize: thumbnailSize});

			let randomFileName;
			sources.map(source=>{
				if(!['entire screen', 'verificient demo'].includes(source.name.toLowerCase())) {
					randomFileName= ('_'+ Math.random()*10000000).substring(0,6);
						const screenShotPath= path.join(directoryPath, randomFileName+'.png');
					fs.writeFile(screenShotPath, source.thumbnail.toPNG(), ()=>{});
					Storage.set(randomFileName, source);
				}
			});

			dialog.showMessageBox(currentwindow, {type: 'info', title: 'Screen shots', buttons: ['OK'], message: `Screens captured Path is ${directoryPath} \n storage location is ${Storage.getPath()}`})
		}

	} catch(e) {
		console.log(e);
	}	
});

function determinThumbnail() {
	const screenSize= screen.getPrimaryDisplay().workAreaSize;
	const maxDimension= Math.max(screenSize.width, screenSize.height);
		
	return {
		width: maxDimension * window.devicePixelRatio,
		height: maxDimension * window.devicePixelRatio
	}
}