/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( object, initialAzimuth=0) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this.nativeAlpha = 0;
	this.alpha = 0;
	this.alphaOffsetAngle = 0;
	this.initialAzimuth = initialAzimuth;
	this.orientation = {alpha:0,beta:0,gamma:0};

	var onDeviceOrientationChangeEvent = function( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function() {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function() {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler ); // orient the device

			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load
		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	this.update = function() {

		if ( scope.enabled === false ) return;

		var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + THREE.Math.degToRad(this.initialAzimuth) + THREE.Math.degToRad(this.alphaOffsetAngle) : 0; // Z
		var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
		var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
		this.alpha = alpha;

		var lat  = Math.asin( Math.cos(beta) * Math.cos(gamma) );
		var lon = Math.round(360-THREE.Math.radToDeg( (alpha+3*Math.PI/2)%(2*Math.PI) ));
		this.orientation = {
			'lat': Math.round(THREE.Math.radToDeg(-lat),10),
			'lon': lon,//scope.deviceOrientation.alpha ?  (scope.deviceOrientation.alpha  + this.alphaOffsetAngle).toFixed(2) : 0,
			'gamma': 0//THREE.Math.radToDeg(gamma).toFixed(2),//scope.deviceOrientation.gamma ?  scope.deviceOrientation.gamma.toFixed(2)  : 0, // Y''
		};

	};

	this.updateAlphaOffsetAngle = function( angle , incr=false) {


		if(WebViewBridge) {
		WebViewBridge.send( JSON.stringify({
		   'debug': {'angle' : angle, 'incr':incr, 'initialAzimuth':this.alphaOffsetAngle }
		})); 
		}

		if (incr) {
			this.alphaOffsetAngle += angle;
		}
		else {
			this.alphaOffsetAngle = angle;
		}
		this.update();

	};

	this.updateInitAzimuth = function( angle, incr=false) {

		if (incr) {
			this.initialAzimuth += angle;
		}
		else {
				this.initialAzimuth = angle;
		}
		this.update();

	};

	this.dispose = function() {

		this.disconnect();

	};

	this.connect();

};