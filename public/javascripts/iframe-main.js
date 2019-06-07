/**
 * Created by i306534 on 03/06/2019.
 */

let el = document.getElementById("vr-page-title");
el.innerText = "Hello iframe page!";

let utils = new Utils();

utils.registerServices({
	endPoints: {
		getEndPoint: function(oArgs) {
			console.log("@getEndPoint service of endPoints in iframe", oArgs);
		}
	}
});

window.addEventListener("message", Utils.handleMessage);

utils.postMessageToParent(
	{
		commInterface: {
			name: "endPoints",
			service: "getEndPoint"
	}
}, false);
