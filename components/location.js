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

class LocationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.location.name,
      lat: this.props.location.lat,
      lon: this.props.location.lon,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,   
    }

    this.makeCancelable = (promise) => {
      let hasCanceled_ = false;
      const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
          val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
          error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
        );
      });
      return {
        promise: wrappedPromise,
        cancel() {
          hasCanceled_ = true;
        },
      };
    };
    this.geocodeAddressPromise = false;
  }

  onRegionText(text) {
    // if (text) {
    //   this.geocodeAddressPromise = this.makeCancelable(Geocoder.geocodeAddress(text));
    //   this.geocodeAddressPromise
    //     .promise
    //     .then((val) =>  {
    //       if (val.length) {
    //         this.setState({ 
    //           name: val[0].formattedAddress,
    //           lat: val[0].position.lat,
    //           lon: val[0].position.lng,
    //         })
    //       }
    //       else {
    //         this.setState({ 
    //           name: 'lieu inconnu.',
    //           lat: 0,
    //           lon: 0,
    //         })
    //       }
    //     })
    //     /*.catch((reason) => console.log('isCanceled', reason))*/;
    // }
  }

  onRegionChange(region) {
    this.setState({ 
      lat: region.latitude,
      lon: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });
  }

  onRegionChangeComplete(region) {
    this.setState({ 
      lat: region.latitude,
      lon: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    }); 
    if (this.props.location.id < 0) {
      // Geocoder.geocodePosition({lat: region.latitude, lng: region.longitude}).then(res => {
      //   this.setState({ 
      //     name: res[0].formattedAddress,
      //   });
      // })
      // .catch((error) => {  });
    }
  }

  _renderDeleteButton() {
    if (this.props.location.id < 0){
      return (
        <Icon.Button 
          borderRadius={50}
          size={50}
          style={styles.listItemEditButton} 
          color="rgba(50,50,55,0.8)"
          backgroundColor = {'transparent'}
          iconStyle = {{ borderRadius:50}}

          name="plus-circle" 
          onPress = { () => this.props.addMe({
            id: this.props.location.id, 
            name:this.state.name, 
            lat: parseFloat(this.state.lat.toFixed(6)),
            lon: parseFloat(this.state.lon.toFixed(6))
          })}
        />
      );
    }
    else {
      return (
        <Icon.Button 
          borderRadius={50}
          size={50}
          style={styles.listItemEditButton} 
          color="rgba(50,50,55,0.8)"
          backgroundColor = {'transparent'}
          iconStyle = {{ borderRadius:50}}

          name="trash-o" 
          onPress = { () => this.props.deleteMe() }
        />
      );
    }
  }

  _renderSearchButton(){
    if (this.props.location.id>=0) return null;
    return (
      <View style={{margin:10}}>
        <Icon.Button   
          name="search"
          size={30}
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

  _renderMap(){
    if (!this.props.connected) return null;
    return(
      <View style={styles.map_container}  >
        <MapView style={styles.map} 
          initialRegion={{
            latitude: this.props.location.lat,
            longitude: this.props.location.lon,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }} 
          region={{
            latitude: this.state.lat,
            longitude: this.state.lon,
            latitudeDelta:  this.state.latitudeDelta,
            longitudeDelta:  this.state.longitudeDelta,
          }}
          mapType = "hybrid"
          onRegionChange = { (region) => this.onRegionChange(region) } 
          onRegionChangeComplete = { (region) => this.onRegionChangeComplete(region) } 
        ></MapView>
        <View style={styles.target_h}  ></View>
        <View style={styles.target_v}  ></View>
      </View>   
    );
  }
  componentDidMount() {
    if (this.props.location.id < 0 ) {
     this.refs.searchText.focus(); 
    }
  }

  componentWillUnmount() {
    if (this.geocodeAddressPromise){
      this.geocodeAddressPromise.cancel();
    }
  }

  render() {
    return (
      <View style={styles.editLocationModal} >
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
                      color="rgba(50,50,55,0.8)"
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
                      color="rgba(50,50,55,0.8)"
                      backgroundColor = {'transparent'}
                      iconStyle = {{ borderRadius:50}}

                      name="check" 
                      onPress = { () => this.props.locationChanged({
                        id: this.props.location.id, 
                        name:this.state.name, 
                        lat: parseFloat(this.state.lat.toFixed(6)),
                        lon: parseFloat(this.state.lon.toFixed(6))
                      })}
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
              padding:5,
            }}
          />

          <View style = {styles.editCoords}>
            <View style = {styles.flex05}>
              <Text style = {{color:'white',}}>Latitude</Text>
              <TextInput
                underlineColorAndroid='transparent'
                // keyboardType = 'numeric'
                defaultValue = {this.state.lat.toFixed(6)}
                style = {{ 
                  backgroundColor:'white', 
                  marginTop:5,
                  marginRight:8,
                  padding:5,
                  fontSize:20,
                }}
                onEndEditing = {(event) => this.setState({lat: parseFloat(event.nativeEvent.text)
                                                          ? parseFloat( parseFloat(event.nativeEvent.text).toFixed(6)) 
                                                          : 0 }) }
                onSubmitEditing = {(event) => this.setState({lat: parseFloat(event.nativeEvent.text)
                                                          ? parseFloat( parseFloat(event.nativeEvent.text).toFixed(6)) 
                                                           : 0 }) }
              />
            </View>
            <View style = {styles.flex05}>
              <Text style={{color:'white',marginLeft:8}}>Longitude</Text>
              <TextInput
                underlineColorAndroid='transparent'
                // keyboardType = 'numeric'
                defaultValue = {this.state.lon.toFixed(6)}
                style = {{ 
                  backgroundColor:'white', 
                  marginTop:5,
                  marginLeft:8,
                  padding:5,
                  fontSize:20,
                }}
                onEndEditing = {(event) => this.setState({lon: parseFloat(event.nativeEvent.text)
                                                          ? parseFloat( parseFloat(event.nativeEvent.text).toFixed(6)) 
                                                          : 0 }) }

                onSubmitEditing = {(event) => this.setState({lon: parseFloat(event.nativeEvent.text)
                                                           ? parseFloat( parseFloat(event.nativeEvent.text).toFixed(6)) 
                                                           : 0 }) }
              />
            </View>
          </View>

          {this._renderMap()}

        </ScrollView>
      </View>
    )
  }
}
// end location modal -------------------------------------------------------------------------------------------


class LocationGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected,
    }
  }

  // Local storage list
  _keyExtractor = (item, index) => item.id;

  _onPress = () => {
    this.props.onPressItemCallback(this.props.id);
  };

  onPressItemCallback = (id) => {
    this.setState({
      selected:id,
    });
    this.props.onPressItemCallback(this.props.id);
  };



  _onAddGroup() {
    console.log(this.props.path);

    let keys = this.props.path.split(",");
    let item = locList;

    for(var i in keys) {
      if (keys[i] !='root' && item[keys[i]].groups) {
        item = item[keys[i]].groups;
      }
    }

    let newGroup = {
      'id':item.length,
      'name':''+(item.length),
      'groups':[],
    };
    item.push(newGroup);

    //  // reset ids
    // var ii = 0; 
    // for (var i in locList) {
    //   locList[i]['id'] = ii;
    //   ii++;
    // }
    AsyncStorage.setItem('places', JSON.stringify(locList));
    this.props.onPressItemCallback(this.props.id);  // refresh list
  }

  _onAddPoint() {
    if (!this.state.searching) {
      this.setState({searching:true});
      navigator.geolocation.getCurrentPosition(
        (position) => {

          let keys = this.props.path.split(",");
          let item = locList;

          for(var i in keys) {
            if (keys[i] !='root' && item[keys[i]].groups) {
              item = item[keys[i]].groups;
            }
          }

          let newPoint =  {
            'id': item.length,
            'name': ''+(item.length),
            'lat': parseFloat(position.coords.latitude.toFixed(6)),
            'lon': parseFloat(position.coords.longitude.toFixed(6)),
            'alt': Math.round(position.coords.altitude, 10),
          };

          if (!newPoint.alt) {
            // fetch('https://maps.googleapis.com/maps/api/elevation/json?locations='+region.latitude+','+region.longitude+'&key=xxxxxxxxxxxxxxxxxxx')
            // .then((response) => response.json())
            // .then((responseJson) => {
            //   if(responseJson.status=="OK") {
            //     this.props.onAltitudeChanged(Math.round(responseJson.results[0].elevation,10));
            //   }
            // })
            // .catch((error) => { });     
          }

          item.push(newPoint);
          AsyncStorage.setItem('places', JSON.stringify(locList));
          this.setState({
            searching: false, 
          });
          this.props.onPressItemCallback(this.props.id);  // refresh list
        },
        (error) => {
          this.setState({searching:false});
          alert(JSON.stringify(error))
        },
        {enableHighAccuracy: true, timeout: 30000, maximumAge: 1000}
      );
    }
  }

  _onDeleteItem() {
    console.log(this.props.path);
    console.log(locList);

    let keys = this.props.path.split(",");
    let item = locList;

    for(var i in keys) {
      if (keys[i] !='root' && item[keys[i]].groups && item[keys[i]].groups.length) {
        item = item[keys[i]].groups;
      }
    }

    item.splice(keys[i], 1);

     // reset ids
    var ii = 0; 
    for (var i in item) {
      item[i]['id'] = ii;
      ii++;
    }

    AsyncStorage.setItem('places', JSON.stringify(locList));
    this.props.onPressItemCallback(this.props.id);  // refresh list
  }

  _onChangeName(name) {
    console.log(this.props.path);

    let keys = this.props.path.split(",");
    let item = locList;

    for(var i=0; i<keys.length-1; i++) {
      if (keys[i] !='root' && item[keys[i]].groups) {
        item = item[keys[i]].groups;
      }
    }
    item[keys[i]].name = name;
    AsyncStorage.setItem('places', JSON.stringify(locList));
    this.props.onPressItemCallback(this.props.id);  // refresh list
  }

  __renderGroup = (item) => {
    return (
      <LocationGroup
        style={styles.flex1}

        id={item.id}
        selected={this.state.selected}
        parentSelected={this.props.id==this.props.selected && this.props.parentSelected }

        onPressItemCallback={this.onPressItemCallback}
        // onEditItem={(id) => this._onEditItem(item.id)}

        root={this.props.id<0}
        name={item.name}
        lat={item.lat ? item.lat : false}
        lon={item.lon ? item.lon : false}

        groups={item.groups}

        path = {this.props.path+','+item.id}
      />
    );
  };

  _renderGroup = ({item}) => (
    this.__renderGroup(item) 
  );

  _renderList() {
    if (!this.props.groups) return null;
    return(
      <FlatList
        data={this.props.groups}
        extraData={[this.state.selected, this.props.parentSelected,this.state.lastUpdate]} 
        keyExtractor={this._keyExtractor}
        renderItem={this._renderGroup}
      />
    );
  }

  render() {
    let itemName = null,
        coords = null,
        addGroupButton = null,
        addPointButton = null,
        deleteButton = null;
        

    //  (this.props.root not used anymore
    // if (this.props.root || !this.props.groups) {
    //   hasLat =  <View style={styles.listItemCoords} ><Text style={styles.flex05}> {this.props.id} Lat. {this.props.lat}</Text><Text style={styles.flex05}>Lon. {this.props.lon}</Text></View>;
    // }
    if (this.props.id == this.props.selected && this.props.parentSelected){
      itemName = <TextInput
            underlineColorAndroid='transparent'
            defaultValue = {this.props.name}
            value= {this.state.name}
            // onChangeText={(text) => this.setState({name:text})}
            multiline = {true}
            numberOfLines = {2}
            style = {{ 
              backgroundColor:'white', 
              height:30,
              margin:0, 
              padding:0,
              flex:1,
            }}
            onSubmitEditing = {(event) => this._onChangeName( event.nativeEvent.text) } 
          />
    } 
    else {
      itemName = <Text 
              style={{
                fontSize:20, 
                color: (this.props.id == this.props.selected && this.props.parentSelected) ? '#ffffff' :  '#000000'
              }}
            >
            {this.props.name}
            </Text>
    }

    if (this.props.lat !== false) {
      coords =  <View style={styles.listItemCoords} ><Text style={styles.flex05}> {this.props.id} Lat. {this.props.lat}</Text><Text style={styles.flex05}>Lon. {this.props.lon}</Text></View>;
      if (this.props.id == this.props.selected && this.props.parentSelected){
        deleteButton = <Icon.Button 
          borderRadius={50}
          size={30}
          style={styles.listItemEditButton} 
          color="rgba(50,50,55,0.8)"
          backgroundColor="transparent"
          iconStyle = {{borderRadius:50}}
          name="trash-o" 
          onPress = { () => this._onDeleteItem()}
        />
      }
    }
    else {
      // Provide add group/point buttons if item is selected
      if (this.props.id == this.props.selected && this.props.parentSelected){
        
        deleteButton = <Icon.Button 
          borderRadius={50}
          size={30}
          style={styles.listItemEditButton} 
          color="rgba(50,50,55,0.8)"
          backgroundColor="transparent"
          iconStyle = {{borderRadius:50}}
          name="trash-o" 
          onPress = { () => this._onDeleteItem()}
        />

        // Provide 'add group' button only if group has no point yet
        if (!this.props.groups || !this.props.groups.length || (this.props.groups.length && !this.props.groups[0].lat)) {
          addGroupButton = <Icon.Button 
            borderRadius={50}
            size={30}
            style={styles.listItemEditButton} 
            color="rgba(50,50,55,0.8)"
            backgroundColor="transparent"
            iconStyle = {{borderRadius:50}}
            name="plus-circle" 
            onPress = { () => this._onAddGroup()}
          />
        }

        // Provide 'add point' button only if group has no nested group yet
        if (!this.props.groups || !this.props.groups.length || this.props.groups[0].lat) {  
          addPointButton = <Icon.Button 
            borderRadius={50}
            size={30}
            style={styles.listItemEditButton} 
            color="rgba(50,50,55,0.8)"
            backgroundColor="transparent"
            iconStyle = {{borderRadius:50}}
            name = { (this.state.searching) ?  "circle-o-notch":"bullseye"}
            onPress = { () => this._onAddPoint()}
          />
        }
      }
    }

    return (
      <View style= {(this.props.id == this.props.selected && this.props.parentSelected) ? styles.listItemHilight :  styles.listItemNormal}>
        <TouchableHighlight 
          onPress={this._onPress}
          underlayColor = "rgba(255,255,255,0.5)"
          >
        
          <View style={styles.listItemInfoContainer} >

            {itemName}

            { coords }
            {addGroupButton}
            {addPointButton}
            {deleteButton}

          </View>
        </TouchableHighlight>

        { this._renderList() }

      </View>
    )
  }

} // LocationGroup ----------------------------------------------------------------------------------------------

