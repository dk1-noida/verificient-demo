var addon = require('bindings')('calculate');

const sum= (a, b)=>addon.add(a, b);
const subtract= ()=>addon.sub();
const multiply= ()=>addon.mult();
const division= ()=>addon.div();

module.exports= {
	sum,
	subtract,
	multiply,
	division
};