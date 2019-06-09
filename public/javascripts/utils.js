/**
 * Created by i306534 on 03/06/2019.
 */
class Utils {
	constructor() {
		let that = this;
		this.oTunnels = {};
		this.oEndPoints = {};
		this.parentFunctions = (function() {
			let subscribers = [];
			return {
				subscribe: function(fnCallback) {
					subscribers.push(fnCallback);
				},
				publish: function() {

				}
			}
		})();
		this.UUID = 0;
		this.childrenSubscribe = {};
		this.subscribers = [];
		this.services = {
			endPoints: {
				exposeSubscribeForChild: function (oArgs) {
					that.exposeSubscribeForChild(oArgs);
				}, parentSubscribe: function(oArgs) {
					oArgs.endPoint(aFunctions => {
						console.log("ASDASd");
						aFunctions.forEach(fn => that.parentFunctions.publish(fn));
					});
				}
			},
			endPointInvocation: {
				invokeEndPoint: function (oArgs) {
					let nUUID = oArgs.nUUID,
						oData = oArgs.oData;
					that.oEndPoints[nUUID].fnCallback(oData);
				}
			}
		};

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
		};
		window.addEventListener("message", Utils.handleMessage);
	}

	static handleMessage(event) {
		let msgData = utils.parse(event.data);
		utils.handleServiceRequest(msgData);
	}

	exposeFunctions(oFunctions) {
		for (let fnMethod in oFunctions) {
			if (oFunctions.hasOwnProperty(fnMethod)) {
				this.exposeFunction(fnMethod, oFunctions[fnMethod]);
			}
		}
	}

	exposeSubscribeForChild(oArgs) {
		let that = this;
		this.callChildService(oArgs.frameID, {
			commInterface: {
				name: "endPoints",
				service: "parentSubscribe",
				oArgs: {
					endPoint: that.subscribeExposedFunctions
				}
			}
		});
	}

	exposeSubscribeForParent(oArgs) {
		this.callParentService({
			commInterface: {
				name: "endPoints",
				service: "parentSubscribe",
				oArgs: {

				}
			}
		});
	}

	requestSubscribe() {

	}

	exposeFunction(sFuncName, fnMethod) {
		let services = {
			endPoints: {}
		},
			capitalizedFunctionName = this.capitalizeString(sFuncName);
		services.endPoints["serve" + capitalizedFunctionName] = function(oArgs) {
			console.log("@getEndPoint service of endPoints");
			utils.callChildService(oArgs.frameID, {
				commInterface: {
					name: "endPoints",
					service: "get" + capitalizedFunctionName,
					oArgs: {
						endPointName: sFuncName,
						endPoint: fnMethod
					}
				}
			});
		};

		this.registerServices(services);
	}

	getExposedFunction(sFuncName, fnCallback) {

		let oServices = {
			endPoints: {}
		},
			capitalizedFunctionName = this.capitalizeString(sFuncName);
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
						frameID: window.frameElement.id
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
		if (oData.commInterface.oArgs.frameID === "parent") {
			this.callChildService(oData.commInterface.oArgs.frameID, oData)
		} else {
			this.callParentService(oData)
		}
	}

	callParentService(oData) {
		window.parent.postMessage(this.stringify(oData));
	}

	callChildService(sFrameID, oData) {
		let iFrame = document.getElementById(sFrameID);
		iFrame.contentWindow.postMessage(this.stringify(oData));
	}

	publishExposedFunction(fnCallback) {
		this.subscribers.forEach(fn => fn([fnCallback]));
	}

	subscribeExposedFunctions(fnCallback) {
		fnCallback(exposedFunctions);
		this.subscribers.push(fnCallback);
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
		if (!((typeof sData) === "string")) return;
		return JSON.parse(sData, (key, val) => {
			if (val && val.type === "endpoint") {
				let fnTunnel = function () {
					return that.callParentService({
						commInterface: {
							name: "endPointInvocation",
							service: "invokeEndPoint",
							oArgs: {
								nUUID: val.UUID,
								oArgs: val.oArgs
							}
						}
					});
				};

				that.oTunnels[fnTunnel] = val.UUID;
				return fnTunnel;
			} else if (val.type === "tunnel") {
				return that.oEndPoints[val.UUID].fnCallback;
			}
			return val;
		});
	}

	capitalizeString(sInput) {
		return sInput.charAt(0).toUpperCase() + sInput.slice(1);
	}
}