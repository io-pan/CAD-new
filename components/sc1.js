import React, { Component } from 'react';
import { 
  View, 
  Text, 
  Alert,  
  Button, 
  //PixelRatio,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNExitApp from 'react-native-exit-app';

const onButtonPress = () => {
  console.log('Button has been pressed!'); 
  Alert.alert('Button has been pressed!');
};

const exitAPP = () => {
  RNExitApp.exitApp();
};

var highlightColor = "#3b5998";
var normalColor = "#888888";

export default class MyScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      acce:false,
      cam:false,
      compas:false,
      loc:false,
    }
  }



  onToggleSensors () {
    this.props.sensorsToggleCallback( !this.props.sensors );
  };

  onToggleView () {
    this.props.viewToggleCallback( (this.props.view=='orbit') ? 'panorama':'orbit' );
  };
  onToggleMap () {
    this.props.toggleMapCallback( !this.props.viewMap );
  }
  onToggleGMap () {
    this.props.toggleGMapCallback( !this.props.viewGMap );
  }
  onToggleLoc () {
    this.props.locToggleCallback( !this.props.loc );
  }

  render() {
    return (
      <ScrollView style={{height:50, paddingTop:5}} horizontal={true} >

        <Icon.Button
          name="bars" backgroundColor="#3b5998"></Icon.Button> 

        {/*<Text>{this.props.camAngles}</Text> */}
        
        <Icon.Button  
          name="map-marker"
          style={{width:50}}
          backgroundColor={ (this.props.loc ) ? highlightColor:normalColor} 
          onPress ={ () => this.onToggleLoc() }
        />    

        <Text> </Text>

        <Icon.Button
          name="eye"
          style={{width:50}}
          backgroundColor={ (this.props.view=='orbit') ? highlightColor:normalColor} 
          onPress ={ () => this.onToggleView() }
        />

        <Text> </Text>

        <Icon.Button
          name="camera"
          style={{width:50}}
          backgroundColor={ (this.props.viewGMap) ? highlightColor:normalColor} 
          onPress ={ () => this.onToggleGMap() }
        />

        <Text> </Text>

        <Icon.Button
          name="tree"
          style={{width:50}}
          backgroundColor={ (this.props.viewMap ) ? highlightColor:normalColor} 
          onPress ={ () => this.onToggleMap() }
        />

        <Text> </Text>

        <Icon.Button
          name="compass"
          style={{width:50}}
          backgroundColor={ (this.props.sensors) ? highlightColor:normalColor} 
          onPress ={ () => this.onToggleSensors() }
        />

        <Text> </Text>

        <Icon.Button
          name="mobile"
          style={{width:50}}
          backgroundColor={ (this.props.portrait) ? highlightColor:normalColor} 
          onPress ={ () => this.onTogglePortrait() }
        /> 

        <Text> </Text>

        <Icon.Button
          name="sign-out"
          backgroundColor="#3b5998"
          style={{width:50}}
          onPress={ exitAPP } 
        >
        </Icon.Button> 

      </ScrollView>
    )
  }
}

/*
        <Text> {PixelRatio.get()}</Text>
*/