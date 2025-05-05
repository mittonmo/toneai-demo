"use client";
import React from "react";

function MainComponent() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const { data: user, loading: userLoading } = useUser();
  const [streamingMessage, setStreamingMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const [showOriginal, setShowOriginal] = useState(null);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts", { method: "GET" });
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      const data = await response.json();
      setContacts(data.contacts);
    } catch (error) {
      setError("Could not load contacts");
      console.error(error);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const response = await fetch(`/api/messages?contact_id=${contactId}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      setError("Could not load messages");
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.contact_id);
    }
  }, [selectedContact]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setLoadingMessage(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: selectedContact.contact_id,
          content: newMessage,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const data = await response.json();
      setMessages([...messages, data.message]);
      setNewMessage("");
    } catch (error) {
      setError("Could not send message");
      console.error(error);
    }
    setLoadingMessage(false);
  };

  const handleTouchStart = (messageId) => {
    const timer = setTimeout(() => {
      setShowOriginal(messageId);
    }, 500);
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setShowOriginal(null);
  };

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-xl text-gray-600">
            Please sign in to continue
          </p>
          <a
            href="/account/signin"
            className="rounded-lg bg-[#357AFF] px-6 py-3 text-white hover:bg-[#2E69DE]"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 border-r bg-white">
        <div className="p-4">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Contacts</h2>
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.contact_id}
                onClick={() => setSelectedContact(contact)}
                className={`cursor-pointer rounded-lg p-3 hover:bg-gray-50 ${
                  selectedContact?.contact_id === contact.contact_id
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300">
                    {contact.image && (
                      <img
                        src={contact.image}
                        alt={contact.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-sm text-gray-500">
                      {contact.relationship}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {selectedContact ? (
          <>
            <div className="border-b bg-white p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-300">
                  {selectedContact.image && (
                    <img
                      src={selectedContact.image}
                      alt={selectedContact.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {selectedContact.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedContact.relationship}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                    onTouchStart={() => handleTouchStart(message.id)}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={() => handleTouchStart(message.id)}
                    onMouseUp={handleTouchEnd}
                    onMouseLeave={handleTouchEnd}
                  >
                    <div
                      className={`relative max-w-[70%] rounded-lg p-3 ${
                        message.sender_id === user.id
                          ? "bg-[#357AFF] text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {message.is_stamp ? (
                        <div className="text-4xl">
                          {message.original_content.replace("stamp:", "")}
                        </div>
                      ) : (
                        <>
                          <p>{message.rewritten_content}</p>
                          {showOriginal === message.id && (
                            <div className="absolute left-0 right-0 top-0 z-10 rounded-lg bg-black/75 p-3 text-white">
                              <p className="text-sm">Original message:</p>
                              <p>{message.original_content}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {streamingMessage && (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] rounded-lg bg-[#357AFF] p-3 text-white opacity-50">
                      {streamingMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t bg-white p-4"
            >
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#357AFF] focus:outline-none focus:ring-1 focus:ring-[#357AFF]"
                />
                <button
                  type="submit"
                  disabled={loadingMessage || !newMessage.trim()}
                  className="rounded-lg bg-[#357AFF] px-6 py-2 text-white hover:bg-[#2E69DE] disabled:opacity-50"
                >
                  {loadingMessage ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-gray-500">Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;