const mockjs = require('mockjs');
const fs = require('fs');

const Random = mockjs.Random;

var arr = [];

for(let i = 0; i < 45 ; i++){
	let o = Random.pick([1,2,3], Random.integer(1, 3));

	arr.push({
		id: 100000 + i,
		executor: Array.isArray(o) ? o : [o],
		title: Random.cword(8,19),
		detail: Random.cword(20, 40),
		deadline: Random.integer(1574333272000, 1574933272000),
		done: Random.pick([true, false])
	});
}
fs.writeFile('./data/rw.txt', JSON.stringify(arr), () => {

});