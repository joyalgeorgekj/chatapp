import { useEffect, useRef, useState, type FormEvent } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
    const [messages, setMessages] = useState<
        | {
              id: string;
              text: any;
              sender: string;
              time: number;
          }[]
        | []
    >([]);
    const [text, setText] = useState<string>("");
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const inputRef = useRef<null | HTMLInputElement>(null);
    const [name, setName] = useState<string>("");
    const [toggle, setToggle] = useState<boolean>(false);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected:", socket.id);
        });

        socket.on("chat:message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        if (inputRef.current) inputRef.current.focus();

        return () => {
            socket.off("chat:message");
            setMessages([]);
        };
    }, []);

    // auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef)
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!text.trim()) return;

        socket.emit("chat:message", { from: name, text });
        setText("");
    };

    const setUserName = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setToggle(true);
    };

    if (!toggle)
        return (
            <div className="grid min-h-screen">
                <div className="flex flex-col p-2.5 gap-2 w-fit mx-auto">
                    <form onSubmit={setUserName} className="flex h-fit gap-2">
                        <input
                            value={name}
                            type="text"
                            name="username-input"
                            className="px-4 py-2 outline-0 rounded-md border border-neutral-700/50"
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Choose Display Name..."
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 outline-0 rounded-md border border-neutral-200/50 bg-blue-600/75 text-white cursor-pointer"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        );

    return (
        <div className="grid min-h-screen">
            <div className="flex flex-col p-2.5 gap-2 w-fit mx-auto">
                {messages.map((m, ind) => (
                    <>
                        <div
                            key={ind}
                            className="flex flex-col gap-1 w-full max-w-[320px]"
                        >
                            <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                                <span className="text-sm font-semibold text-heading">
                                    {name + socket.id === m.sender + m.id
                                        ? "You"
                                        : m.sender}
                                    :
                                </span>
                                <span className="text-sm text-body">
                                    {new Date(m.time).getHours() +
                                        ":" +
                                        new Date(m.time).getMinutes()}
                                </span>
                            </div>
                            <div className="flex flex-col px-4 py-3 rounded-md bg-blue-600/75 text-white font-bold w-fit cursor-pointer">
                                <p className="text-sm text-body"> {m.text}</p>
                            </div>
                        </div>
                    </>
                ))}
                <div ref={messagesEndRef} />
                <form onSubmit={sendMessage} className="flex h-fit gap-2">
                    <input
                        value={text}
                        type="text"
                        name="message-input"
                        className="px-4 py-2 outline-0 rounded-md border border-neutral-700/50"
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        autoFocus
                        ref={inputRef}
                    />
                    <button className="px-4 py-2 outline-0 rounded-md border border-neutral-200/50 bg-blue-600/75 text-white cursor-pointer">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default App;
