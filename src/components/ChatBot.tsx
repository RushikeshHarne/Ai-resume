"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { handleChat } from "@/app/actions";

type Message = {
  role: "user" | "bot";
  content: string;
};

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await handleChat({ query: input });
      if (result.success && result.reply) {
        const botMessage: Message = { role: "bot", content: result.reply };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage: Message = { role: "bot", content: "Sorry, I couldn't get a response. Please try again." };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = { role: "bot", content: "An error occurred. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 rounded-full h-16 w-16 bg-primary hover:bg-primary/90 shadow-lg"
          >
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Resume Assistant</SheetTitle>
          </SheetHeader>
          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "bot" && (
                  <div className="p-2 bg-secondary rounded-full">
                    <Bot className="h-6 w-6 text-secondary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                 {msg.role === "user" && (
                  <div className="p-2 bg-primary rounded-full">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-secondary rounded-full">
                    <Bot className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div className="max-w-xs p-3 rounded-lg bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for resume advice..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