export default class GeolocationManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searching: false,
      name : '',
      lat: 0,
      lon: 0,
      // alt: 0,
      selected: false,
      sort: ['time',1],
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
    });
    AsyncStorage.setItem('selectedPlace', JSON.stringify(id));
     console.log('location _onPressItem');
     console.log(id);
     console.log( locList[id]);

    this.props.getLocCallback( locList[id] );
  };

  _onEditItem = (id) => {
    this.setState({
      editModalOpen:id,
    });
  };

  _closeModal = () => {
    // this.setState({ 
    //   editModalOpen:false,
    //   searchModalOpen:false,
    // });
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
        name:data.name,
        lat:data.lat,
        lon:data.lon,
      }, function() { 
        this._closeModal();
      }); 
    }
    this.props.getLocCallback( data );
  }

  _deleteLocation = () => {
    if (locList.length > 1) {
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
        cursel = false;
        this.setState({ selected:cursel });
      }
      // force refresh list
      this.setState({ selected:-2 }, function() { 
        this.setState({ selected:cursel }, function(){
          this._closeModal();
        });
      }); 
    }
 }

  _addLocation = (data) => {
    var newLoc = {
      id:locList.length,
      name: data.name,
      lat: data.lat,
      lon: data.lon,
      date: Date.now(),
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

    this.props.getLocCallback( newLoc );
 }

  _renderEditModal () {
    if (this.state.editModalOpen===false && !this.state.searchModalOpen) return null;
    return (
      <LocationModal
        location = {this.state.searchModalOpen ? {id:-1, name:'', lat:0, lon:0} : locList[this.state.editModalOpen]}
        locationChanged = {this._updateLocation}
        deleteMe = {this._deleteLocation}
        addMe = {this._addLocation}
        closeMe = {this._closeModal}
        connected = {this.state.connected}
      />
    );
  }

  onSearchPress() {
    this.setState({searchModalOpen:true});
  };

  sortList(key) {
    let asc;    
    if (key==this.state.sort[0]) {
      asc = -1*this.state.sort[1];
    }
    else if (key == 'name') {
      asc = 1;
    }
    else {
      asc = -1;
    }

    locList.sort(function(a, b){
      return  (( a[key] == b[key] ) ? 0 : ( ( a[key] > b[key] ) ? 1*asc : -1*asc ) );
    });
    // reset ids
    var ii = 0; 
    for (var i in locList) {
      locList[i]['id'] = ii;
      ii++;
    }

    this.setState({ sort:[key,asc] });
  }

  getLoc() {
    /*
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
              name: res[0].formattedAddress,
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
    */
  }

  onLocChanged = (value) => {
    this.setState({lat:value.lat, lon:value.lon });
  }

  onLocNameChanged = (value) => {
    this.setState({ name: value });
  }

  componentWillMount() {

    if (this.props.curLoc === false) {
      this.setState({selected:false});
    }

        // get stored locations
    AsyncStorage.getItem('places', (err, places) => {

      if (err) {
        // Alert.alert('ERROR getting locations'+ JSON.stringify(err));
        places = [];
      }
      else {
        places = JSON.parse(places);
      }
    
      //if (!places || !places.length) {
        // Set default data
        var addDate = Date.now(),
        places = [
        {
          "id":0,
          "name":'Coulon',
          color:"#ff0000",
          groups:[
            {
              id:0,
              name:"Chemin principal",
              color:"#ffff00",
              groups:[
                {id: 0, name: "pommier", lat: 44.972837, lon: 4.477677, alt: 22},
                {id: 1, name: "palettes", lat: 44.972746, lon: 4.477534, alt: 1031},
                {id: 2, name: "croisement source", lat: 44.972645, lon: 4.477434, alt: 1031},
                {id: 3, name: "niche", lat: 44.972411, lon: 4.477409, alt: 1021},
                {id: 4, name: "c", lat: 44.972326, lon: 4.477415, alt: 1013},
                {id: 5, name: "c1", lat: 44.97214, lon: 4.477409, alt: 1028},
                {id: 6, name: "c3", lat: 44.972, lon: 4.477368, alt: 1016},
                {id: 7, name: "croisement chemin ane", lat: 44.971781, lon: 4.477306, alt: 1015},
                {id: 8, name: "portail bas", lat: 44.971432, lon: 4.478674, alt: 923},
                {id: 9, name: "9", lat: 44.971733, lon: 4.479411, alt: 969},
                {id: 10, name: "10", lat: 44.971802, lon: 4.479567, alt: 966},
                {id: 11, name: "11", lat: 44.971795, lon: 4.479567, alt: 953},
                {id: 12, name: "12", lat: 44.971786, lon: 4.479622, alt: 961},
                {id: 13, name: "crois. ch maison", lat: 44.97178, lon: 4.479744, alt: 967},
                {id: 14, name: "14", lat: 44.971848, lon: 4.479748, alt: 1015},
                {id: 15, name: "15", lat: 44.971842, lon: 4.479953, alt: 975},
                {id: 16, name: "16", lat: 44.971857, lon: 4.480205, alt: 984},
                {id: 17, name: "17", lat: 44.971882, lon: 4.480387, alt: 980},
                {id: 18, name: "18", lat: 44.971896, lon: 4.480492, alt: 978},
                {id: 19, name: "19", lat: 44.971912, lon: 4.480623, alt: 978},
                {id: 20, name: "20", lat: 44.971932, lon: 4.480749, alt: 978},
                {id: 21, name: "21", lat: 44.971933, lon: 4.480919, alt: 978},
                {id: 22, name: "22", lat: 44.971943, lon: 4.481068, alt: 978},
                {id: 23, name: "23", lat: 44.971922, lon: 4.481259, alt: 978},
                {id: 24, name: "24", lat: 44.971977, lon: 4.481495, alt: 979},
                {id: 25, name: "25", lat: 44.972036, lon: 4.481505, alt: 979},
                {id: 26, name: "26", lat: 44.972082, lon: 4.481476, alt: 980},
                {id: 27, name: "27", lat: 44.972134, lon: 4.481329, alt: 980},
                {id: 28, name: "28", lat: 44.972187, lon: 4.481155, alt: 20},
                {id: 29, name: "29", lat: 44.972236, lon: 4.480942, alt: 20},
                {id: 30, name: "30", lat: 44.972301, lon: 4.480781, alt: 196},
                {id: 31, name: "31", lat: 44.972323, lon: 4.480593, alt: 20},
                {id: 32, name: "32", lat: 44.972331, lon: 4.480413, alt: 20},
                {id: 33, name: "33", lat: 44.972329, lon: 4.480231, alt: 196},
                {id: 34, name: "lisiere foret", lat: 44.972199, lon: 4.47991, alt: 1003},
                {id: 35, name: "35", lat: 44.972049, lon: 4.479955, alt: 1003},
                {id: 36, name: "36", lat: 44.972266, lon: 4.479524, alt: 1005},
                {id: 37, name: "37", lat: 44.972371, lon: 4.479437, alt: 1004},
                {id: 38, name: "38", lat: 44.972404, lon: 4.479297, alt: 877},
                {id: 39, name: "39", lat: 44.972468, lon: 4.479127, alt: 20},
                {id: 40, name: "40", lat: 44.972518, lon: 4.478892, alt: 374},
                {id: 41, name: "41", lat: 44.972545, lon: 4.478745, alt: 20},
                {id: 42, name: "42", lat: 44.972478, lon: 4.478299, alt: 1006},
                {id: 43, name: "marre tetars", lat: 44.972425, lon: 4.478175, alt: 997},
                {id: 44, name: "44", lat: 44.97229, lon: 4.477991, alt: 1005},
                {id: 45, name: "45", lat: 44.972248, lon: 4.477871, alt: 1008},
                {id: 46, name: "46", lat: 44.972138, lon: 4.477784, alt: 504},
                {id: 47, name: "47", lat: 44.972052, lon: 4.477702, alt: 377},
                {id: 48, name: "48", lat: 44.971882, lon: 4.477492, alt: 202},
              ],
            },{
              id:2,
              name:"maison haut",
              color:"#333333",
              groups:[
                {id: 0, name: "terrasse  sud est", lat: 44.97285, lon: 4.477959, alt: 898},
                {id: 1, name: "maison mur sud est", lat: 44.97293, lon: 4.477925, alt: 1023},
                {id: 2, name: "sud ouest", lat: 44.972649, lon: 4.477845, alt: 1082},
                {id: 3, name: "nord est", lat: 44.972955, lon: 4.478074, alt: 1051},
                {id: 4, name: "nord ouest", lat: 44.972525, lon: 4.478065, alt: 998},
              ],
            },{
              id:3,
              name:"maison bas",
            },{
              id:4,
              name:"chemin ane",
              color:"#0000ff",
              groups:[
                {id: 0, name: "haut", lat: 44.971734, lon: 4.477144, alt: 1032},
                {id: 1, name: "sapin branches bass", lat: 44.971398, lon: 4.476757, alt: 1011},
                {id: 2, name: "7", lat: 44.971368, lon: 4.47664, alt: 1003},
                {id: 3, name: "8", lat: 44.97135, lon: 4.476652, alt: 1008},
                {id: 4, name: "4", lat: 44.97135, lon: 4.476652, alt: 888},
                {id: 5, name: "5", lat: 44.971336, lon: 4.476667, alt: 888},
                {id: 6, name: "6", lat: 44.97134, lon: 4.47667, alt: 889},
                {id: 7, name: "7", lat: 44.971346, lon: 4.47667, alt: 891},
                {id: 8, name: "rocher", lat: 44.971349, lon: 4.476667, alt: 892},
                {id: 9, name: "brousailles", lat: 44.97122, lon: 4.476521, alt: 1007},
                {id: 10, name: "croisement bas", lat: 44.971072, lon: 4.476579, alt: 1013},
              ],
            },{
              id:5,
              name:"chemin bas",
              color:"#ff0000",
              groups:[
                {id: 0, name: "crousement ch. ane", lat: 44.971133, lon: 4.476507, alt: 1033},
                {id: 1, name: "1", lat: 44.971018, lon: 4.476723, alt: 991},
                {id: 2, name: "2", lat: 44.970685, lon: 4.476695, alt: 1037},
                {id: 3, name: "p", lat: 44.970761, lon: 4.476149, alt: 990},
                {id: 4, name: "portail", lat: 44.970688, lon: 4.476211, alt: 1002},
                {id: 5, name: "croisee", lat: 44.970764, lon: 4.476163, alt: 997},
                {id: 6, name: "6", lat: 44.970586, lon: 4.476236, alt: 1006},
                {id: 7, name: "7", lat: 44.970662, lon: 4.476324, alt: 1002},
                {id: 8, name: "8", lat: 44.970686, lon: 4.476388, alt: 1000},
                {id: 9, name: "9", lat: 44.970724, lon: 4.476456, alt: 1000},
                {id: 10, name: "10", lat: 44.970916, lon: 4.476898, alt: 987},
                {id: 11, name: "11", lat: 44.970815, lon: 4.476614, alt: 962},
                {id: 12, name: "guet", lat: 44.97072, lon: 4.476789, alt: 1040},
                {id: 13, name: "13", lat: 44.971124, lon: 4.477173, alt: 983},
                {id: 14, name: "14", lat: 44.971122, lon: 4.477291, alt: 988},
                {id: 15, name: "15", lat: 44.971108, lon: 4.477429, alt: 990},
                {id: 16, name: "16", lat: 44.971085, lon: 4.477544, alt: 988},
                {id: 17, name: "17", lat: 44.971098, lon: 4.477708, alt: 987},
                {id: 18, name: "18", lat: 44.971112, lon: 4.477865, alt: 986},
                {id: 19, name: "fin foret", lat: 44.971118, lon: 4.478021, alt: 985},
                {id: 20, name: "20", lat: 44.971123, lon: 4.478027, alt: 990},
                {id: 21, name: "21", lat: 44.971125, lon: 4.478551, alt: 1001},
                {id: 22, name: "22", lat: 44.971202, lon: 4.47851, alt: 995},
                {id: 23, name: "23", lat: 44.971273, lon: 4.478526, alt: 989},
                {id: 24, name: "mini xhemin", lat: 44.971379, lon: 4.478599, alt: 983},
                {id: 25, name: "25", lat: 44.971382, lon: 4.478605, alt: 983},
                {id: 26, name: "26", lat: 44.971434, lon: 4.478703, alt: 983},
                {id: 27, name: "27", lat: 44.971478, lon: 4.478737, alt: 982},
                {id: 28, name: "28", lat: 44.97156, lon: 4.478806, alt: 982},
                {id: 29, name: "29", lat: 44.971624, lon: 4.478824, alt: 981},
                {id: 30, name: "30", lat: 44.971662, lon: 4.47888, alt: 981},
                {id: 31, name: "31", lat: 44.971693, lon: 4.478995, alt: 981},
                {id: 32, name: "ravin", lat: 44.971705, lon: 4.479341, alt: 965},
              ],
            },{
              id:6,
              name:"chemin du triangle",
              color:"#00ff00",
              groups:[
                {id: 0, name: "0", lat: 44.970675, lon: 4.476107, alt: 1000},
                {id: 1, name: "1", lat: 44.970698, lon: 4.476036, alt: 984},
                {id: 2, name: "2", lat: 44.970704, lon: 4.475919, alt: 992},
                {id: 3, name: "3", lat: 44.970693, lon: 4.475767, alt: 995},
                {id: 4, name: "4", lat: 44.970687, lon: 4.475643, alt: 995},
                {id: 5, name: "5", lat: 44.970652, lon: 4.475541, alt: 995},
                {id: 6, name: "6", lat: 44.970595, lon: 4.475453, alt: 996},
                {id: 7, name: "7", lat: 44.97054, lon: 4.475401, alt: 997},
                {id: 8, name: "8", lat: 44.970482, lon: 4.475356, alt: 997},
                {id: 9, name: "9", lat: 44.97043, lon: 4.475296, alt: 998},
                {id: 10, name: "10", lat: 44.97037, lon: 4.475235, alt: 999},
                {id: 11, name: "11", lat: 44.970293, lon: 4.475175, alt: 999},
                {id: 12, name: "12", lat: 44.97021, lon: 4.475116, alt: 1000},
                {id: 13, name: "13", lat: 44.970147, lon: 4.475013, alt: 1001},
                {id: 14, name: "14", lat: 44.970091, lon: 4.474945, alt: 1002},
                {id: 15, name: "15", lat: 44.97004, lon: 4.474912, alt: 1003},
                {id: 16, name: "16", lat: 44.969708, lon: 4.474898, alt: 1025},
                {id: 17, name: "17", lat: 44.969686, lon: 4.47461, alt: 1051},
                {id: 18, name: "18", lat: 44.969649, lon: 4.47456, alt: 1042},
                {id: 19, name: "19", lat: 44.96965, lon: 4.47453, alt: 1035},
                {id: 20, name: "20", lat: 44.969629, lon: 4.4744, alt: 1032},
                {id: 21, name: "21", lat: 44.969626, lon: 4.474321, alt: 1030},
                {id: 22, name: "22", lat: 44.969637, lon: 4.474237, alt: 1030},
                {id: 23, name: "23", lat: 44.969661, lon: 4.474107, alt: 1030},
                {id: 24, name: "24", lat: 44.969692, lon: 4.474021, alt: 1030},
                {id: 25, name: "25", lat: 44.969725, lon: 4.473937, alt: 1031},
                {id: 26, name: "26", lat: 44.969766, lon: 4.473807, alt: 1031},
                {id: 27, name: "27", lat: 44.969794, lon: 4.473738, alt: 1032},
                {id: 28, name: "28", lat: 44.969841, lon: 4.473667, alt: 1033},
                {id: 29, name: "29", lat: 44.969857, lon: 4.473572, alt: 1033},
                {id: 30, name: "30", lat: 44.969883, lon: 4.47349, alt: 1034},
                {id: 31, name: "31", lat: 44.969905, lon: 4.473379, alt: 1035},
                {id: 32, name: "32", lat: 44.96993, lon: 4.473279, alt: 1036},
                {id: 33, name: "33", lat: 44.96997, lon: 4.473191, alt: 1036},
                {id: 34, name: "arbre couché", lat: 44.969999, lon: 4.473112, alt: 1037},
                {id: 35, name: "croisement ch perdu", lat: 44.970048, lon: 4.473033, alt: 1055},
              ]
            },{
              id:7,
              name:"chemin perdu",
              color:"#ff00ff",
              groups:[
                {id: 0, name: "0", lat: 44.970235, lon: 4.472978, alt: 1014},
                {id: 1, name: "1", lat: 44.97004, lon: 4.473221, alt: 1063},
                {id: 2, name: "2", lat: 44.970035, lon: 4.473194, alt: 1054},
                {id: 3, name: "3", lat: 44.970086, lon: 4.473274, alt: 1055},
                {id: 4, name: "4", lat: 44.97011, lon: 4.473326, alt: 1054},
                {id: 5, name: "5", lat: 44.970133, lon: 4.473385, alt: 1053},
                {id: 6, name: "6", lat: 44.970153, lon: 4.473475, alt: 1052},
                {id: 7, name: "7", lat: 44.970165, lon: 4.473565, alt: 1052},
                {id: 8, name: "8", lat: 44.970217, lon: 4.473721, alt: 1052},
                {id: 9, name: "tas pierres", lat: 44.970234, lon: 4.473503, alt: 1063},
                {id: 10, name: "10", lat: 44.970442, lon: 4.473769, alt: 1047},
                {id: 11, name: "11", lat: 44.970333, lon: 4.473955, alt: 1062},
                {id: 12, name: "12", lat: 44.970317, lon: 4.473964, alt: 1058},
                {id: 13, name: "13", lat: 44.970346, lon: 4.474039, alt: 1058},
                {id: 14, name: "... perdu", lat: 44.970377, lon: 4.474046, alt: 529},
                {id: 15, name: "droit en bas", lat: 44.970156, lon: 4.47374, alt: 1053},
                {id: 16, name: "16", lat: 44.970354, lon: 4.474095, alt: 1036},
                {id: 17, name: "17", lat: 44.970231, lon: 4.474107, alt: 1063},
                {id: 18, name: "18", lat: 44.970276, lon: 4.474213, alt: 1059},
                {id: 19, name: "19", lat: 44.970268, lon: 4.474287, alt: 1056},
                {id: 20, name: "20", lat: 44.97026, lon: 4.474343, alt: 526},
                {id: 21, name: "21", lat: 44.9702, lon: 4.474445, alt: 680},
                {id: 22, name: "22", lat: 44.970105, lon: 4.474502, alt: 209},
                {id: 23, name: "23", lat: 44.970057, lon: 4.474524, alt: 478},
                {id: 24, name: "24", lat: 44.970026, lon: 4.474604, alt: 563},
                {id: 25, name: "25", lat: 44.970003, lon: 4.474654, alt: 626},
                {id: 26, name: "26", lat: 44.969989, lon: 4.474746, alt: 688},
                {id: 27, name: "27", lat: 44.96999, lon: 4.474832, alt: 741},
                {id: 28, name: "28", lat: 44.970008, lon: 4.474915, alt: 781},
                {id: 29, name: "29", lat: 44.970014, lon: 4.475, alt: 820},
              ]
            },
          ],

        },{
            "id":1,
            "name":'autre cad',
        }

      ];
        AsyncStorage.setItem('places', JSON.stringify(places));
   //   }
      
      locList = places;

      // Now get last selected location
      AsyncStorage.getItem('selectedPlace', (err, selectedPlace) => {
        if (err) {
          // Alert.alert('ERROR getting selectedPlace'+ JSON.stringify(err));
          selectedPlace = 0;
        }
        else {
          selectedPlace = JSON.parse(selectedPlace);
          if (!selectedPlace || selectedPlace < 0) {
            selectedPlace = 0;
          }
        } 

        if ( this.props.curLoc === false ) {
          // console.log('location');
          // console.log(selectedPlace);
          // console.log(places);

          this.props.getLocCallback( places[selectedPlace] );
        }
        else {

        }
      });
    });
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

  _onAddLoc() {
    var newLoc = {
      id:locList.length,
      name: this.state.name,
      lat: this.state.lat,
      lon: this.state.lon,
      date: Date.now(),
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

    this.props.getLocCallback( newLoc );
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
            Pas de réseau
            </Text>
          </Icon.Button>
        </View>
      );
    }
  }

  _renderSearchResult() {
    if (this.state.selected < 0) {
      return (
          <View style= {(this.state.selected < 0) ? styles.listItemHilight :  styles.listItemNormal}>
            <View style={styles.listItemInfoContainer} >
              <Text style={styles.listItemName}> {this.state.name} </Text>
              <View style={styles.listItemCoordSearch}>
                <Text  style={styles.flex05} > Lat. {this.state.lat} </Text>
                <Text  style={styles.flex05} > Lon. {this.state.lon} </Text>
              </View>
            </View>
            <View style={styles.listItemEditContainer} >
              <Icon.Button 
                borderRadius={50}
                size={50}
                style={styles.listItemEditButton} 
                color="rgba(50,50,55,0.8)"
                backgroundColor = {'transparent'}
                iconStyle = {{ borderRadius:50}}
                name="plus-circle" 
                onPress = { () => this._onAddLoc()}
              />
            </View>

        </View>
      );
    }
    else {
      return null;
    }
  }



  _renderList(){
     if (this.state.editModalOpen!==false || this.state.searchModalOpen) return null;
     
     return(
      <View style={styles.flex1}>

        <LocationGroup
          style={styles.flex1}
          id={-1}
          selected={-1}
          parentSelected={true}
          path = 'root'

          groups={locList}
          onPressItemCallback={this._onPressItem}
         />

      </View>
    );
  }

  render() {
    if (this.props.curLoc===false) return null;
    return (
      <View style={styles.flex1}>
        {this._renderList()}
        {/*this._renderEditModal()*/}
      </View> 
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

