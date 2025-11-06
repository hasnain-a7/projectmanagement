import { useState, useEffect, useRef, useMemo } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "@/Config/firbase";
import { useUserContextId } from "@/AuthContext/UserContext";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTaskContext } from "@/TaskContext/TaskContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Loader2 } from "lucide-react";
import Loader from "./Loader";

export default function ProjectChatModal({ projectId }: { projectId: string }) {
  const { userContextId } = useUserContextId();
  const { userData } = useTaskContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectSnap = await getDoc(doc(db, "Projects", projectId));
        if (projectSnap.exists()) {
          const data = projectSnap.data();
          setAssignedUsers(data?.assignedUsers || []);
          setOwnerId(data?.userId || null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const q = query(
      collection(db, "Projects", projectId, "chat"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs.reverse());
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.size === 10);
    });

    return () => unsubscribe();
  }, [projectId]);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);

    const scrollPos = scrollContainerRef.current?.scrollHeight || 0;

    const next = query(
      collection(db, "Projects", projectId, "chat"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(10)
    );

    const snapshot = await getDocs(next);
    const newMsgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (newMsgs.length > 0) {
      setMessages((prev) => [...newMsgs.reverse(), ...prev]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.size === 10);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);

    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight - scrollPos;
      }
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await addDoc(collection(db, "Projects", projectId, "chat"), {
        text: message,
        senderId: userData?.id || userContextId,
        senderName: userData?.fullname || "Unknown",
        senderPhoto: userData?.avatar || "",
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 1500);
  };

  // 🧠 Check if user can chat
  const canChat = useMemo(
    () =>
      ownerId === userContextId ||
      assignedUsers.includes(userContextId!) ||
      assignedUsers.includes(userData?.id || ""),
    [ownerId, assignedUsers, userContextId, userData?.id]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={"sm"}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300"
        >
          <MessageCircle size={26} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl p-0 rounded-xl shadow-2xl border border-border/40">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Project Chat
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Collaborate and communicate with your team in real time.
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className="px-2 py-1 bg-primary rounded-md"
            >
              Live
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex h-[65vh]">
          {loading ? (
            <div className="flex justify-center px-[480px] items-center">
              <Loader />
            </div>
          ) : (
            <>
              {/* Participants Sidebar */}
              <div className="w-1/3 border-r bg-muted/10 flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                    Participants
                  </h3>
                </div>

                <ScrollArea className="flex-1 p-4 space-y-2">
                  {userData && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-transparent hover:border-border transition cursor-pointer">
                      <Avatar className="w-9 h-9 border">
                        {userData.avatar ? (
                          <AvatarImage src={userData.avatar} />
                        ) : (
                          <AvatarFallback>
                            {userData.fullname?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex items-center justify-between ">
                        <p className="text-sm font-medium">
                          {userData.fullname}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-auto">
                        You
                      </Badge>
                    </div>
                  )}

                  <Separator className="my-3" />

                  {assignedUsers.length > 0 ? (
                    assignedUsers.map((userId, i) => {
                      if (userId === userData?.id) return null;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition cursor-pointer"
                        >
                          <Avatar className="w-9 h-9 border">
                            <AvatarFallback>
                              {userId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium">{userId}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No assigned members.
                    </p>
                  )}
                </ScrollArea>
              </div>

              <div className="flex-1 flex flex-col bg-background">
                <ScrollArea
                  ref={scrollContainerRef}
                  className="flex-1 h-[40vh] px-4 py-2"
                >
                  <div className="space-y-2">
                    {hasMore && (
                      <div className="flex justify-center mb-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={loadMore}
                          disabled={loadingMore}
                        >
                          {loadingMore ? "Loading..." : "Load older messages"}
                        </Button>
                      </div>
                    )}

                    {messages.map((msg) => {
                      const isUser = msg.senderId === userContextId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isUser ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] p-3 rounded-2xl shadow-sm border ${
                              isUser
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-muted text-foreground rounded-bl-none"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="w-6 h-6 border">
                                <AvatarImage src={msg.senderPhoto} />
                                <AvatarFallback>
                                  {msg.senderName?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs opacity-80 font-medium">
                                {msg.senderName}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <Separator />

                {canChat && assignedUsers?.length > 0 ? (
                  <form
                    onSubmit={sendMessage}
                    className="flex flex-col gap-1 p-3 border-t bg-muted/10 backdrop-blur"
                  >
                    {typing && (
                      <p className="text-xs text-muted-foreground mb-2 px-3">
                        {userData?.fullname || "You"} are typing...
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={handleTyping}
                        className="flex-1 border rounded-full px-4"
                        disabled={sending}
                      />
                      <Button
                        type="submit"
                        disabled={!message.trim() || sending}
                        className="rounded-full px-6 flex items-center gap-2"
                      >
                        {sending && (
                          <Loader2 className="animate-spin w-4 h-4 text-white" />
                        )}
                        {sending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    You’re not a participant of this project.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
