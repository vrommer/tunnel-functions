/**
 * Created by i306534 on 03/06/2019.
 */

let el = document.getElementById("vr-page-title");
el.innerText = "Hello iframe page!";

let utils = new Utils();

let parentFunction;

utils.registerServices({
	endPoints: {
		getParentFunction: function(oArgs) {
			console.log("@getEndPoint service of endPoints in iframe");
			parentFunction = oArgs.endPoint;
		}
	}
});

function getParentFunction() {
	if (parentFunction) return;
	utils.callService(
		{
			commInterface: {
				name: "endPoints",
				service: "serveParentFunction",
				oArgs: {
					frameID: window.frameElement.id
				}
			}
		});
}

function runParentFunction() {
	if (parentFunction) {
		parentFunction();
	}
	else {
		alert("Please click on get parent function button first.");
	}
}


