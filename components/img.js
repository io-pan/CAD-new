import React, { Component } from 'react';
import {
  StatusBar,
  View,
  Animated,
  Text, 
  Alert,  
  Button,
  Dimensions,
  StyleSheet,
  ScrollView,
  Image,
  TouchableHighlight,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import ImageZoom from 'react-native-image-pan-zoom';

const deviceHeight =  Dimensions.get('window').height,
      bgLightColor = 'rgba(0,0,0,0.6)',// bgLightColor = 'rgba(255,255,255,0.6)',
      bgDarkColor = 'rgba(0,0,0,0.6)',
      lightColor = 'rgba(255,255,255,1)',
      darkColor = 'rgba(100,100,100,1)';


export default class images extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuPosition:new Animated.Value(0),
      coords:{},
      layersPosition:[
        deviceHeight,
        deviceHeight,
        deviceHeight,
        deviceHeight,
        deviceHeight,
        deviceHeight,
        deviceHeight,
        deviceHeight,
        deviceHeight,
        deviceHeight,
        deviceHeight,
      ],
      layersOpacity:[1,1,1,1,1,1,1,1,1,1,1],
    }
    this.menuCollapsed = false;
  }

  toggleMenu() {
    var toValue = this.menuCollapsed ? 0 : Dimensions.get('window').width;
    this.menuCollapsed = !this.menuCollapsed;

    Animated.timing(this.state.menuPosition, {
      toValue: toValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }

  toggleLayer(layer){
    const currentPositions = this.state.layersPosition;

    currentPositions[layer] = currentPositions[layer]==0 ? deviceHeight : 0;
    this.setState({layersPosition:currentPositions});
  }

  opacityLayer(layer, delta){
    const currentOpacity = this.state.layersOpacity;

    currentOpacity[layer] = (delta=='plus') 
      ? currentOpacity[layer] + 0.1 
      : currentOpacity[layer] - 0.1;

    this.setState({layersOpacity:currentOpacity});
  }

  componentDidMount() {
    navigator.geolocation.watchPosition(
    (position) => {
      alert(JSON.stringify(position));

      this.setState({
        lat: parseFloat(position.coords.latitude.toFixed(6)),
        lon: parseFloat(position.coords.longitude.toFixed(6)),
        alt: Math.round(position.coords.altitude, 10),
      });
    },
    (error) => {
      alert(JSON.stringify(error))
    }
    ,{distanceFilter: 1});
  }

  onLocChanged = (value) => {
    this.setState({lat:value.lat, lon:value.lon });
  }

  render() {
    return (
      <View style={{backgroundColor:'transparent'}}>

        <ImageZoom 
          cropWidth={Dimensions.get('window').width}
          cropHeight={Dimensions.get('window').height}

          imageWidth={Dimensions.get('window').width}
          imageHeight={Dimensions.get('window').width / 1.24}
          >

          <Image
            ref="1"
            style={[styles.img, {opacity:this.state.layersOpacity[1], top:this.state.layersPosition[1]}]}
            source={require('./img/a_1965.jpg')}
          />
          <Image
            ref="2"
            style={[styles.img, {opacity:this.state.layersOpacity[2], top:this.state.layersPosition[2]}]}
            source={require('./img/a_2005.jpg')}
          />
          <Image
            ref="3"
            style={[styles.img, {opacity:this.state.layersOpacity[3], top:this.state.layersPosition[3]}]}
            source={require('./img/a_2010.jpg')}
          />
          <Image
          ref="4"
            style={[styles.img, {opacity:this.state.layersOpacity[4], top:this.state.layersPosition[4]}]}
            source={require('./img/a_2015.jpg')}
          />
          <Image
          ref="5"
            style={[styles.img, {opacity:this.state.layersOpacity[5], top:this.state.layersPosition[5]}]}
            source={require('./img/a_2017.jpg')}
          />

          <Image
          ref="6"
            style={[styles.img, {opacity:this.state.layersOpacity[6], top:this.state.layersPosition[6]}]}
            source={require('./img/IGN.jpg')}
          />
          <Image
          ref="7"
            style={[styles.img, {opacity:this.state.layersOpacity[7], top:this.state.layersPosition[7]}]}
            source={require('./img/IGN_scan.jpg')}
          />

          <Image
          ref="8"
            style={[styles.img, {opacity:this.state.layersOpacity[8], top:this.state.layersPosition[8]}]}
            source={require('./img/limites_commune.png')}
          />

          <Image
          ref="9"
            style={[styles.img, {top:this.state.layersPosition[9]}]}
            source={require('./img/chemins.png')}
          />

          <Image
          ref="10"
            style={[styles.img, {top:this.state.layersPosition[10]}]}
            source={require('./img/cadastre.png')}
          />

        </ImageZoom>

        <Animated.View 
          style={[
            styles.collapsiblePanel, 
            {transform: [{translateX: this.state.menuPosition}]}
          ]}
          > 

            <View 
              style={styles.layer}
              >
                <Icon.Button
                  name="minus-circle"
                  backgroundColor='transparent'
                  onPress={() => this.opacityLayer(8,'')}
                />

                <TouchableHighlight 
                  style={[styles.layer, {backgroundColor:this.state.layersPosition[8] ? bgLightColor:bgDarkColor}]}
                  onPress = {()=> this.toggleLayer(8)}
                  >
                  <Text style={[styles.layerText, {color:this.state.layersPosition[8] ? darkColor:lightColor}]}>
                  Limites commune...
                  </Text>
                </TouchableHighlight>

                <Icon.Button
                  name="plus-circle"
                  backgroundColor='transparent'
                  onPress={() => this.opacityLayer(8,'plus')}
                />
            </View>


            <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[9] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(9)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[9] ? darkColor:lightColor}]}>Chemins</Text>
            </TouchableHighlight>
            <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[10] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(10)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[10] ? darkColor:lightColor}]}>Cadastre</Text>
            </TouchableHighlight>

            <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[5] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(5)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[5] ? darkColor:lightColor}]}>2017</Text>
            </TouchableHighlight>
            <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[4] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(4)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[4] ? darkColor:lightColor}]}>2015</Text>
            </TouchableHighlight>
            <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[3] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(3)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[3] ? darkColor:lightColor}]}>2010</Text>
            </TouchableHighlight>
             <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[2] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(2)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[2] ? darkColor:lightColor}]}>2005</Text>
            </TouchableHighlight>
            <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[1] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(1)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[1] ? darkColor:lightColor}]}>1965</Text>
            </TouchableHighlight>

            <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[6] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(6)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[6] ? darkColor:lightColor}]}>IGN</Text>
            </TouchableHighlight>
            <TouchableHighlight 
              style={[styles.layer, {backgroundColor:this.state.layersPosition[7] ? bgLightColor:bgDarkColor}]}
              onPress = {()=> this.toggleLayer(7)}
              >
              <Text style={[styles.layerText, {color:this.state.layersPosition[7] ? darkColor:lightColor}]}>IGN scan</Text>
            </TouchableHighlight>

        </Animated.View>

        <View style={styles.button}>
          <Icon.Button
            name="bars"
            onPress={() => this.toggleMenu()}
          />
        </View>

      </View>
    )
  }
}


const styles = StyleSheet.create({ 

  img: {
    width:Dimensions.get('window').width,
    height:Dimensions.get('window').width / 1.24,
    position:'absolute',
  },
  collapsiblePanel:{
    position:'absolute',
    // top:0,
    left:Dimensions.get('window').width/2,
    right:0,
    bottom:40,
    transform: [{translateX:Dimensions.get('window').width}],
  },
  button:{
    position:'absolute',
    bottom:10,
    right:0,
  },
  layer:{
    backgroundColor:'rgba(200,200,200,0.6)',
    height:40,
    marginBottom:1,
    justifyContent: 'center',
    alignItems : 'center',
    flexDirection:'row',
  },
  layerText:{
    color:'rgba(0,0,0,1)',
    fontSize:14,
    fontWeight:'bold',
  },
});

