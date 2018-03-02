'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Image,
  Dimensions,
  TextInput,
  AsyncStorage,
  FlatList,
  TouchableHighlight,
  ScrollView,
  NetInfo,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';


const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

let locList = [];

/*
  // coords Delta to metters

  def asRadians(degrees):
      return degrees * pi / 180

  def getXYpos(relativeNullPoint, p):
      """ Calculates X and Y distances in meters.
      """
      deltaLatitude = p.latitude - relativeNullPoint.latitude
      deltaLongitude = p.longitude - relativeNullPoint.longitude
      latitudeCircumference = 40075160 * cos(asRadians(relativeNullPoint.latitude))
      resultX = deltaLongitude * latitudeCircumference / 360
      resultY = deltaLatitude * 40008000 / 360
      return resultX, resultY
*/

class MyCustomMarkerView extends Component {
  constructor(props) {
    super(props);
    this.state = { }
  }

  render (){
    return (
      <View style={{ width:5,height:5, backgroundColor:this.props.color}}>
      <Text>{ this.props.title }</Text>
      </View>
    );
  }
}

export default class MapManager extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searching: false,
      name : '',

      // alt: 0,
      selected: false,
      sort: ['time',1],
      editModalOpen:false,
      searchModalOpen:false,
      connected:true,
      // region:{
              latitude: this.props.centerLat,
              longitude: this.props.centerLon,
              latitudeDelta: this.props.latDelta,
              longitudeDelta: this.props.lonDelta,
      // },
    }  

  }


  componentWillMount() {
    if (this.props.curLoc === false) {
      this.setState({selected:false});
    }


      // Now get last selected location
      AsyncStorage.getItem('selectedPlace', (err, selectedPlace) => {
        if (err) {
          // Alert.alert('ERROR getting selectedPlace'+ JSON.stringify(err));
          selectedPlace = 0;
        }
        else {
          selectedPlace = JSON.parse(selectedPlace);
          if (!selectedPlace) {
            selectedPlace = 0;
          }
        } 

        if ( this.props.curLoc === false ) {
          this.props.getLocCallback( places[selectedPlace] );
        }
        else {

        }
      })
  }

  componentDidMount() {
    if (this.props.curLoc !== false) {
/*
      this.setState({
            selected: this.props.curLoc.id, 
            name : this.props.curLoc.name, 
            lat: this.props.curLoc.lat, 
            lon: this.props.curLoc.lon,
      });
*/
      AsyncStorage.getItem('placesSort', (err, placesSort) => {
        if (err) {
          // Alert.alert('ERROR getting placesSort'+ JSON.stringify(err));
          placesSort = ['time',1];
        }
        else {
          placesSort = JSON.parse(placesSort);
          if (!placesSort) {
            placesSort = ['time',1];
          }
        }
        this.setState({sort:placesSort});
      });
    }

    NetInfo.isConnected.addEventListener(
        'change',
        this._handleConnectivityChange
    );
    NetInfo.isConnected.fetch().done(
        (isConnected) => { this.setState({'connected':isConnected}); }
    );
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
        'change',
        this._handleConnectivityChange
    );
  }

  _handleConnectivityChange = (isConnected) => {
    this.setState({'connected':isConnected});
  }

  onRegionChange(region) {
    this.setState({ 
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });
  }

  onRegionChangeComplete(region) {
    this.setState({ 
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    }); 
    // if (this.props.location.id < 0) {
    //   Geocoder.geocodePosition({lat: region.latitude, lng: region.longitude}).then(res => {
    //     this.setState({ 
    //       name: res[0].formattedAddress,
    //     });
    //   })
    //   .catch((error) => {  });
    // }
  }

  _renderMap(){
    if (!this.state.connected) return null

    return(
      <View style={styles.map_container}  >
        <MapView style={styles.map} 
          initialRegion={{
            latitude: this.props.centerLat,
            longitude: this.props.centerLon,
            latitudeDelta: this.props.latDelta,
            longitudeDelta: this.props.lonDelta,
          }} 
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta:  this.state.latitudeDelta,
            longitudeDelta:  this.state.longitudeDelta,
          }}
          onRegionChange = { (region) => this.onRegionChange(region) } 
          onRegionChangeComplete = { (region) => this.onRegionChangeComplete(region) } 
          mapType = "hybrid"
          rotateEnabled= {false}
          pitchEnabled= {false}
        >

           {this.props.points.map(marker => (
              <MapView.Marker
                key={marker.key}
                coordinate={marker.coordinate}
                title={marker.title}
                // pinColor = {marker.color}
                // description={marker.description}
                >
                 <MyCustomMarkerView {...marker} />

              </MapView.Marker>
            ))}

         </MapView>

        {/*
        <View style={styles.target_h}  ></View>
        <View style={styles.target_v}  ></View>
        */}
      </View>   
    );
  }

  render() {
    return (
      <View style={styles.flex1}>
        
        {this._renderMap()}

        <View    pointerEvents="none"
        style={styles.coords}>
          <View style={styles.flex05}>
            <Text>{ this.state.latitudeDelta.toFixed(6)}</Text>
          </View>
          <View style={styles.flex05}>
            <Text>{ this.state.longitudeDelta.toFixed(6)}</Text>
          </View>
        </View> 

      </View> 
    );
  }
}

