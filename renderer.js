const os = require('os');
const drivelist = require('drivelist');
const Store = require('./storage');
const electron = require('electron');
const { desktopCapturer } = electron;
const { screen, dialog } = electron.remote;
const fs= require('fs');
const path= require('path');
const calculate= require('./napis/calculate-napi');
const childProcess= require('child_process');

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
const sumButton= document.getElementById('n-api-sum');
const subButton= document.getElementById('n-api-sub');
const multButton= document.getElementById('n-api-mult');
const divButton= document.getElementById('n-api-div');
const firstInput= document.getElementById('first');
const secondinput= document.getElementById('second');
const nAPIResult= document.getElementById('n-api-result');
const btnFaceDetect= document.getElementById('btn-face-detect');

btnFaceDetect.addEventListener('click', ()=>{
	sendToPython();
});

sumButton.addEventListener('click', ()=>{
	let value1= parseInt(firstInput.value);
	let value2= parseInt(firstInput.value);
	nAPIResult.innerHTML= calculate.sum(value1, value2);
});

subButton.addEventListener('click', ()=>{
	let value1= firstInput.value;
	let value2= firstInput.value;
	nAPIResult.innerHTML= calculate.subtract(value1, value2);
});

multButton.addEventListener('click', ()=>{
	let value1= firstInput.value;
	let value2= firstInput.value;
	nAPIResult.innerHTML= calculate.multiply(value1, value2);
});

divButton.addEventListener('click', ()=>{
	let value1= firstInput.value;
	let value2= firstInput.value;
	nAPIResult.innerHTML= calculate.division(value1, value2);
})

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

function sendToPython() {
  var python = childProcess.spawn('python', ['./py/identify_face_image.py']);
  python.stdout.on('data', function (data) {
    console.log("Python response: ", data.toString('utf8'));
    //result.textContent = data.toString('utf8');
  });

  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });  

  python.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

}