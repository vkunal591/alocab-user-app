import { Dimensions, Image, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { LINE_HEIGHT, TEXT_SIZE, THEAMCOLOR, THEAMFONTFAMILY } from '../../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import ImagePath from '../../constants/ImagePath';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { launchCamera } from 'react-native-image-picker';

const { width, height } = Dimensions.get('screen');

const ChatScreen = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hello! How can I assist you today?', isOwn: false, time: '10:30 AM' },
        { id: 2, text: 'Hi, I have a question about my booking.', isOwn: true, time: '10:32 AM' },
        { id: 3, text: 'Sure, please share the details.', isOwn: false, time: '10:33 AM' },
    ]);

    const handleSend = () => {
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                text: message,
                isOwn: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, newMessage]);
            setMessage('');
            // Add logic to send message to backend if needed
            console.log('Sending message:', message);
        }
    };

    const checkCameraPermission = async () => {
        try {
            const result = await check(PERMISSIONS.ANDROID.CAMERA);
            switch (result) {
                case RESULTS.GRANTED:
                    captureImage();
                    break;
                case RESULTS.DENIED:
                    const requestResult = await request(PERMISSIONS.ANDROID.CAMERA);
                    if (requestResult === RESULTS.GRANTED) {
                        captureImage();
                    } else {
                        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
                    }
                    break;
                case RESULTS.BLOCKED:
                    Alert.alert(
                        'Permission Blocked',
                        'Camera permission is blocked. Please enable it in settings.',
                    );
                    break;
            }
        } catch (error) {
            console.error('Permission error:', error);
        }
    };

    const captureImage = () => {
        launchCamera({ mediaType: 'photo', cameraType: 'back' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.errorCode) {
                console.log('Camera Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const imageUri = response.assets[0].uri;
                const newImageMessage = {
                    id: messages.length + 1,
                    imageUri: imageUri,
                    isOwn: true,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages([...messages, newImageMessage]);
                // Add logic to send image to backend if needed
                console.log('Image captured and sent:', imageUri);
            }
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <BackButton />
                <View style={styles.profileRow}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=8' }} style={styles.avatar} />
                    <View style={styles.info}>
                        <Text style={styles.name}>Nikhil</Text>
                        <Text style={styles.detail}>Active</Text>
                    </View>
                    <TouchableOpacity style={styles.callButton}>
                        <Ionicons name="call-outline" size={20} color={THEAMCOLOR.SecondaryGray} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chat Area */}
            <ScrollView
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.messageBubble,
                            msg.isOwn ? styles.ownMessage : styles.incomingMessage,
                        ]}
                    >
                        {msg.text ? (
                            <Text style={msg.isOwn ? styles.messageTextWhite : styles.messageText}>
                                {msg.text}
                            </Text>
                        ) : (
                            <Image
                                source={{ uri: msg.imageUri }}
                                style={styles.messageImage}
                                resizeMode="cover"
                            />
                        )}
                        <Text style={msg.isOwn ? styles.messageTimeWhite : styles.messageTime}>
                            {msg.time}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.mediaButton} onPress={checkCameraPermission}>
                    <Ionicons name="camera-outline" size={24} color={THEAMCOLOR.PrimaryGreen} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    placeholderTextColor={THEAMCOLOR.SecondaryBlack}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEAMCOLOR.SecondarySmokeWhite,
    },
    header: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: 'lightgray',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 80,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: THEAMCOLOR.SecondaryGray,
    },
    info: {
        flex: 1,
    },
    name: {
        fontWeight: '600',
        color: THEAMCOLOR.SecondaryBlack,
        fontSize: TEXT_SIZE.bodyLarge,
        lineHeight: LINE_HEIGHT.bodyLarge,
        fontFamily: THEAMFONTFAMILY.LatoRegular,
    },
    detail: {
        color: THEAMCOLOR.PrimaryGreen,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: THEAMCOLOR.SecondaryGray,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    chatContent: {
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: width * 0.7,
        padding: 10,
        borderRadius: 20,
        marginVertical: 5,
    },
    ownMessage: {
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 5,
    },
    incomingMessage: {
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    messageText: {
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        color: '#000',
    },
    messageTextWhite: {
        fontSize: 14,
        color: '#fff',
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        marginTop: 5,
        textAlign: 'right',
    },
    messageTimeWhite: {
        fontSize: 10,
        color: '#fff',
        marginTop: 5,
        textAlign: 'right',
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: 'lightgray',
    },
    mediaButton: {
        padding: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: TEXT_SIZE.small,
        lineHeight: LINE_HEIGHT.small,
        fontFamily: THEAMFONTFAMILY.NunitoSemiBold,
        color: THEAMCOLOR.SecondaryBlack,
    },
    sendButton: {
        backgroundColor: THEAMCOLOR.PrimaryGreen,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
});