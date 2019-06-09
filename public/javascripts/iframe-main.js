/**
 * Created by i306534 on 03/06/2019.
 */

let el = document.getElementById("vr-page-title");
el.innerText = "Hello iframe page!";

let utils = new Utils();

let parentFunction;

function getExposedFunction() {
	if (parentFunction) return;
	utils.getExposedFunction("changeBackgroundColorInHeader", (oArgs) => {
		parentFunction = oArgs.endPoint;
		document.querySelector("#vr-buttons button:nth-child(2)").disabled = false;
	});
}

function runExposedFunction() {
	if (parentFunction) {
		parentFunction();
	}
}

