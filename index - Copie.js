import React, { Component } from 'react';
import {
  AppRegistry,
  Button, 
  Text,
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Navigator,
  StatusBar,
  BackHandler,
  AsyncStorage,

} from 'react-native';

                               
import SCX from './components/scX';
import SC1 from './components/sc1';
import MAP from './components/map';
import MOT from './components/motion';
import GEO from './components/location';
import IMG from './components/img';

import Orientation from 'react-native-orientation';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNExitApp from 'react-native-exit-app';
import KeepScreenOn from 'react-native-keep-screen-on';


const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
let markerList = [];
  let color = '#0000ff';

export default class CAD extends Component {  

  constructor(props) {
    super(props);
    this.state = {
      maskOn:true,
      menuOpen: true,
      pageHeight: Dimensions.get('window').height,
      pageWidth: Dimensions.get('window').width,
      camOn: false,
      sensorsOn: true,
      locOn: false,
      view: 'panorama',  //orbit , panorama
      viewGMap: false,
      viewMap: false,

      
      loc: false,
      markerList:[],
      centerLat:45,
      centerLon:4,
      latDelta:0.002,
      lonDelta:0.002,
    };
  }

  onOriChange = (ori) => {
    this.setState({ ori: ori});
  }
  
  onMenuPress = () => {
    this.setState({ menuOpen: !this.state.menuOpen}, function() {
    });
  }

  onPressLoc = () => {
    this.setState({ menuOpen: true}, function() {
      this.setState({ locOn: true});
    });
  }

  onToggleCam = (camOn) => {
    this.setState({ camOn:camOn});
  }

  onToggleView = (view) => {
    this.setState({ view:view});
  }
  onToggleMap = (map) => {
    this.setState({ viewMap:map});
  }
  onToggleGMap = (map) => {
    this.setState({ viewGMap:map});
  }
  onToggleSensors = (sensorsOn) => {
    this.setState({ sensorsOn:sensorsOn});
  }


  onToggleLoc = (loc) => {
    this.setState({ locOn:loc});
  }



  recMarkers (list, curColor){

    if (list.groups) {
      for ( var i in list.groups) {
        this.recMarkers(list.groups[i],  list.groups[i].color ? list.groups[i].color :curColor);
      } 
    }
    else if (list.lat) {
      markerList.push({
        key:markerList.length,
        title:list.name,
        coordinate: {latitude: list.lat, longitude: list.lon},
        color: curColor,
      });
    }
  }


  gotNewLoc = (place) => {
    this.setState({
      loc:place,
      // locOn:false
    });
    markerList = [];

    this.recMarkers(place, '#000000');
    console.log('markerList');
    console.log(markerList);

    this.setState({  markerList:markerList, });

    // get center
    let latMax = -180, 
        latMin = 180, 
        lonMax = -90, 
        lonMin = 90;
    for ( var i in markerList) {
      if (latMin > markerList[i].coordinate.latitude) {
        latMin =  markerList[i].coordinate.latitude;
      }
      if (latMax < markerList[i].coordinate.latitude) {
        latMax =  markerList[i].coordinate.latitude;
      }
      if (lonMin > markerList[i].coordinate.longitude) {
        lonMin = markerList[i].coordinate.longitude;
      }
      if (lonMax < markerList[i].coordinate.longitude) {
        lonMax = markerList[i].coordinate.longitude;
      }
    }
    this.setState({
      centerLat: (latMin+latMax) /2,
      centerLon: (lonMin+lonMax) /2,
      latDelta: latMax-latMin,
      lonDelta: lonMax-lonMin,
    });
  }

  menuStyle() {
    return (this.state.menuOpen) ? styles.menu_open :  styles.menu_close;
  }
  maskStyle() {
    return (this.state.maskOn) ? styles.modal :  styles.transparent;
  }
 


  componentWillMount() {
    StatusBar.setHidden(true);
    Orientation.lockToPortrait();
    KeepScreenOn.setKeepScreenOn(true);

    BackHandler.addEventListener('hardwareBackPress', function() {
       RNExitApp.exitApp();
    });

    Orientation.lockToPortrait();
  }

  componentWillUnmount() {
    // Remember to remove listener
    Orientation.removeOrientationListener(this._orientationDidChange);
  }

