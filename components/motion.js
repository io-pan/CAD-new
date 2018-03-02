import React, { Component } from 'react';
import {
	Button,
	AppRegistry,
	StyleSheet,
	Text,
	Alert,
	DeviceEventEmitter,
	View,
	Dimensions,
	TouchableHighlight,
	Image,

  WebView,
  Slider,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';             
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';  //  https://material.io/icons/

// import { SensorManager } from 'NativeModules';

const deviceWidth = Dimensions.get('window').width
const deviceHeight = Dimensions.get('window').height

		// Second interpolate beginning and end values (in this case 0 and 1)
var pending = false;	

import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
let source;
const _source = resolveAssetSource(require('./canvas.html')); //  Path = .//components/...
//const _source = resolveAssetSource(require('./panorama.html')); 
if (__DEV__) {
  source = { uri: `${_source.uri}` };   // uri: `file://${_source.uri}?id=${article.id}` 
}
else {
  const sourceAndroid = { uri: 'file:///android_asset/canvas.html'};//const sourceAndroid = { uri: `file:///android_asset/helloworld.html?id=${article.id}` };
  const sourceIOS = { uri: 'file://${_source.uri}?id=${article.id}' };
  source = Platform.OS === 'ios' ? sourceIOS : sourceAndroid;
}


export default class MotionManager extends Component {
	constructor(props) {
		super(props);
		this.state = {
      datetime: new Date(),
			running:  false,
      showText: 'INsIT',
			ligh:{
				light:0,
			},
			deviceOri:false,
      sunpos:false,
      alphaOffsetAngle:0,
      initialAzimuth:false,
      drawCompleted:true,

      pathLayout:{
        day: 'text-fields',   // access-time,
        year: 'linear-scale', // today
        solst: true, // true / false
      },
      targetOn: false,
		};
	}

  pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
  }
 
  date2formatTimePicker(){
    return '' +
      this.pad(this.state.datetime.getDate(),2) +  '/' + 
      this.pad((this.state.datetime.getMonth()+1),2)+' ' + 
      this.pad(this.state.datetime.getHours(),2) + ':' + 
      this.pad(this.state.datetime.getMinutes(),2) ;
  }



  date2formatText(lang=''){
    if(!lang) lang = 'fr';
    var month = { 
      'fr' : ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
      'en' : ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    };

    return '' +
      this.pad(this.state.datetime.getDate(),2) + ' ' + 
      month[lang][this.state.datetime.getMonth()]+ ' ' + 
      
      this.pad(this.state.datetime.getHours(),2) + ':' + 
      this.pad(this.state.datetime.getMinutes(),2);
  }

  onSlider(axe, value) {
    var data = {};
    data[axe] = value;

    // console.log('send msg');
    this.refs.scene.sendToBridge( JSON.stringify(data));
  }
  

  onAlphaOffsetSlider(angle){
    this.refs.scene.sendToBridge( JSON.stringify( {'alphaOffsetAngle':angle} ));
     this.setState({
      alphaOffsetAngle: angle,
    });
  }

  onTimeSlider(dayhour, value) {

    var d0 = new Date(this.state.datetime.getTime());    
    if (dayhour=='hours'){
      d0.setHours(0);
      d0.setMinutes(0);
      d0.setMinutes(value);
    }
    else {
      d0.setDate(1);
      d0.setMonth(0);
      d0.setDate(value);
    }
    this.setState({datetime: d0 }); 

    if(this.state.drawCompleted) {
      this.setState({drawCompleted:false}, function(){
        
      }); 

      // console.log('SEND ---');
      // var dd = new Date();
      // console.log(dd);
      // console.log(dd.getTime());
      this.refs.scene.sendToBridge( JSON.stringify( {'sliderTime':d0.getTime()} ));
    }
    else {
      // will send bridge when callback message will arrive.
      this.lastSliderTime = d0.getTime()
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  onWebviewLoad() {
    this.refs.scene.sendToBridge( JSON.stringify({
  //   point: ponts
    }));
    // this.refs.scene.sendToBridge( JSON.stringify({'vFOV':68}));
  }

	componentDidMount() {
	}


 	componentWillUnmount() {
 	}
  
	handleStart () {
		//Alert.alert('start');
		//SensorManager.startLightSensor(100);
		// SensorManager.startOrientation(100);
	}

	handleStop () {
    //Alert.alert('stop');
		//SensorManager.stopLightSensor();
		// SensorManager.stopOrientation();
	}
  
  onTargetButton () {
    var targetOn = this.state.targetOn;
    this.setState({targetOn:!targetOn});
  }

  onPathLayout (key) {
    var newPathLayout = this.state.pathLayout,
        val = this.state.pathLayout[key];

    if (key=='solst') {
       newPathLayout[key] = !val;
    }
    else {
      if (val == 'access-time' || val == 'today'){
        newPathLayout[key] = 'linear-scale';
      }
      else if (val == 'linear-scale'){  // access-time  // today  //  text-fields
        newPathLayout[key] = 'text-fields';
      }
      else if (val == 'text-fields'){  // access-time  // today  //  text-fields
        newPathLayout[key] = (key == 'day') ? 'access-time' : 'today';
      } 
    }

    this.refs.scene.sendToBridge( JSON.stringify( {'pathLayout':newPathLayout} ));
    this.setState({ pathLayout:newPathLayout });
  }

  onBridgeMessage(webViewData) { 
    let jsonData = JSON.parse(webViewData);
    for (var propertyName in jsonData) {

      if (propertyName=='debug'){
        console.log(jsonData.debug);
        continue;
      } 
console.log( {AppRecive: webViewData} );

      var state = {};
      state[propertyName] = jsonData[propertyName];
      this.setState(state);

      if (propertyName == 'drawCompleted' && this.lastSliderTime) {
        this.setState({drawCompleted:false}, function(){
          this.refs.scene.sendToBridge( JSON.stringify( {'sliderTime':this.lastSliderTime} ));
          this.lastSliderTime = false;
        });
      }
    }
  }

  _renderWebview(){
/*
    if (this.state.initialAzimuth!==false && this.props.vFOV && this.props.loc.lon && this.props.loc.lat) {
      return (
        <WebView  
          ref = "scene"
          style = { styles.w_webView }
          source = {source}
          // source={{uri: "https://threejs.org/examples/css3d_panorama_deviceorientation.html"}}
          // source={{uri: "https://threejs.org/examples/misc_controls_deviceorientation.html"}}

          onBridgeMessage = { this.onBridgeMessage.bind(this) }
          onLoad =  { this.onWebviewLoad.bind(this) }
        />
      );
    }
    else {
      return null;
    }
    */
  }

  

	render () {
		return (
			<View style={styles.container}>

        <View style={styles.w_container}>
          { this._renderWebview() }
        </View>
       
      </View>
		)
	}
}

const styles = StyleSheet.create({ 
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'rgba(0,255,0,0)',
    width: deviceWidth,
    height: deviceHeight,

    position:'absolute',
  },

  row: {
    flex:1,
    width:deviceWidth,
    flexDirection:'row',
    alignItems:'flex-start',
    justifyContent:'space-between',
    marginTop:5,
    marginBottom:5,
  },
  detailBox: {
    padding:15,
    height:75,
    justifyContent:'center'
  },
  button: {
    marginLeft:10,
    marginRight:10,
    marginTop:15,
    backgroundColor:'#0C0',
    borderRadius:10,
    alignItems:'center',
    justifyContent:'center',
    padding:10,
    width:(deviceWidth/2)-40
  },
  text: {
    fontFamily:'Futura',
    fontSize:12
  },
  detail: {
    fontFamily:'Futura',
    fontSize:12,
    fontWeight:'bold'
  },
  json: {
    fontSize: 12,
    fontFamily: 'Courier',
    textAlign: 'center',
    fontWeight:'bold'
  },

  compasscontainer: {
    flex: 1,
    flexDirection: 'column'
  },
  tableContainer: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  table: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  pointer: {

  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    opacity: 0.7
  },




  w_container: {
   width:deviceWidth,
  // alignSelf: 'stretch',
    flex: 1,
    backgroundColor:'rgba(52,52,255,0)',
  },

  w_sliderContainer: {
    position: 'absolute',
    bottom:0,    
    left: 0,
    paddingBottom:5,
    width:deviceWidth,
  // alignSelf: 'stretch',
    backgroundColor:'rgba(255,255,255,0.2)',
  },

  w_webView: {
     alignSelf: 'stretch',
    height: 350,
    backgroundColor:'rgba(0,0,0,0)',
  },
  w_slider: {
    height: 30,
    margin: 0,
    flex: 1,
  },
  w_text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    margin: 0,
    padding: 1,
    width: 38,
  },
  w_sliderHcontainer: {
    height: 30,
    alignSelf: 'stretch',
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  w_sliderVcontainer: {
    alignSelf: 'stretch',
    height: 30,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunposContainer:{
    
  },
  sunpos:{
    textAlign: 'center',
  },

  spiltH:{
    height:40,
    flex:1,
    flexDirection:'row',
    backgroundColor:'rgba(0,0,0,0.3)',
  },

    spiltH_left:{
      position:'relative',
      flex:0.5,
      alignItems: 'center',
      justifyContent: 'center',
    },

     spiltH_leftInner:{  
      height:50,
      flexDirection:'row',
      alignSelf:'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      },

      locationIcon:{
        position:'absolute',
        top:8,left:0,right:0,bottom:0,
        maxHeight:30,
        width:40,
        minHeight:30,
      },
      locationName:{
        paddingLeft:40,
        textAlign:'center',
        color:'white',
      },

    dateText:{
      textAlign:'center',
      marginLeft:10,
      flex:0.8,
      color:'white',
    },
    dateIcon:{
      marginRight:5,
      flex:0.2,
    },

    flex1Row:{
      flex:1,
      flexDirection:'row',      height:40,
    },
    flex05:{
      flex:0.5,

    },

  targetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  target_h: {
    position: 'absolute',
    top: deviceHeight/2,
    left: 0,
    right:0,
    height:1,
    backgroundColor:'red',
  },
  target_v: {
    position: 'absolute',
    top: 0,
    left: deviceWidth/2,
    bottom:0,
    width:1,
    backgroundColor:'red',
  },
});
