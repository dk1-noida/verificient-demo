const psList = require('ps-list');

function killMediaPlayers() {
	psList({name: 'media'})
	.then((list)=>{
		const mediaPlayers = list.filter(task=>task.name.includes('vlc') || task.name.includes('snipping') || task.name.includes('player'));
		const PIDs= mediaPlayers.map(player=>player.pid);	
		PIDs.map(PID=>process.kill(PID));
	})
	.catch(e=>{console.log(e);});		
}

killMediaPlayers();

setInterval(()=>killMediaPlayers(), 5000);