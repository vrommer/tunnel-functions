/**
 * Created by i306534 on 03/06/2019.
 */
class Utils {
	constructor() {
		this.oTunnels = {};
		this.oEndPoints = {};
		this.UUID = 0;
		this.services = {
			endPointInvocation: {
				invokeEndPoint: oArgs => {
					let nUUID = oArgs.nUUID,
						oData = oArgs.oData;
					this.oEndPoints[nUUID].fnCallback(oData);
				}
			}
		};
		window.addEventListener("message", this.handleMessage.bind(this));
	}

	handleMessage(event) {
		let msgData = this.parse(event.data);
		this.handleServiceRequest(msgData);
	}

	createEndPoint(oData) {
		let fnCallback = oData.endPoint,
			sender = oData.sender;
		if (this.oEndPoints[fnCallback]) {
			return {
				type: "endpoint",
				UUID: this.oEndPoints[fnCallback],
				sender: sender
			};
		}
		this.UUID++;

		this.oEndPoints[this.UUID] = {
			fnCallback: fnCallback
		};
		this.oEndPoints[fnCallback] = this.UUID;

		return {
			type: "endpoint",
			UUID: this.UUID,
			sender: sender
		};
	}

	exposeFunctions(oFunctions) {
		for (let fnMethod in oFunctions) {
			if (oFunctions.hasOwnProperty(fnMethod)) {
				this.exposeFunction(fnMethod, oFunctions[fnMethod].fnCallback, oFunctions[fnMethod].context);
			}
		}
	}

	exposeFunction(sFuncName, fnMethod) {
		let services = {
			endPoints: {}
		},
			capitalizedFunctionName = Utils.capitalizeString(sFuncName);
		services.endPoints["serve" + capitalizedFunctionName] = function(oArgs) {
			let sender = oArgs.sender,
				recipient = oArgs.recipient;
			console.log("@getEndPoint service of endPoints");
			utils.callService({
				commInterface: {
					name: "endPoints",
					service: "get" + capitalizedFunctionName,
					oArgs: {
						sender: recipient,
						recipient: sender,
						endPointName: sFuncName,
						endPoint: fnMethod
					}
				}
			});
		};

		this.registerServices(services);
	}

	getExposedFunction(sFuncName, sSender, sRecipient, fnCallback) {

		let oServices = {
			endPoints: {}
		},
			sender = sSender,
			capitalizedFunctionName = Utils.capitalizeString(sFuncName);
		if (sender === "child") {
			sender = window.frameElement.id;
		}
		oServices.endPoints["get" + capitalizedFunctionName] = function(oArgs) {
			fnCallback(oArgs);
		};
		this.registerServices(oServices);
		utils.callService(
			{
				commInterface: {
					name: "endPoints",
					service: "serve" + capitalizedFunctionName,
					oArgs: {
						sender: sender,
						recipient: sRecipient,
					}
				}
			}
		);
	}

	handleServiceRequest(oMessage) {
		if (!oMessage || !oMessage.commInterface) {
			return;
		}

		let commInterface = oMessage.commInterface,
			sName = commInterface.name,
			sService = commInterface.service,
			oServiceParams = commInterface.oArgs;

		if (this.services[sName] && this.services[sName][sService]) {
			this.services[sName][sService](oServiceParams);
		}
	}

	registerServices(oServices) {
		for (let sInterface in oServices) {
			if (oServices.hasOwnProperty(sInterface)) {
				if (this.services.hasOwnProperty(sInterface)) {
					this.services[sInterface] = {...this.services[sInterface], ...oServices[sInterface]};
				}
				else {
					this.services = {...this.services, ...oServices};
				}
			}
		}
	}

	callService(oData) {
		if (oData.commInterface.oArgs.recipient === "parent") {
			this.callParentService(oData);
		} else {
			this.callChildService(oData.commInterface.oArgs.recipient, oData)
		}
	}

	callParentService(oData) {
		window.parent.postMessage(this.stringify(oData));
	}

	callChildService(sFrameID, oData) {
		let iFrame = document.getElementById(sFrameID);
		iFrame.contentWindow.postMessage(this.stringify(oData));
	}

	stringify(oData) {
		let sender = oData && oData.commInterface && oData.commInterface.oArgs && oData.commInterface.oArgs.sender;
		return JSON.stringify(oData, (key, val) => {
			if (typeof val === "function") {

				return this.createEndPoint({
					endPoint: val,
					sender: sender
				});

			}
			return val;
		});
	}

	parse(sData) {
		if (!((typeof sData) === "string")) return;
		return JSON.parse(sData, (key, val) => {
			if (val && val.type === "endpoint") {
				let fnTunnel = () => {
					return this.callService({
						commInterface: {
							name: "endPointInvocation",
							service: "invokeEndPoint",
							oArgs: {
								nUUID: val.UUID,
								oArgs: val.oArgs,
								recipient: val.sender
							}
						}
					});
				};

				this.oTunnels[fnTunnel] = val.UUID;
				return fnTunnel;
			} else if (val.type === "tunnel") {
				return this.oEndPoints[val.UUID].fnCallback;
			}
			return val;
		});
	}

	static capitalizeString(sInput) {
		return sInput.charAt(0).toUpperCase() + sInput.slice(1);
	}
}