import axios from "axios";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchChaiSpots(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchChaiSpots = async (lat, lng) => {
    console.log("lat", lat, "lng", lng);
    try {
      const response = await axios.get(
        `http://192.168.1.12:5000/nearby-chai-spots?lat=${lat}&lng=${lng}`
      );
      console.log("data", response.data);
      setChaiSpots(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!location) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  return (
    <View style={styles.container}>
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

      <FlatList
        style={styles.flatList}
        data={chaiSpots}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedSpot(item)}
            style={styles.listItem}
          >
            <Text style={styles.spotName}>{item.name}</Text>
            <Text>
              {item.rating
                ? "Waah " + parseInt(item.rating) + " Rated!"
                : "N/A"}
            </Text>
            <Text>Parking: {item.parking ? "Yes" : "No"}</Text>
          </TouchableOpacity>
        )}
      />

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
              {selectedSpot?.rating
                ? parseInt(selectedSpot?.rating) + "Waaah"
                : "N/A"}
            </Text>
            <Text>Parking: {selectedSpot?.parking ? "Yes" : "No"}</Text>
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
  container: { flex: 1 },
  map: { flex: 1, height: "50%" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  flatList: { maxHeight: "50%" },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  spotName: { fontSize: 16, fontWeight: "bold" },
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
