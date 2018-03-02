'use strict';

/*
Take Snapshot of map
https://github.com/airbnb/react-native-maps

map::
onPress
onRegionChange
onRegionChangeComplete

*/

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
import Geocoder from 'react-native-geocoder';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

let locList = [];


class LocModal extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.location;
  }
  
  componentDidMount() {

  }

  onLocChanged = (value) => {
    this.setState({lat:value.lat, lon:value.lon });
  }

  onNameChanged = (value) => {
    this.setState({name:value});
  }

  onRegionText(text) {      
    if (text) {
      // Address Geocoding
      Geocoder.geocodeAddress(text).then(res => {
        //console.log(res);
        this.setState({
          name: res[0].formattedAddress,
          lat: res[0].position.lat,
          lon: res[0].position.lng,
        });

        // this.props.getLocCallback({
        //   id:-1,
        //   name:'current position',
        //   lat: res[0].position.lat,
        //   lon: res[0].position.lng,
        // });

      })
      .catch(err => console.log(err))
    }
  }

  _renderDeleteButton() {
    if (locList.length <= 1 || this.props.location.id < 0)  return null;
    return (
      <Icon.Button 
        borderRadius={50}
        size={50}
        style={styles.listItemEditButton} 

        color= {'blue'}
        backgroundColor = {'transparent'}
        iconStyle = {{ borderRadius:50}}
        name="trash-o" 
        onPress = { () => this.props.deleteMe() }
      />
    );
  }

  _renderSearchButton(){
    if (this.props.location.id>=0) return null;
    return (
      <View         style={{margin:10}}>
      <Icon.Button   

        name="search"
        size={30}
        onPress ={ () => this.onSearchPress() }
      >

        <TextInput
          underlineColorAndroid='transparent'
          ref='searchText'
          style={{ 
            backgroundColor:'white', 
            flex:1,
            margin:0, 
            padding:3,
          }}
          onEndEditing =    {(event) => this.onRegionText( event.nativeEvent.text) } 
          onSubmitEditing = {(event) => this.onRegionText( event.nativeEvent.text) } 
        />
      </Icon.Button>
      </View>
    );
  }


  componentDidMount() {
    if (this.props.location.id < 0 ) {
     this.refs.searchText.focus(); 
    }
  }

  render() {
    return (
      <View style={styles.editLocModal} >
        <ScrollView>

            <View style = {styles.flex1Row} >

              <View style = {styles.flex05} >
                {this._renderDeleteButton()}
              </View>

              <View style = {styles.flex05} >
                <View style = {styles.flex1Row} >
                  <View style = {styles.flex05} >
                    <Icon.Button 
                      borderRadius={50}
                      size={50}
                      style={styles.listItemEditButton} 

                      color= {'blue'}
                      backgroundColor = {'transparent'}
                      iconStyle = {{ borderRadius:50}}
                      name="times" 
                      onPress = { this.props.closeMe }
                    />
                  </View>
                  <View style = {styles.flex05} >
                    <Icon.Button 
                      borderRadius={50}
                      size={50}
                      style={styles.listItemEditButton} 
                      color= {'blue'}
                      backgroundColor = {'transparent'}
                      iconStyle = {{ borderRadius:50}}
                      name="check" 
                      onPress ={ () => this.props.locationChanged(this.state) }
                    />
                  </View>
                </View>
              </View>
            </View> 
          

          {this._renderSearchButton()}

          <TextInput
            underlineColorAndroid='transparent'
            defaultValue = {this.props.location.name}
            value= {this.state.name}
            onChangeText={(text) => this.setState({name:text})}
            multiline = {true}
            numberOfLines = {2}
            style = {{ 
              backgroundColor:'white', 
              fontSize:22,
              margin:10, 
              padding:3,
            }}
          />

          <View style = {styles.flex1Row}>
          <View style = {styles.flex05}>
          <Text style = {{color:'white',}}>Latitude</Text>

          <TextInput
            underlineColorAndroid='transparent'
            // keyboardType = 'numeric'
            defaultValue = {''+this.props.location.lat}
            value = {''+this.state.lat}
            onChangeText = {(lat) => this.setState({lat: lat ?parseFloat(lat) :0 })}
            style = {{ 
              backgroundColor:'white', 
              marginTop:5,
              marginRight:8,
              padding:3,
              fontSize:20,
            }}
          />
          </View>

          <View style = {styles.flex05}>
          <Text style={{color:'white',marginLeft:8}}>Longitude</Text>
          <TextInput
            underlineColorAndroid='transparent'
            // keyboardType = 'numeric'
            defaultValue = {''+this.props.location.lon}
            value={''+this.state.lon}
            onChangeText = {(lon) => this.setState({lon: lon ?parseFloat(lon) :0 })}
            style = {{ 
              backgroundColor:'white', 
              marginTop:5,
              marginLeft:8,
              padding:3,
              fontSize:20,
            }}
          />
          </View></View>

          <LocMap
            inititLatitude = {this.state.lat}
            inititLongitude = {this.state.lon}
            onChanged = { this.onLocChanged }
            onAltitudeChanged = {false}
            onNameChanged = { (this.props.location.id < 0) ? this.onNameChanged : false}
          />
        </ScrollView>
      </View>
    )
  }
}

class LocMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
      latitude: this.props.inititLatitude,
      longitude: this.props.inititLongitude,
    };
  }

  onRegionChange(region) {
    region.latitude = parseFloat(region.latitude .toFixed(6));  // 11.1 cm according to 
    region.longitude = parseFloat(region.longitude .toFixed(6)) //  https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude

    this.setState({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });
    this.props.onChanged( {lat:region.latitude , lon:region.longitude} );

    if (this.props.onNameChanged) {
      Geocoder.geocodePosition({
        lat: region.latitude,
        lng: region.longitude
      }).then(res => {
        this.props.onNameChanged( res[0].formattedAddress );
      })
      .catch((error) => {  });
    }

    if (this.props.onAltitudeChanged) {
      fetch('https://maps.googleapis.com/maps/api/elevation/json?locations='+region.latitude+','+region.longitude+'&key=AIzaSyDOIq5v_eD8JAkk4ghZyHQwggqFtwMltwY')
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.status=="OK") {
          this.props.onAltitudeChanged(Math.round(responseJson.results[0].elevation,10));
        }
      })
      .catch((error) => { });     
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      latitude: nextProps.inititLatitude,
      longitude: nextProps.inititLongitude,
    });
  }

  render() {
    return (
      <View style={styles.map_container}  >
        <MapView style={styles.map} 
          initialRegion={{
            latitude: this.props.inititLatitude,
            longitude: this.props.inititLongitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}  
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta:  this.state.latitudeDelta,
            longitudeDelta:  this.state.longitudeDelta,
          }}
          mapType = "hybrid"
          onRegionChange={ (region) => this.onRegionChange(region) } 
        ></MapView>
        <View style={styles.target_h}  ></View>
        <View style={styles.target_v}  ></View>
      </View>
    )
  }
}


class LocListItem extends Component {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  _onEditLoc(id){
     this.props.onEditItem(this.props.id);
  }

  render() {
    return (
      <TouchableHighlight 
        //<style= {(this.props.id == this.props.selected) ? styles.listItemHilight :  styles.listItemNormal}
        onPress={this._onPress}
        >
        <View style= {(this.props.id == this.props.selected) ? styles.listItemHilight :  styles.listItemNormal}>

          <View style={styles.listItemInfoContainer} >
            <Text style={styles.listItemName}> {this.props.title} </Text>
             <View style={styles.flex1Row} >
             <Text style={styles.flex05}> Lat. {this.props.lat} </Text>
             <Text style={styles.flex05}> Lon. {this.props.lon} </Text>
            </View>
          </View>

          <View style={styles.listItemEditContainer} >
          <Icon.Button 
            borderRadius={50}
            size={50}
            style={styles.listItemEditButton} 
    
            color= {'blue'}
            backgroundColor = {'transparent'}
            iconStyle = {{ borderRadius:50}}
            name="edit" 
            onPress = { () => this._onEditLoc(this.props.id)}
          />
          </View>

        </View>
      </TouchableHighlight>
    )
  }
}

