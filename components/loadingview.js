/**
 * LoadingView
 */
'use strict';

import React, { Component } from 'react';

import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Image,
  View,
  Easing
} from 'react-native';

var TIMES = 400;

export default class MotionManager extends Component {

  constructor(props) {
    super(props);
    this.state = {
      angle: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this._animate();
  }

  _animate() {
    this.state.angle.setValue(0);
    this._anim = Animated.timing(this.state.angle, {
      toValue: 360*TIMES,
      duration: 800*TIMES,
      easing: Easing.linear
    }).start(this._animate);
  }




  render() {
    return (
      <View style={styles.container}>
          <Animated.Image
            source={require('./img/pointer.png')}
            style={[
              styles.rotateCard,
              {transform: [
                {rotate: this.state.angle.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })},
              ]}]}>
          </Animated.Image>
      </View>
    );
  }
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rotateCard: {
    width:35,
    height:35,
    justifyContent:'center',
    backgroundColor:'red'
  }
});

