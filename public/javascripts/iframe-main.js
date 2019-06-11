/**
 * Created by i306534 on 03/06/2019.
 */

class TestClass {
	constructor() {
		this.message = "Calling change on body background"
	}
	printMessage() {
		console.log(this.message);
	}
	changeBackgroundColorInBody() {
		document.getElementsByTagName("body")[0].style.backgroundColor = getRandomColor();
		this.printMessage();
	}
}

let el = document.getElementById("vr-page-title");
el.innerText = "Hello iframe page!";

let utils = new Utils();

let parentFunction;

let testClassInstance = new TestClass();

utils.exposeFunctions({
	changeBackgroundColorInBody: {
		fnCallback: testClassInstance.changeBackgroundColorInBody,
		context: testClassInstance
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