const styles = StyleSheet.create({ 

  map_container: {
    height:deviceHeight,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  target_h: {
    position: 'absolute',
    top: deviceWidth/2,
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



    listItemNormal: {
      flex:1,
      justifyContent: 'center',
      backgroundColor:'rgba(0,0,0,0.2)',
      paddingLeft: 10,
      paddingTop: 10,
      marginBottom:5,
      // flexDirection:'row'
    },
    listItemHilight: {
      flex:1,
      backgroundColor:'rgba(255,255,255,0.3)',
      paddingLeft: 10,
      paddingTop: 10,
      marginBottom:5,
      // flexDirection:'row',
    },
      listItem:{
        
      },
        listItemInfoContainer: {
          flexDirection:'row',
          flex:0.6,
        },

          listItemName: {
            fontSize: 20,
          },

          listItemCoords: {
            paddingTop:5,
            paddingBottom:10,
            flex:1,
            flexDirection:'row',
          },

        listItemEditContainer :{
          alignSelf: 'flex-end', 
        },

          listItemEditButton: {
            borderRadius:50,
            padding: 10,            
          },

          editCoords:{
            flex:1,
            flexDirection:'row',
            margin:10,
          },

    geopicker: {
      backgroundColor:'rgba(255,255,255,0.5)',
      padding: 10,
      flexDirection:'row',
    },
    gpsButton:{
      marginRight:5,
      flex:0.5,
    },
    gpsSearchText:{
      flex:1,
      textAlign:'center',
      color:'white',
    },
    searchResult: {
      backgroundColor:'rgba(255,255,255,0.8)',
      padding: 10,
      paddingBottom: 10,
      flexDirection:'row',
      marginBottom:5,
    },

      listItemCoordSearch:{
        flexDirection:'row',
        paddingTop:10,
      },

    flex1:{
        flex:1,
    },
    width0:{
      width:0,
      height:0,
    },

    editLocationModal:{
      backgroundColor: 'rgba(250,250,255,0.7)',
    },
    editLocationModal_item:{
      flex:1,
      textAlign:'center',
    },

    coords:{
        flex:1,
        flexDirection:'row',
        position:'absolute',
        top:80,
        left:0,
        right:0,
        backgroundColor:'rgba(255,255,255,0.8)',
      },
    flex1Row:{
        flex:1,
        flexDirection:'row',
      },
     flex05:{
        flex:0.5,
      },
  sortButtonsContainer:{
    flexDirection:'row',
    backgroundColor:'rgba(50,50,55,0.8)',
  },
  sortButton:{
    flex: 0.33,
    height: 30,
  },
});

