/**
 * Created by i306534 on 03/06/2019.
 */

let el = document.getElementById("vr-page-title");
el.innerText = "Hello main page!";

let utils = new Utils();

let childFunction;

utils.exposeFunctions({
	changeBackgroundColorInHeader: {
		fnCallback: changeBackgroundColorInHeader,
		context: undefined
	}
});

function getRandomColor() {
	let letters = '0123456789ABCDEF',
	color = '#';

	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function changeBackgroundColorInHeader() {
	document.getElementById("vr-page-header").style.backgroundColor = getRandomColor();
}

function getExposedFunction() {
	if (childFunction) return;
	utils.getExposedFunction("changeBackgroundColorInBody", "parent", "vr-ifame-page", (oArgs) => {
		childFunction = oArgs.endPoint;
		document.querySelector("#vr-buttons button:nth-child(2)").disabled = false;
	});
}

function runExposedFunction() {
	if (childFunction) {
		childFunction();
	}
}