  _renderMenu = () => {
    if (this.state.menuOpen) {
      return(
          <View style = { styles.menu_open } >
            <SC1 style={styles.header} 
              motion ="0"
              map ="0"
              
              sensors = { this.state.sensorsOn }
              sensorsToggleCallback = { this.onToggleSensors }
            
              view = { this.state.view }
              viewToggleCallback = { this.onToggleView }
              viewMap = { this.state.viewMap }
              viewGMap = { this.state.viewGMap }
              viewBgToggleCallback = { this.onToggleViewBg }
              loc = { this.state.locOn }
              locToggleCallback = { this.onToggleLoc }
              
              toggleMapCallback = { this.onToggleMap }
              toggleGMapCallback = { this.onToggleGMap }
            />

          </View>
      );
    }
  }

  _renderLocation = () => {
    if (this.state.loc===false){
      return(
        <GEO 
          curLoc = { false }
          getLocCallback = { this.gotNewLoc }
        />
      );
    }
    else if (this.state.locOn && this.state.menuOpen) {
      return(
          <View 
            style = { styles.subPage } 
            //style = { this.menuStyle() } 
            >
           
              <GEO 
                curLoc= { this.state.loc }
                getLocCallback = { this.gotNewLoc }
              />
 
          
          </View>
      );
    }
  }

  _renderCanvas(){
    if (this.state.loc!==false) {
      return (
        <MOT 
          // sensorsOn = { this.state.sensorsOn }
          // sensorsToggleCallback = { this.onToggleSensors }
          // oriCallback = { this.onOriChange }
          pressPlaceCallback = { this.onPressLoc }
          // vFOV = { this.state.vFOV }
          // view = { this.state.view }
          // viewBg = { this.state.viewBg }
          loc = { this.state.loc }
          style = {{
            position: 'absolute',
            left:     0,
            top:      0,
            width: this.state.pageWidth,
            height: this.state.pageHeight,
            backgroundColor:'rgba(255,255,0,0.5)',
          }}
        />
      );
    }
    else {
      return (null);
    }
  }

  _renderImg(){
    if (this.state.viewMap){
      return (
        <IMG
        
        />
      );
    }
    else {
      return (null);
    }
  }
  _renderMap(){
    if (this.state.viewGMap){
      return (
        <MAP
          points = { this.state.markerList } 
          centerLat = {this.state.centerLat}
          centerLon = {this.state.centerLon}
          latDelta = {this.state.latDelta}
          lonDelta = {this.state.lonDelta}
        />
      );
    }
    else {
      return (null);
    }
  }

  render() {
    return (
      //
      <View ref="main"
        style = { styles.opaque } 
        >

        { this._renderCanvas()}
        { this._renderLocation() }
        { this._renderMap() }
        { this._renderImg() }
        { this._renderMenu() }

        <View 
          style = {{
            position: 'absolute',
            top: 0,
            left: 0,
            height: this.state.pageHeight,
          }} 
          >
          <Icon.Button name="bars" backgroundColor="#3b5998"
            onPress = { this.onMenuPress }
          ></Icon.Button>
        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  transparent: {
    position: 'absolute',
    top:-100,    
    left: 0,
   
    backgroundColor: 'rgba(0,0,0,0)',

  },
  opaque: {
    alignSelf: 'stretch',
    flex:1,
    backgroundColor:'rgba(10,20,30,1)',
  },
  header: {
    height:20,
  },

  modal:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,1)',
    alignItems: 'center',
    justifyContent: 'center',
},
  body: {
    alignSelf: 'stretch',
    height:500,
  },
  footer:{
    flex: 1, 
  },
  app_overlay: {

  },

  menu_open: {
    position: 'absolute',
    left:     0,
    top:      0,
    backgroundColor:'rgba(0,0,255,0.5)',
  },
  subPage: {
    position: 'absolute',
    top:0,
    bottom:0,
    right:0,
    left:0,
    paddingTop:50,
  },
  menu_close: {
    position: 'absolute',
    left:     0,
    top:      0,
    backgroundColor:'rgba(0,0,0,0)',
    height:0,
    width:0,
  },

});
AppRegistry.registerComponent('CAD', () => CAD);
