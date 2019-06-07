/**
 * Created by i306534 on 03/06/2019.
 */
class Utils {
	constructor() {
		this.oTunnels = {};
		this.oEndPoints = {};
		this.UUID = 0;
		this.services = {};
		this.createEndPoint = fnCallback => {
			if (this.oEndPoints[fnCallback]) {
				return {
					type: "endpoint",
					UUID: this.oEndPoints[fnCallback]
				};
			}
			this.UUID++;

			this.oEndPoints[this.UUID] = {
				fnCallback: fnCallback
			};
			this.oEndPoints[fnCallback] = this.UUID;

			return {
				type: "endpoint",
				UUID: this.UUID
			};
		}
	}

	static handleMessage(event) {
		let msgData = utils.parse(event.data);
		utils.handleServiceRequest(msgData);
	}

	static handleResponseMessage(event) {
		return utils.parse(event.data);
	}

	handleServiceRequest(oMessage) {
		if (!oMessage.commInterface) {
			return;
		}

		let commInterface = oMessage.commInterface,
			sName = commInterface.name,
			sService = commInterface.service,
			oServiceParams = commInterface.args;

		if (this.services[sName] && this.services[sName][sService]) {
			this.services[sName][sService](oServiceParams);
		}
	}

	registerServices(oServices) {
		this.services = {...this.services, ...oServices}
	}

	postMessageToParent(oData, waitForResponse) {
		return new Promise((resolve) => {
			if (waitForResponse) {
				window.addEventListener("message", (event) => {
					resolve(event);
					window.removeEventListener("message", resolve);
				});
			}
			window.parent.postMessage(this.stringify(oData));
		});
	}

	postMessageToChild(iframeId, oData, waitForResponse) {
		return new Promise((resolve) => {
			let iFrame = document.getElementById(iframeId);
			if (waitForResponse) {
				window.addEventListener("message", (event) => {
					resolve(event);
					window.removeEventListener("message", resolve);
				});
			}
			iFrame.contentWindow.postMessage(this.stringify(oData));
		});
	}

	stringify(oData) {
		let that = this;
		return JSON.stringify(oData, (key, val) => {
			if (typeof val === "function") {
				let nUUID = that.oEndPoints[val];

				if (nUUID) {
					return {
						type: "endpoint",
						UUID: nUUID
					};
				}
				return that.createEndPoint(val);

			}
			return val;
		});
	}

	parse(sData) {
		let that = this;
		return JSON.parse(sData, (key, val) => {
			if (val && val.type === "endpoint") {
				let fnTunnel = function () {
					return that.postMessageToParent({
							UUID: val.UUID,
							arguments: arguments
						}
					);
				};

				that.oTunnels[fnTunnel] = val.UUID;
				return fnTunnel;
			} else if (val.type === "tunnel") {
				return that.oEndPoints[val.UUID].fnCallback;
			}
			return val;
		});
	}
}