/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, DeviceEventEmitter} from 'react-native';


// Custom requires
import { NetworkInfo } from 'react-native-network-info';
var sip = require ('shift8-ip-func');
//var net = require('react-native-tcp');
import SubnetmaskModule from 'get-subnet-mask';
var async = require("async");
var ipaddr = require('ipaddr.js');

// Declare Variables
var local_ip = null;
var local_broadcast = null;
var local_netmask = null;
var subconv = null;
var firstHost = null;
var lastHost = null;
var firstHostHex = null;
var lastHostHex = null;
var ipRange = null;
var ipRange = null;
//var portRange = [ 20, 21, 22, 25, 80, 110, 139, 143, 443, 3389 ]
var portRange = [ 3389, 80, 443 ]

scanTCPHost('10.0.1.102', 80);


// Must load all variables in sequence asynchronously
async.series([
  /****************************
  * Assign all local IP data  *
  *****************************/
  function(callback) {
    NetworkInfo.getIPAddress(ip => { 
      local_ip = ip; 
      NetworkInfo.getBroadcast(address => {
        local_broadcast = address; 
        SubnetmaskModule.getSubnet((sb) => { 
          local_netmask = sb; 
          callback(); 
        });
      });
    });
  },
  /*************************************************
  * Assign All IP data once everything is obtained *
  *************************************************/
  function(callback) {
      subconv = ipaddr.IPv4.parse(local_netmask).prefixLengthFromSubnetMask();
      firstHost = ipaddr.IPv4.networkAddressFromCIDR(local_ip + "/" + subconv);
      lastHost = ipaddr.IPv4.broadcastAddressFromCIDR(local_ip + "/" + subconv);
      firstHostHex = sip.convertIPtoHex(firstHost);
      lastHostHex = sip.convertIPtoHex(lastHost);
      ipRange = sip.getIPRange(firstHostHex,lastHostHex);
      ipRange = ipRange.slice(1); // Remove the first ip in the array
      callback();
  },
  /*************************
  * Start array loop scans *
  *************************/
  function(callback) {
    // Loop through all IPs in a scan
    /*async.eachSeries(ipRange, function(singleIP, callback) {
      // Loop within the loop to cycle through array of common ports
      async.eachSeries(portRange, function(singlePort, callbackPort) {
        var q = async.queue(async.asyncify(async function(singlePort) {
          return await scanTCPHost(singleIP, singlePort);
        }));
        console.log('scanning ' + singleIP); 
        q.push(singlePort);  
        callbackPort();
      }, function(err) {
        if (err) {
          //console.log('error happened with port');
        } else {
          //console.log('success port!');
        }
      }
      );
        callback();
      }, function(err) {
        if (err) {
          console.log('error happened');
        } else {
          console.log('success ip!');
        }
      }
    );*/
  }
  ]);

/*console.log('hey');
var iphex = sip.convertIPtoHex('192.168.1.1');
console.log('ip address : ' + iphex);

console.log('net : ' + JSON.stringify(net));

var client = net.createConnection(80, '10.0.1.102');
console.log('Socket created.');
client.on('data', function(data) {
  // Log the response from the HTTP server.
  console.log('RESPONSE: ' + data);
}).on('connect', function() {
  // Manually write an HTTP request.
  client.write("GET / HTTP/1.0\r\n\r\n");
}).on('end', function() {
  console.log('DONE');
});*/

function scanTCPHost(host,port) {
  config={
    address: "10.0.1.102", //ip address of server
    port: 80, //port of socket server
    reconnect:false, //OPTIONAL (default false): auto-reconnect on lost server
    reconnectDelay:500, //OPTIONAL (default 500ms): how often to try to auto-reconnect
    maxReconnectAttempts:10, //OPTIONAL (default infinity): how many time to attemp to auto-reconnect
  }
  Sockets.startClient(config);
  //on connected
   DeviceEventEmitter.addListener('socketClient_connected', () => {
    alert('socketClient_connected');
  });
  //on error
  DeviceEventEmitter.addListener('socketClient_error', (data) => {
    console.log('socketClient_error',data.error);
  });
  //on new message
  DeviceEventEmitter.addListener('socketClient_data', (payload) => {
    console.log('socketClient_data message:', payload.data);
  });
  //on client closed
  DeviceEventEmitter.addListener('socketClient_closed', (data) => {
    console.log('socketClient_closed',data.error);
  });

}


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
