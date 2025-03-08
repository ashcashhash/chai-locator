import axios from "axios";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const App = () => {
  const [location, setLocation] = useState(null);
  const [chaiSpots, setChaiSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      console.log(loc);
      setLocation(loc.coords);
      fetchChaiSpots(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchChaiSpots = async (lat, lng) => {
    console.log("lat", lat, "lng", lng);
    try {
      //Run ipconfig and replace with local ip address
      const response = await axios.get(
        `http://192.168.1.15:5000/nearby-chai-spots?lat=${lat}&lng=${lng}`
      );
      setChaiSpots(response.data);
      fadeIn();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  if (!location) {
    return (
      <ActivityIndicator size="large" color="#A52A2A" style={styles.loader} />
    );
  }

  return (
    <View style={styles.container}>
      {loading && <TouchableOpacity></TouchableOpacity>}
      <View style={styles.header}>
        <Image
          source={require("./assets/logo.png")}
          style={{ width: 75, height: 75 }}
        />
        <Text style={styles.headerText}>Best Chai Near You</Text>
        <View style={styles.avtar}>
          <Text style={styles.avtarText}>A</Text>
        </View>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {chaiSpots.map((spot, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: spot.geometry.location.lat,
              longitude: spot.geometry.location.lng,
            }}
            title={spot.name}
            onPress={() => setSelectedSpot(spot)}
          />
        ))}
      </MapView>

      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={chaiSpots}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedSpot(item)}
              style={styles.card}
            >
              <Image
                source={
                  item.photo
                    ? {
                        uri: item.photo,
                      }
                    : require("./assets/logo-bg.jpeg")
                }
                style={styles.image}
              />
              <View>
                <Text style={styles.spotName}>{item.name}</Text>
                <View style={styles.chaiRating}>
                  <Text style={styles.rating}>
                    {item.rating ? "Waah " + parseInt(item.rating) : "N/A"}
                  </Text>
                  {Array.from({ length: parseInt(item.rating) })?.map(
                    (_, index) => (
                      <Image
                        source={require("./assets/tea.png")}
                        style={{ width: 25, height: 25 }}
                        key={index}
                      />
                    )
                  )}
                </View>
                <Text
                  style={[
                    styles.parking,
                    item.parking ? styles.park : styles.no_park,
                  ]}
                >
                  {item.parking ? "Parking Available" : "No Parking"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => fetchChaiSpots(location.latitude, location.longitude)}
      >
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>

      <Modal visible={!!selectedSpot} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.spotName}>{selectedSpot?.name}</Text>
            <Text>
              ⭐{" "}
              {selectedSpot?.rating
                ? parseInt(selectedSpot?.rating) + " Waaah!"
                : "N/A"}
            </Text>
            <Text>
              🚗 {selectedSpot?.parking ? "Parking Available" : "No Parking"}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedSpot(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#8e8a8a" },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingLeft: 0,
    paddingRight: 10,
    backgroundColor: "#d63e3e",
    padding: 0,
    alignItems: "center",
  },
  headerText: {
    paddingTop: 10,
    color: "white",
    fontFamily: "Cursive",
    fontSize: 20,
    marginLeft: -20,
    // fontWeight: "bold",
  },
  chaiRating: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: -10,
  },
  avtar: {
    height: 40,
    width: 40,
    backgroundColor: "#ffebce",
    borderColor: "#8e8a8a",
    borderRadius: 50,
    borderWidth: 2,
    marginTop: 2,
  },
  avtarText: {
    fontSize: 20,
    color: "#8e8a8a",
    textAlign: "center",
    paddingTop: 5,
  },
  map: {
    flex: 1,
    height: "50%",
    padding: 1,
    margin: 5,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { maxHeight: "50%" },
  card: {
    flexDirection: "row",
    padding: 10,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "start",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  spotName: {
    fontSize: 18,
    fontWeight: "bold",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: 300,
  },
  rating: { color: "#007AFF", fontSize: 16, fontWeight: "bold", paddingTop: 5 },
  parking: {
    fontSize: 14,
    fontWeight: "bold",
    paddingTop: 5,
  },
  park: { color: "#007AFF" },
  no_park: { color: "#ff4b48" },
  refreshButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 20,
  },
  refreshText: { color: "#fff", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontWeight: "bold" },
});

export default App;
