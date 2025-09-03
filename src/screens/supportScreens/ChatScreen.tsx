// src/screens/ChatScreen.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { THEAMCOLOR } from "../../../assets/theam/theam";
import BackButton from "../../Components/common/BackButton";
import { initSocket, addUser, onMessageReceived, sendMessage, onTyping, onUsersUpdate, disconnectSocket, emitTyping } from "../../utils/apis/chatService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePath from "../../constants/ImagePath";


const { width } = Dimensions.get("screen");

interface Msg {
  id: string | number;
  text?: string;
  isOwn: boolean;
  time: string;
  chatFile?: string | null;
}

const ChatScreen: React.FC = () => {
  const scrollRef = useRef<ScrollView>(null);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const ride = route.params?.ride;
  let ticket = ride?.ticket;
  const receiverId = ride?.driver?._id;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typingUser, setTypingUser] = useState<string>("");
  const getUser = async () => {
    const user = await AsyncStorage.getItem('user')
    if (user) {
      const data = await JSON.parse(user)
      return data
    }
  }
  useEffect(() => {
    const setupChat = async () => {
      const socket = initSocket();

      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          const parsed = JSON.parse(user);
          setCurrentUserId(parsed?._id);
          addUser(parsed?._id);
        } else {
          Alert.alert("Error", "User not found in local storage.");
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        Alert.alert("Error", "Failed to initialize chat.");
      }

      onMessageReceived((msg) => {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.senderId + "_" + Date.now(),
            text: msg.text,
            isOwn: false,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            chatFile: msg.chatFile ?? null,
          },
        ]);
      });

      onTyping((sender) => {
        if (sender === receiverId) {
          setTypingUser("Opponent is typing...");
          setTimeout(() => setTypingUser(""), 2000);
        }
      });

      onUsersUpdate((users) => console.log("Connected users:", users));
    };

    setupChat();

    return () => {
      disconnectSocket();
    };
  }, [receiverId]);

  const handleSend = () => {
    if (!message.trim() || !currentUserId || !receiverId) return;

    const localMsg: Msg = {
      id: `local-${Date.now()}`,
      text: message,
      isOwn: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, localMsg]);
    sendMessage({ senderId: currentUserId, receiverId, text: message });
    setMessage("");
  };

  const handleTyping = () => {
    if (currentUserId && receiverId) {
      emitTyping({ senderId: currentUserId, receiverId });
    }
  };

  const makeCall = () => {
    const phone = ride?.driver?.phoneNumber;
    if (!phone) {
      return ToastAndroid.show('No phone number available', ToastAndroid.SHORT);
    }
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.profileRow}>
          <Image
            source={ImagePath.Profile}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{ride?.driver?.name || "Driver"}</Text>
            <Text style={styles.detail}>{typingUser ? typingUser : "Active"}</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => ride?.driver?.phoneNumber && Linking.openURL(`tel:${ride.driver.phone}`)}
          >
            <Ionicons name="call-outline" size={20} color={THEAMCOLOR.SecondaryGray} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageBubble, msg.isOwn ? styles.ownMessage : styles.incomingMessage]}>
            {msg.text && (
              <Text style={msg.isOwn ? styles.messageTextWhite : styles.messageText}>{msg.text}</Text>
            )}
            <Text style={msg.isOwn ? styles.messageTimeWhite : styles.messageTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputContainer}>
          {/* <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="camera-outline" size={24} color={THEAMCOLOR.PrimaryGreen} />
          </TouchableOpacity> */}
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={(t) => {
              setMessage(t);
              handleTyping();
            }}
            placeholder="Type a message..."
            placeholderTextColor={THEAMCOLOR.SecondaryBlack}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEAMCOLOR.SecondarySmokeWhite },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "lightgray",
  },
  profileRow: { flexDirection: "row", alignItems: "center", flex: 1, marginLeft: 80 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: THEAMCOLOR.SecondaryGray,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: THEAMCOLOR.SecondaryBlack },
  detail: { fontSize: 12, color: THEAMCOLOR.PrimaryGreen },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEAMCOLOR.SecondaryGray,
    alignItems: "center",
    justifyContent: "center",
  },
  chatContainer: { flex: 1, paddingHorizontal: 15, paddingTop: 10 },
  chatContent: { paddingBottom: 20 },
  messageBubble: {
    maxWidth: width * 0.7,
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  ownMessage: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  incomingMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  messageText: { fontSize: 14, color: "#000" },
  messageTextWhite: { fontSize: 14, color: "#fff" },
  messageTime: { fontSize: 10, color: "#666", marginTop: 5, textAlign: "right" },
  messageTimeWhite: { fontSize: 10, color: "#fff", marginTop: 5, textAlign: "right" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "lightgray",
  },
  mediaButton: { padding: 10 },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: THEAMCOLOR.SecondaryBlack,
  },
  sendButton: {
    backgroundColor: THEAMCOLOR.PrimaryGreen,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});
