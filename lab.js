var u = require('underscore');
var arr = [
	{name: 'windu', point: 4},
	{name: 'windu', point: 7},
	{name: 'wito', point: 5},
	{name: 'rasya', point: 6},
	{name: 'deni', point: 7}
];

var b = [
	{name: 'denix', point: 7}
];

var result = u.where(arr, {name: 'windu', point: 4});

arr.push.apply(arr, b);
console.log(arr);