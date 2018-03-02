import React, { Component, PropTypes } from 'react';
import { View, Text, Alert,  StyleSheet, Button, TouchableHighlight, NativeModules, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

/*
	const logo = (
	  <Icon.Button name="camera" backgroundColor="#3b5998" onPress={this.loginWithFacebook}>
	    Login with Facebook
	  </Icon.Button>
	);
*/
const onButtonPressX = () => {
  Alert.alert('Button has been pressed!');
};

export default class MyScene extends Component {
  render() {
    return (
      <View>


  		  <Icon.Button name="camera" backgroundColor="#3b5998"
  		  	onPress={onButtonPressX}>
  		    <Text style={{fontFamily: 'Arial', fontSize: 15}}>Login with Facebook</Text>
  		  </Icon.Button>

      </View>
    )
  }
}

MyScene.propTypes = {
 /* title: 		PropTypes.string.isRequired,
  onForward: 	PropTypes.func.isRequired,
  onBack: 		PropTypes.func.isRequired,*/
};