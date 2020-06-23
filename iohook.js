const ioHook = require('iohook');

ioHook.on('keypress', event => {
	// ioHook.disableClickPropagation();
});

ioHook.on('mouseclick', event => {
  // if(event.button === 3) {  	
  // 	 ioHook.disableClickPropagation();
  // } else {
  // 	ioHook.enableClickPropagation();
  // }
});

ioHook.start();
