import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiRefreshCw } from "react-icons/fi";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.REACT_APP_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { text: "Hola, ¿en qué puedo ayudarte?", sender: "IA" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, sender: "User" },
      ]);
      setNewMessage("");
      setIsTyping(true);

      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash-exp-0827",
        });
        const result = await model.generateContent(newMessage);
        const response = await result.response;
        const responseText = await response.text();

        // Añadir un nuevo mensaje vacío para la IA
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "", sender: "IA" },
        ]);

        // Ocultar la animación de "Escribiendo..."
        setIsTyping(false);

        // Mostrar la respuesta letra por letra en el nuevo mensaje
        let i = 0;
        const typingInterval = setInterval(() => {
          if (i < responseText.length) {
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];
              updatedMessages[updatedMessages.length - 1].text =
                responseText.substring(0, i + 1);
              return updatedMessages;
            });
            i++;
          } else {
            clearInterval(typingInterval);
          }
        }, 1);
      } catch (error) {
        console.error("Error al generar contenido:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Lo siento, hubo un problema al generar la respuesta.",
            sender: "IA",
          },
        ]);
        setIsTyping(false);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([{ text: "Hola, ¿en qué puedo ayudarte?", sender: "IA" }]);
  };

  // Ajustar la altura del textarea automáticamente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  // Desplazar la barra de desplazamiento hasta el final cuando se actualizan los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <div className="text-center mb-2 text-sm">
        {" "}
        Creado por{" "}
        <span className="bg-white text-black px-1 py-0.5 rounded text-xs">
          {" "}
          Johan Morales
        </span>
      </div>
      <div className="text-center mb-4 text-xs text-gray-400">
        {" "}
        Modelo: gemini-1.5-flash-exp-0827
      </div>
      <div className="max-w-lg lg:max-w-3xl mx-auto p-4 md:p-6 lg:p-8 bg-gray-800 rounded-lg shadow-lg text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-400 text-center w-full">
            Google AI Studio
          </h1>
          <button
            onClick={handleClearChat}
            className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 hidden sm:block"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto h-80 mb-4 space-y-4 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "User" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === "IA" && (
                  <img
                    src="https://media.es.wired.com/photos/6571e32ab049ae847837a2c3/1:1/w_856,h_856,c_limit/Screenshot%202023-12-07%20at%209.22.13.png"
                    alt="IA Avatar"
                    className="w-8 h-8 rounded-full bg-gray-700"
                  />
                )}
                <div
                  className={`p-3 max-w-xs md:max-w-sm lg:max-w-md break-words ${
                    message.sender === "IA"
                      ? "bg-gray-700"
                      : "bg-blue-500 text-white"
                  } rounded-xl shadow-md transform transition-all duration-200 ease-in-out`}
                >
                  <p className="text-sm opacity-75 mb-1">
                    {message.sender === "IA" ? "Google" : "Tú"}
                  </p>
                  <p className="text-lg whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.sender === "User" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    Tú
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start items-center space-x-2">
              <img
                src="https://media.es.wired.com/photos/6571e32ab049ae847837a2c3/1:1/w_856,h_856,c_limit/Screenshot%202023-12-07%20at%209.22.13.png"
                alt="IA Avatar"
                className="w-8 h-8 rounded-full bg-gray-700"
              />
              <div className="bg-gray-700 p-3 max-w-xs md:max-w-sm lg:max-w-md rounded-xl shadow-md">
                <p className="text-sm opacity-75 mb-1">Google</p>
                <p className="text-lg animate-pulse">Escribiendo...</p>
              </div>
            </div>
          )}

          {/* Elemento vacío para el desplazamiento automático */}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex mt-4">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900 text-white resize-none overflow-hidden"
            placeholder="Escribe un mensaje..."
            rows={1}
          />
          <div className="flex ml-2">
            {/* Contenedor para el botón de enviar y el de recargar */}
            <button
              onClick={handleSendMessage}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
            >
              <FiSend className="w-5 h-5" />
            </button>
            {/* Botón de limpiar el chat (visible en pantallas pequeñas) */}
            <button
              onClick={handleClearChat}
              className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ml-2 sm:hidden"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
