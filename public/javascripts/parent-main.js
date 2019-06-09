/**
 * Created by i306534 on 03/06/2019.
 */

let el = document.getElementById("vr-page-title");
el.innerText = "Hello main page!";

let utils = new Utils();

utils.exposeFunctions({
	parentFunction: parentFunction
});

function parentFunction() {
	alert("This function is defined in parent!");
}