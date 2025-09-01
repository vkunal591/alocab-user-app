// src/screens/ChatScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions, Image, StyleSheet, Text, View, TextInput,
    TouchableOpacity, ScrollView, Alert, Linking, KeyboardAvoidingView, Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import { THEAMCOLOR } from '../../../assets/theam/theam';
import BackButton from '../../Components/common/BackButton';
import {
    initSocket, addUser, sendMessage as socketSendMessage, onMessageReceived,
    emitTyping, onTyping, onUsersUpdate, disconnectSocket, getChatMessages, sendChatMessage
} from '../../utils/apis/chatService';


const { width } = Dimensions.get('screen');

const ChatScreen = () => {
    const scrollRef = useRef<ScrollView>(null);
    const route = useRoute<any>();
    const ticket = route?.params?.ticket;
    const ride = route?.params?.ride
    const currentUserId = ride?.driver?._id;
    const receiverId = ride?.user?._id;

    console.log(ride)
    // const currentUserId = '6824667ae592b3012e668358'; // dynamic in real scenarios
    // const receiverId = '68246666e592b3012e668354'; 

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [typingUser, setTypingUser] = useState<string>('');

    useEffect(() => {
        initSocket();
        addUser(currentUserId);

        onMessageReceived((msg) => {
            setMessages(prev => [...prev, { id: Date.now(), text: msg.text, isOwn: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), chatFile: msg.chatFile }]);
        });

        onTyping(senderId => {
            setTypingUser(senderId === receiverId ? 'User is typing...' : '');
            setTimeout(() => setTypingUser(''), 2000);
        });

        onUsersUpdate(users => console.log('Connected users:', users));

        return () => {
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        if (ticket?._id) loadMessages(ticket._id);
    }, [ticket]);

    const loadMessages = async (ticketId: string) => {
        try {
            const res = await getChatMessages(ticketId);
            setMessages(res.map(msg => ({
                id: msg._id,
                text: msg.content,
                isOwn: msg.initiator === currentUserId,
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            })));
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to load messages.');
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        const newMsg: any = { initiator: currentUserId, receiver: receiverId, action: 'commented', content: message, ticketId: ticket?._id };
        const local = { id: `local-${Date.now()}`, text: message, isOwn: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };

        setMessages(prev => [...prev, local]);
        setMessage('');

        socketSendMessage({ senderId: currentUserId, receiverId, text: message });
        try {
            await sendChatMessage(newMsg);
        } catch {
            Alert.alert('Failed to send message');
        }
    };

    const handleTyping = () => {
        emitTyping({ senderId: currentUserId, receiverId });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackButton />
                <View style={styles.profileRow}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=8' }} style={styles.avatar} />
                    <View style={styles.info}>
                        <Text style={styles.name}>Nikhil</Text>
                        <Text style={styles.detail}>Active</Text>
                    </View>
                    <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL('tel:1234567890')}>
                        <Ionicons name="call-outline" size={20} color={THEAMCOLOR.SecondaryGray} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent} ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                {messages.map(msg => (
                    <View key={msg.id} style={[styles.messageBubble, msg.isOwn ? styles.ownMessage : styles.incomingMessage]}>
                        {msg.text && <Text style={msg.isOwn ? styles.messageTextWhite : styles.messageText}>{msg.text}</Text>}
                        <Text style={msg.isOwn ? styles.messageTimeWhite : styles.messageTime}>{msg.time}</Text>
                    </View>
                ))}
                {typingUser ? <Text style={styles.typingText}>{typingUser}</Text> : null}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.mediaButton}>
                        <Ionicons name="camera-outline" size={24} color={THEAMCOLOR.PrimaryGreen} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={text => { setMessage(text); handleTyping(); }}
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
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
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
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600', color: THEAMCOLOR.SecondaryBlack },
    detail: { fontSize: 12, color: THEAMCOLOR.PrimaryGreen },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: THEAMCOLOR.SecondaryGray,
        alignItems: 'center',
        justifyContent: 'center',
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
    messageText: { fontSize: 14, color: '#000' },
    messageTextWhite: { fontSize: 14, color: '#fff' },
    messageTime: { fontSize: 10, color: '#666', marginTop: 5, textAlign: 'right' },
    messageTimeWhite: { fontSize: 10, color: '#fff', marginTop: 5, textAlign: 'right' },
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
    mediaButton: { padding: 10 },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
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
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    typingText: {
        fontSize: 12,
        color: THEAMCOLOR.SecondaryWhite,
        marginLeft: 10
    }
});

