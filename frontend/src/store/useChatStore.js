import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { use } from "react";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    /* Get Users */
    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    /* Get Messages */
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    /* Send Message */
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();

        if (!selectedUser) {
            return toast.error("Please select a user to send message");
        }

        try {
            const response = await axiosInstance.post(
                `/messages/send/${selectedUser._id}`,
                messageData
            );

            set({ messages: [...messages, response.data] });

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error?.response?.data?.message || "Failed to send message");
        }
    },

    /* Subscribe to Messages */
    subscribeToMessages: () => {
        const { selectedUser } = get();
        if(!selectedUser) {
            return toast.error("Please select a user to chat");
        }
        const socket = useAuthStore.getState().socket;

       

        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (newMessage.senderId !== selectedUser._id) return;
            set({
                messages:[...get().messages, newMessage],
            });
        });
    },

    /* Unsubscribe from Messages */
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    /* Set Selected User */
    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
