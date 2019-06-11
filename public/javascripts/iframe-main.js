/**
 * Created by i306534 on 03/06/2019.
 */

let el = document.getElementById("vr-page-title");
el.innerText = "Hello iframe page!";

let utils = new Utils();

let parentFunction;

utils.exposeFunctions({
	changeBackgroundColorInBody: {
		fnCallback: changeBackgroundColorInBody,
		context: this
	}
});

function getRandomColor() {
	let letters = '0123456789ABCDEF',
		color = '#';

	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function changeBackgroundColorInBody() {
	console.log("Calling change on body background");
	document.getElementsByTagName("body")[0].style.backgroundColor = getRandomColor();
}

function getExposedFunction() {
	if (parentFunction) return;
	utils.getExposedFunction("changeBackgroundColorInHeader", "child", "parent", (oArgs) => {
		parentFunction = oArgs.endPoint;
		document.querySelector("#vr-buttons button:nth-child(2)").disabled = false;
	});
}

function runExposedFunction() {
	if (parentFunction) {
		parentFunction();
	}
}

