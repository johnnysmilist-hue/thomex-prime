"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ChatContextType = {
  open: boolean;
  unread: boolean;
  setOpen: (open: boolean) => void;
  setUnread: (unread: boolean) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);

  return (
    <ChatContext.Provider value={{ open, unread, setOpen, setUnread }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatWidget() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatWidget must be used within ChatProvider");
  return context;
}
