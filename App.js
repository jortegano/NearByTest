/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  AppState,
} from "react-native";
import { NearbyAPI } from "react-native-nearby-api";
import Beacons from 'react-native-beacons-manager';

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

const nearbyAPI = new NearbyAPI(true);

const API_KEY = "AIzaSyCbr07ltdESJFUFWNF9SejR1SkdfoJhl84";

export default class App extends Component {

  /*react-native-beacons-manager*/
  // will be set as a reference to "regionDidEnter" event:
  regionDidEnterEvent = null;
  // will be set as a reference to "regionDidExit" event:
  regionDidExitEvent = null;
  uuid = '00000000-0000-0000-0001-000000000022';//'7b44b47b-52a1-5381-90c2-f09b6838c5d4',
  identifier = 'CRF_REGION';
  /**/

  constructor() {
    super();
    this.state = {
      isConnected: false,
      nearbyMessage: null,
      connectText: "CONNECT",
      isPublishing: false,
      isSubscribing: false,
      messages: '',
    };
  }

  componentDidMount() {
    console.log("Mounting ", NearbyAPI);
    nearbyAPI.onConnected(message => {
      console.log(message);
      nearbyAPI.isConnected((connected, error) => {
        this.setState({
          nearbyMessage: `Connected - ${message}`,
          isConnected: connected
        });
      });
    });
    nearbyAPI.onDisconnected(message => {
      console.log(message);
      this.setState({
        isConnected: false,
        nearbyMessage: `Disconnected - ${message}`
      });
    });
    nearbyAPI.onFound(message => {
      console.log("Message Found!");
      console.log(message);
      this.setState({ messages: `${this.state.messages}\n-> ${new Date()} - Message Found - ${message}` });
    });
    nearbyAPI.onLost(message => {
      console.log("Message Lost!");
      console.log(message);
      this.setState({ messages: `${this.state.messages}\n-> ${new Date()} - Message Lost - ${message}` });
    });
    nearbyAPI.onSubscribeSuccess(() => {
      nearbyAPI.isSubscribing((status, error) => {
        this.setState({
          nearbyMessage: `Subscribe Success`,
          isSubscribing: status
        });
      });
    });
    nearbyAPI.onSubscribeFailed(() => {
      nearbyAPI.isSubscribing((status, error) => {
        this.setState({
          nearbyMessage: `Subscribe Failed`,
          isSubscribing: status
        });
      });
    });

    this.scanWithBeaconManager();
  }

  _connectPress = () => {
    if (this.state.isConnected) {
      nearbyAPI.disconnect();
      nearbyAPI.isConnected((connected, error) => {
        this.setState({
          nearbyMessage: `Disconnected`,
          isConnected: connected
        });
      });
    } else {
      nearbyAPI.connect(API_KEY);
    }
  };

  _subscribePress = () => {
    if (!this.state.isSubscribing) {
      nearbyAPI.subscribe();
    } else {
      nearbyAPI.unsubscribe();
      nearbyAPI.isSubscribing((status, error) => {
        this.setState({
          nearbyMessage: `unsubscribed`,
          isSubscribing: status
        });
      });
    }
  };

  scanWithBeaconManager = () => {
    if(Platform.OS === 'ios'){
      console.log('###### ScanWithBeaconManager');
      Beacons.requestAlwaysAuthorization();
      Beacons.allowsBackgroundLocationUpdates(true);
      Beacons.shouldDropEmptyRanges(true);
      const region = { identifier: this.identifier, uuid: this.uuid };
      console.log('region data ->', region);

      Beacons
      .startMonitoringForRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
      .then(() => {
        console.log('Beacons monitoring started succesfully')
        // start monitoring:
        this.regionDidEnterEvent = Beacons.BeaconsEventEmitter.addListener(
          'regionDidEnter',
          (data) => {
            console.log('monitoring - regionDidEnter data: ', data);
          }
        );
 
        this.regionDidExitEvent = Beacons.BeaconsEventEmitter.addListener(
          'regionDidExit',
          ({ identifier, uuid, minor, major }) => {
            console.log('monitoring - regionDidExit data: ', { identifier, uuid, minor, major });
          }
        );
      }).catch(error => console.log(`Beacons monitoring not started, error: ${error}`));

      Beacons.startUpdatingLocation();
      
    }
  }

  stopScanningWithBeaconManager = () => {
    if(Platform.OS === 'ios'){
      Beacons
      .stopMonitoringForRegion(region)
      .then(() => console.log('Beacons monitoring stopped succesfully'))
      .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));
      // stop updating locationManager:
      Beacons.stopUpdatingLocation();
      // remove auth state event we registered at componentDidMount:
      this.authStateDidRangeEvent.remove();
      // remove monitiring events we registered at componentDidMount::
      this.regionDidEnterEvent.remove();
      this.regionDidExitEvent.remove();
    }
  }

  componentWillUnMount() {
    // stop monitoring beacons:
    this.stopScanningWithBeaconManager();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to NearByTest!!!!
        </Text>
        <Text style={styles.instructions}>
          Is Connected: {`${this.state.isConnected}`}
        </Text>
        <Text style={styles.instructions}>
          Is Subscribing: {`${this.state.isSubscribing}`}
        </Text>
        <Text style={styles.instructions}>{this.state.nearbyMessage}</Text>
        <TouchableOpacity onPress={this._connectPress}>
          <Text style={styles.connectButton}>
            {this.state.isConnected ? "DISCONNECT" : "CONNECT"}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 10 }} />
        <TouchableOpacity onPress={this._subscribePress}>
          <Text style={styles.connectButton}>
            {this.state.isSubscribing ? "UNSUBSCRIBE" : "SUBSCRIBE"}
          </Text>
        </TouchableOpacity>
        <ScrollView>
          <Text>{this.state.messages}</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  connectButton: {
    fontSize: 30,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});