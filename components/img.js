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
      layers:[
        { name:'Commune',   imgsrc:require('./img/limites_commune.png')},
        { name:'Chemins',   imgsrc:require('./img/chemins.png')},
        { name:'Cadastre',  imgsrc:require('./img/cadastre.png')},
        { name:'2017',      imgsrc:require('./img/a_2017.jpg')},
        { name:'2015',      imgsrc:require('./img/a_2015.jpg')},
        { name:'2010',      imgsrc:require('./img/a_2010.jpg')},
        { name:'2005',      imgsrc:require('./img/a_2005.jpg')},
        { name:'1965',      imgsrc:require('./img/a_1965.jpg')},
        { name:'IGN',       imgsrc:require('./img/IGN.jpg')},
        { name:'IGN scan',  imgsrc:require('./img/IGN_scan.jpg')},
      ],
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

            { this.state.layers.map((value, index) => {
              return(
                <Image
                  key={index}
                  ref={index}
                  style={[styles.img, {opacity:this.state.layersOpacity[index], top:this.state.layersPosition[index]}]}
                  source={value.imgsrc}
                />
              );
            })}


        </ImageZoom>

        <Animated.View 
          style={[
            styles.collapsiblePanel, 
            {transform: [{translateX: this.state.menuPosition}]}
          ]}
          > 

            { this.state.layers.map((value, index) => {
              return(

                <View 
                  key={index}
                  style={styles.layer}
                  >
                    <Icon.Button
                      name="minus-circle"
                      backgroundColor='transparent'
                      onPress={() => this.opacityLayer(index,'')}
                    />

                    <TouchableHighlight 
                      style={[ {justifyContent:'center', alignItems:'center', flex:1, backgroundColor:this.state.layersPosition[index] ? bgLightColor:bgDarkColor}]}
                      onPress = {()=> this.toggleLayer(index)}
                      >
                      <Text style={[styles.layerText, {color:this.state.layersPosition[index] ? darkColor:lightColor}]}>
                      {value.name}
                      </Text>
                    </TouchableHighlight>

                    <Icon.Button
                      name="plus-circle"
                      backgroundColor='transparent'
                      onPress={() => this.opacityLayer(index,'plus')}
                    />
                </View>
              );
            })}



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

