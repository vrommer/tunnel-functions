/**
 * Created by i306534 on 03/06/2019.
 */

let el = document.getElementById("vr-page-title");
el.innerText = "Hello main page!";

let utils = new Utils();

utils.registerServices({
	endPoints: {
		getEndPoint: function() {
			console.log("@getEndPoint service of endPoints");
			utils.postMessageToChild("vr-ifame-page", {
				commInterface: {
					name: "endPoints",
					service: "getEndPoint",
					args: {abc: "abc"}
				}
			}, false);
		}
	}
});

function endPoint() {
	console.log("This function is defined in parent!");
}

window.addEventListener('message', Utils.handleMessage);