export default class GeolocationManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searching: false,
      lieu : '',
      lat: 0,
      lon: 0,
      // alt: 0,

      selected: false,
      editModalOpen:false,
      searchModalOpen:false,
      connected:true,
    };
  }

  // Local storage list
  _keyExtractor = (item, index) => item.id;
  _onPressItem = (id) => {
    this.setState({
      selected:id,
      lieu:locList[id].name,
      lat:locList[id].lat,
      lon:locList[id].lon,
    });
    AsyncStorage.setItem('selectedPlace', JSON.stringify(id));
    this.props.getLocCallback( locList[id] );
  };

  _onEditItem = (id) => {
    this.setState({
      editModalOpen:id,
    });
  };

  _renderItem = ({item}) => (
    <LocListItem
      id={item.id}
      onPressItem={this._onPressItem}
      onEditItem={this._onEditItem}
      selected={this.state.selected}

      title={item.name}
      lat={item.lat}
      lon={item.lon}
    />
  );

  _closeModal = () => {
    this.setState({ 
      editModalOpen:false,
      searchModalOpen:false,
    });
  }

  _updateLocation = (data) => {
    if (this.state.editModalOpen !== false){
      locList[this.state.editModalOpen] = data;
      AsyncStorage.setItem('places', JSON.stringify(locList));
      // force refresh list
      this.setState({ selected:-2 }, function() { 
        this.setState({ selected:this.state.editModalOpen}, function(){
          this._closeModal();
        });
      }); 
    }
    else if(this.state.searchModalOpen) {
      this.setState({ 
        selected:-1,
        lieu:data.name,
        lat:data.lat,
        lon:data.lon,
      }, function() { 
        this._closeModal();
      }); 
    }
  }

  _deleteLocation = () => {
    locList.splice(this.state.editModalOpen, 1);
    // reset ids
    var ii = 0; 
    for (var i in locList) {
      locList[i]['id'] = ii;
      ii++;
    }
    AsyncStorage.setItem('places', JSON.stringify(locList));

    var cursel = this.state.selected;
    if (this.state.selected == this.state.editModalOpen) {
      cursel = 0;
      this.setState({ selected:cursel });
      AsyncStorage.setItem('selectedPlace', JSON.stringify(cursel));
      this.props.getLocCallback( locList[cursel] );
    }
    // force refresh list
    this.setState({ selected:-2 }, function() { 
      this.setState({ selected:cursel }, function(){
        this._closeModal();
      });
    }); 
 }

  _renderEditModal () {
    if (this.state.editModalOpen===false && !this.state.searchModalOpen) return null;
    return (
      <LocModal
        location = {this.state.searchModalOpen ? {id:-1, name:'', lat:0, lon:0} : locList[this.state.editModalOpen]}
        locationChanged = {this._updateLocation}
        deleteMe = { this._deleteLocation}
        closeMe = { this._closeModal }
      />
    );
  }

  onSearchPress() {
    this.setState({searchModalOpen:true});
  };

  getLoc () {
    // Alert.alert('start');
    if (!this.state.searching) {
      this.setState({searching:true});
      navigator.geolocation.getCurrentPosition(
        (position) => {

          this.setState({
            searching: false,
            lat: parseFloat(position.coords.latitude.toFixed(6)),
            lon: parseFloat(position.coords.longitude.toFixed(6)),
            alt: Math.round(position.coords.altitude, 10),
            selected:-1,
          });

          this.props.getLocCallback({
            id:-1,
            name:'current position',
            lat:position.coords.latitude,
            lon:position.coords.longitude,
          });

          Geocoder.geocodePosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }).then(res => {
            this.setState({
              lieu: res[0].formattedAddress,
            });
          })
          .catch(err => console.log(err))
        },
        (error) => {
          this.setState({searching:false});
          alert(JSON.stringify(error))
        },
        {enableHighAccuracy: true, timeout: 30000, maximumAge: 1000}
      );
    }
  }

  onLocChanged = (value) => {
    this.setState({lat:value.lat, lon:value.lon });
  }

  onLocNameChanged = (value) => {
    this.setState({ lieu: value });
  }

  componentWillMount() {
    // get stored locations
    AsyncStorage.getItem('places', (err, places) => {

      if (err) {
        Alert.alert('ERROR getting locations'+ JSON.stringify(err));
        places = [];
      }
      else {
        places = JSON.parse(places);
      }
      if (!places || !places.length) {
        // Set default data
        // var addDate = new Date();
        // addDate = addDate.getTime();
        places = [
          {
            "id":0,
            "name":'North Pole',
            "lat": 0,
            "lon": 0,
          },{
            "id":1,
            'name':'Grímsey (Arctic Circle)',
            'lat':  66.5419482,
            'lon': -18.0021247,
          },{
            "id":2,
            "name":'Greenwich',
            "lat":  51.476852,
            "lon":  -0.000500,
          },{
            "id":3,
            'name': 'Mayapur (Tropic of Cancer)',
            'lat': 23.423201,
            'lon': 88.388268,
          },{
            "id":4,
            'name':'Singapore (Equator)',
            'lat':   1.290270,
            'lon': 103.851959,
          },{
            "id":5,
            'name':'Antofagasta (Tropic of Capricorn)',
            'lat': -23.650000,
            'lon': -70.400002,
          }
        ];
        AsyncStorage.setItem('places', JSON.stringify(places));
      }
      locList = places;

      // Now get last selected location
      AsyncStorage.getItem('selectedPlace', (err, selectedPlace) => {
        //Alert.alert('selectedPlace '+selectedPlace);
        if (err) {
          Alert.alert('ERROR getting selectedPlace'+ JSON.stringify(err));
          selectedPlace = 0;
        }
        else {
          selectedPlace = JSON.parse(selectedPlace);
          if (!selectedPlace) {
            selectedPlace = 0;
          }
        } 
        if ( !this.props.curLoc ) {
          this.props.getLocCallback( places[selectedPlace] );
        }
        else {
          // !!! this.setState({selected:selectedPlace});
        }
      });
    });
  }



  componentDidMount() {
    if (this.props.curLoc !== false) {
      this.setState({selected:this.props.curLoc});
    }

    NetInfo.isConnected.fetch().then(isConnected => {
      this.setState({connected:isConnected});
    });

    NetInfo.isConnected.addEventListener('change', (connected)=> { 
      this.setState({connected:connected});
    });
  }
  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('change');
  }


  _onAddLoc() {
    var newLoc = {
      id:locList.length,
      name: this.state.lieu,
      lat: this.state.lat,
      lon: this.state.lon,
    };

    locList.unshift(newLoc);
    // reset ids
    var ii = 0; 
    for (var i in locList) {
      locList[i]['id'] = ii;
      ii++;
    }
    AsyncStorage.setItem('places', JSON.stringify(locList));
    this.setState({ 'selected': 0 });
    AsyncStorage.setItem('selectedPlace', JSON.stringify(0));
  }

  _renderSearchButton() {
    if (this.state.connected) {
      return (
        <View style={ this.state.searching ? styles.width0  : styles.flex05  }>
          <Icon.Button   
            name="search"
            size={30}
            onPress ={ () => this.onSearchPress() }
          >
          </Icon.Button>
        </View>
      );
    }
    else {
      return(
        <View style={ this.state.searching ? styles.width0  : styles.flex1  }>
          <Icon.Button   
            name="search"
            size={30}
            backgroundColor='grey'
          >
            <Text style={{fontSize:20, flex:1, textAlign:'center', color:'white', padding:3,}}>
            Réseau indisponible
            </Text>
          </Icon.Button>
        </View>
      );
    }
  }

  _renderSearchResult() {
    if (this.state.selected < 0) {
      return (
        <View >
          <View style= {styles.searchResult}>
            <View style={styles.listItemInfoContainer} >
              <Text style={styles.listItemName}> {this.state.lieu} </Text>
              <View style={styles.flex1Row}>
              <Text  style={styles.flex05} > Lat. {this.state.lat} </Text>
              <Text  style={styles.flex05} > Lon. {this.state.lon} </Text>
              </View>
            </View>
            <View style={styles.listItemEditContainer} >
              <Icon.Button 
                borderRadius={50}
                size={50}
                style={styles.listItemEditButton} 

                color= {'blue'}
                backgroundColor = {'transparent'}
                iconStyle = {{ borderRadius:50}}
                name="plus-circle" 
                onPress = { () => this._onAddLoc()}
              />
            </View>
          </View>

        </View>
      );
    }
    else {
      return null;
    }
  }

  _renderGeoPicker () {
    if (this.state.selected===false) {
      return null;
    }
    else {
      return (
        <View>
    
          <View style= {styles.geopicker}>
            <View style={ this.state.searching ? styles.flex1  : styles.gpsButton  } >
              <Icon.Button
                name = { (this.state.searching) ?  "circle-o-notch":"bullseye"}
                size={30}
                color="white"
                style={{ height:50, paddingLeft:15,}}  
                onPress={ () => this.getLoc()} 
              >
                <Text style={ this.state.searching ? styles.gpsSearchText  : styles.width0  }>
                 Recherche de votre position ...
                </Text>
              </Icon.Button>
            </View>

            {this._renderSearchButton()}
          </View>
          
          {this._renderSearchResult()}

        </View>
      );
    }
  }

  _renderList(){
     if (this.state.editModalOpen!==false || this.state.searchModalOpen) return null;
     
     return(
      <View>
      {this._renderGeoPicker()}
      <FlatList
        data={locList}
        extraData={this.state.selected} 
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
      />
      </View>
    );
  }

  render() {
    if (this.props.curLoc===false) {
      return null;
    }

    return (
      <ScrollView>   
        {this._renderList()}
        {this._renderEditModal()}
      </ScrollView> 
    );
  }
}

