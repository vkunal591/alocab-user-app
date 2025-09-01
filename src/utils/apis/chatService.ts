import apiUtils from "../../utils/apiUtils";

import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";

const SOCKET_URL = process.env.API_BASE_URL || "http://192.168.1.68:8080"; // fallback URL
let socket: Socket | null = null;
// src/services/socketService.ts


type MessagePayload = { senderId: string; receiverId: string; text?: string; chatFile?: string | null };
type TypingPayload = { receiverId: string; senderId: string };


export interface ChatMessagePayload {
    initiator: string;
    receiver: string;
    action: 'commented';
    content: string;
    ticketId: string;
}

export interface ChatMessageResponse {
    _id: string;
    content: string;
    initiator: string;
    receiver: string;
    action: string;
    ticketId: string;
    createdAt: string;
    updatedAt: string;
}

// Send message to the backend
export const sendChatMessage = async (data: ChatMessagePayload): Promise<ChatMessageResponse> => {
    return apiUtils.post<ChatMessageResponse>('/support/tickets/interactions', data);
};

// Fetch all messages related to a ticket
export const getChatMessages = async (ticketId: string): Promise<ChatMessageResponse[]> => {
    return apiUtils.post<ChatMessageResponse[]>(`/api/support/tickets/interactions`, {
        "initiator": "6821e6d556442aa2405ae2e1",
        "receiver": "68305b031dcea7fd31b775db",
        "action": "commented",
        "content": "Hello! How can I assist you today?",
        "ticketId": "689c8406ecd64e9a8348549d"
    });
};





// src/services/socketService.ts


export const initSocket = (): void => {
    console.log(SOCKET_URL)
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            forceNew: true,
        });

        socket.on('connect', () => console.log('Socket connected:', socket?.id));
        socket.on('disconnect', () => console.log('Socket disconnected'));
        socket.on('connect_error', err => console.error('Socket connection error:', err));
    }
};

export const addUser = (userId: string): void => {
    console.log(userId)
    socket?.emit('addUser', userId);
};

export const sendMessage = (payload: MessagePayload): void => {
    socket?.emit('sendMessage', payload);
};

export const onMessageReceived = (cb: (msg: { senderId: string; text: string; chatFile: string | null }) => void): void => {
    socket?.on('getMessage', cb);
};

export const emitTyping = (payload: TypingPayload): void => {
    socket?.emit('typing', payload);
};

export const onTyping = (cb: (senderId: string) => void): void => {
    socket?.on('user-typing', cb);
};

export const onUsersUpdate = (cb: (users: { userId: string; socketId: string }[]) => void): void => {
    socket?.on('getUsers', cb);
};

export const markAsRead = (payload: { senderId: string; receiverId: string }): void => {
    socket?.emit('markAsRead', payload);
};

export const onMessagesRead = (cb: (data: { receiverId: string }) => void): void => {
    socket?.on('messagesRead', cb);
};

export const disconnectSocket = (): void => {
    socket?.disconnect();
    socket = null;
};
