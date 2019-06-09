/**
 * Created by i306534 on 03/06/2019.
 */
class Utils {
	constructor() {
		let that = this;
		this.oTunnels = {};
		this.oEndPoints = {};
		this.UUID = 0;
		this.subscribers = [];
		this.servedFunctions = (function() {
			let subscribers =[];
			return {
				subscribe: function (fnCallback) {
					subscribers.push(fnCallback);
				},
				publish: function(oData) {
					subscribers.forEach(fnCallback => fnCallback(oData));
				}
			}
		})();
		this.services = {
			endPoints: {
				registerEndPointGetter: function(oArgs) {
					let sFuncName = oArgs.sFuncName,
						capitalizedFuncName = sFuncName.charAt(0).toUpperCase() + sFuncName.slice(1);
						oServiceInterface = {};
					oServices = {
						endPoints: {}
					};
					oServiceInterface.endPoints["get" + capitalizedFuncName] = function (oArgs) {
						this.servedFunctions.publish(oArgs);
					};

					that.registerServices(oServices);
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

	exposeFunction(sMethodName, fnMethod) {
		let services = {
			endPoints: {}
		},
			capitalizedFunctionName = sMethodName.charAt(0).toUpperCase() + sMethodName.slice(1),
			iframes = document.getElementsByTagName("iframe");
		services.endPoints["serve" + capitalizedFunctionName] = function(oArgs) {
			console.log("@getEndPoint service of endPoints");
			utils.callChildService(oArgs.frameID, {
				commInterface: {
					name: "endPoints",
					service: "get" + capitalizedFunctionName,
					oArgs: {
						endPointName: sMethodName,
						endPoint: fnMethod
					}
				}
			});
		};

		this.registerServices(services);
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
		this.services = {...this.services, ...oServices}
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

	publishExposedFunctions() {
		this.subscribers.forEach(fn => fn(this.exposedFunctions));
	}

	subscribeExposedFunction(fnCallback) {
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
}