/**
 * Created by i306534 on 03/06/2019.
 */

let el = document.getElementById("vr-page-title");
el.innerText = "Hello main page!";

let utils = new Utils();

utils.exposeFunctions({
	changeBackgroundColorInHeader: changeBackgroundColorInHeader
});

function getRandomColor() {
	let letters = '0123456789ABCDEF',
	color = '#';

	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function changeBackgroundColorInHeader() {
	console.log("Calling change on body background");
	document.getElementById("vr-page-header").style.backgroundColor = getRandomColor();
}