const styles = StyleSheet.create({ 

  map_container: {
    height:deviceWidth,
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
      backgroundColor:'rgba(255,255,255,0.5)',
      padding: 10,
      marginTop:5,
      flexDirection:'row'
    },
    listItemHilight: {
      backgroundColor:'rgba(255,255,255,0.8)',
      padding: 10,
      marginTop:5,
      flexDirection:'row',
    },
      listItem:{
        
      },
        listItemInfoContainer: {
          flex:0.6,
        },

          listItemName: {
            fontSize: 20,
          },

        listItemEditContainer :{
     //     flex:0.4,
          alignSelf: 'flex-end', 
        },

          listItemEditButton: {
            borderRadius:50,
            padding: 10,
            backgroundColor:'transparent',
            
          },

    geopicker: {
      backgroundColor:'rgba(255,255,255,0.5)',
      padding: 10,
      flexDirection:'row',
      flex:1,
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
      flexDirection:'row',
    },
    flex1:{
        flex:1,
    },
    width0:{
      width:0,
      height:0,
    },

    editLocModal:{

      backgroundColor: 'rgba(100,100,140,1)',

    },
    editLocModal_item:{
      flex:1,
      textAlign:'center',
    },

    flex1Row:{
        flex:1,
        flexDirection:'row',
        margin:10,
        marginTop:0,
      },
     flex05:{
        flex:0.5,
      },
  
});

/*
            <MapView.Marker draggable
              coordinate={{
                latitude: this.state.lat,
                longitude: this.state.lon,
              }}

              onDragEnd={ (e) => console.log( e.nativeEvent.coordinate )   }
            />
*/