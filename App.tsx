import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';


import BackgroundGeolocation, {
  Location,
  Subscription
} from "react-native-background-geolocation";

import AsyncStorage from '@react-native-async-storage/async-storage';

BackgroundGeolocation.ready().then((state) => {
  // YES -- .ready() has now resolved.
  BackgroundGeolocation.getCurrentPosition();
  BackgroundGeolocation.start();  
});

const App = () => {
  const [enabled, setEnabled] = React.useState(false);
  const [location, setLocation] = React.useState('');
  const [arrayLocations, setArrayLocations] = React.useState([]);
  const [tracking, setTracking] = React.useState(true);

  const mapViewRef = useRef<MapView>(null);



  const storeListArray = async (value) => {
    try {
      console.log('storeListArray', value);
      

      const unparsedjsonListArray = await AsyncStorage.getItem('@storage_ListArray');
      const jsonListArray = JSON.parse(unparsedjsonListArray);
      let jsonValue;

      console.log('jsonListArray', jsonListArray);
      

      if(jsonListArray !== null) {
        jsonValue=[ ...jsonListArray, value]
      }
      else{
        jsonValue = [value];
      }
      console.log("jsonValue",jsonValue);
      

      await AsyncStorage.setItem('@storage_ListArray', JSON.stringify(jsonValue) )
    } catch (e) {
      // saving error
      console.log("error",e);
      
    }
  }

  const storeMainArray = async () => {
    try {
      console.log('storeMainArray');
      
      const currentUnparsedjsonListArray = await AsyncStorage.getItem('@storage_ListArray');

      const currentJsonListArray = JSON.parse(currentUnparsedjsonListArray);

      const unparsedjsonListArray = await AsyncStorage.getItem('@storage_MainArray');
      const jsonListArray = JSON.parse(unparsedjsonListArray);
      let jsonValue;

      console.log('jsonListArray', jsonListArray);
      

      if(jsonListArray !== null) {
        jsonValue=[ ...jsonListArray, currentJsonListArray]
      }
      else{
        jsonValue = [currentJsonListArray];
      }
      console.log("jsonValue",jsonValue);
      

      await AsyncStorage.setItem('@storage_MainArray', JSON.stringify(jsonValue) )
    } catch (e) {
      // saving error
      console.log("error",e);
      
    }
  }

  const getListArray = async () => {
    try {      
      const jsonListArray = await AsyncStorage.getItem('@storage_ListArray');
      if(jsonListArray !== null) {
        // setArrayLocations(JSON.parse(jsonListArray))
        console.log("getListArray jsonListArray",JSON.parse(jsonListArray));
        
        setArrayLocations(JSON.parse(jsonListArray))
      }
    } catch (e) {
      // saving error
    }
  }

  // useEffect(() => {
  //   getListArray()
  // }, [location]);



  useEffect(() => {
    console.log("tracking",tracking);

    /// 1.  Subscribe to events.
    const onLocation:Subscription = BackgroundGeolocation.onLocation((location) => {
      console.log('[onLocation]', location);
      setLocation(location);

      console.log("tracking",tracking);

      if (tracking == true) {
        console.log("girdi tracking", tracking);

        storeListArray({ latitude: location.coords.latitude, longitude: location.coords.longitude });

        getListArray();
      }

    })

    const onMotionChange:Subscription = BackgroundGeolocation.onMotionChange((event) => {
      console.log('[onMotionChange]', event);
      // setLocation(event.location);
      // storeListArray({latitude: event.location.coords.latitude, longitude: event.location.coords.longitude});
    });

    const onActivityChange:Subscription = BackgroundGeolocation.onActivityChange((event) => {
      console.log('[onMotionChange]', event);
    })

    const onProviderChange:Subscription = BackgroundGeolocation.onProviderChange((event) => {
      console.log('[onProviderChange]', event);
    })

    /// 2. ready the plugin.
    BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      // Activity Recognition
      stopTimeout: 5,
      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
      // HTTP / SQLite config

      // url: 'http://yourserver.com/locations',
      // batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      // autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
      // headers: {              // <-- Optional HTTP headers
      //   "X-FOO": "bar"
      // },
      // params: {               // <-- Optional HTTP params
      //   "auth_token": "maybe_your_server_authenticates_via_token_YES?"
      // }
    }).then((state) => {
      setEnabled(state.enabled)
      console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
    });

    return () => {
      // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
      // during development live-reload.  Without this, event-listeners will accumulate with
      // each refresh during live-reload.
      onLocation.remove();
      onMotionChange.remove();
      onActivityChange.remove();
      onProviderChange.remove();
    }
  }, []);

  // useEffect(() => {
  //   console.log("arrayLocations useeff",arrayLocations);

  //   if(location !== '') {
  //     if(arrayLocations == []) {
  //       setArrayLocations([ { latitude: location.coords.latitude, longitude: location.coords.longitude}]);
  
  //     }
  //     else {
  //     setArrayLocations([...arrayLocations, { latitude: location.coords.latitude, longitude: location.coords.longitude}]);
  //     }
      
  //   }
  // },[location]);

  /// 3. start / stop BackgroundGeolocation
  React.useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start();
      console.log("stared");
      
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [enabled]);

  const deleteAll = async () => {
    console.log("deleteAll");
    
    await AsyncStorage.setItem('@storage_ListArray', JSON.stringify(""))
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <Pressable style={{backgroundColor:'blue'}} onPress={()=>{ 
        console.log("location button");

        console.log("location button",location);
        }}>
        <Text>location</Text>
      </Pressable>

      {location!='' ? (
        <MapView
          ref={mapViewRef}
          style={{ flex: 1 }}
          showsUserLocation={true}
          onUserLocationChange={(event) => {
            mapViewRef.current?.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >

          {/* {getListArray().then((value) => {
            console.log("getListArray value", value);
            
            console.log(typeof value);
          
          (value!=undefined && value!=null)?(
            <Polyline coordinates={[{latitude: 37.4288115, longitude: -122.1018106}, {latitude: 37.4288071, longitude: -122.1018066}]} strokeWidth={5} />
            // <Polyline coordinates={value} strokeWidth={5} />

          ):null})} */}
                      {/* <Polyline coordinates={[{"latitude":37.387335, "longitude": -122.057168},{latitude: 37.4288115, longitude: -122.1018106}, {latitude: 37.4288071, longitude: -122.1018066}]} strokeWidth={5} /> */}
                      {/* jsonListArray */}
          {(arrayLocations != undefined && arrayLocations != null && arrayLocations != []) ? (
            <Polyline coordinates={arrayLocations} strokeWidth={5} />) : null}


          {/* {(getListArray() != undefined&& getListArray() != null && getListArray() != '' ) ? (
            <Polyline coordinates={store.getState().coord} strokeWidth={5} />
            // <Polyline coordinates={[{"latitude":37.387335, "longitude": -122.057168},{latitude: 37.4288115, longitude: -122.1018106}, {latitude: 37.4288071, longitude: -122.1018066}]} strokeWidth={5} />

          ) : null} */}

          


        </MapView>
      ):null}

      <Pressable 
        style={{ 
          position: 'absolute',
          top: '90%', 
          alignSelf:'center',
        height: 50, width: 100,
        backgroundColor: 'lightgray'}}
        onPress={()=>{
          if (tracking == false) {
            console.log("button tracking false");

            setTracking(true);
            return;
          }
          else{
            console.log("button tracking true");
            setTracking(false);

            console.log("deleteAll");
            storeMainArray();
            deleteAll();
            return;
          }
          
          
        }}
        >
          <Text style={{alignSelf:'center'}}> {tracking==false? "Track":"Stop Track"}</Text>
        </Pressable>
        

    </SafeAreaView>
  );
};

export default App;
