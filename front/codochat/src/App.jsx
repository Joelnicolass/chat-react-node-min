import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// URL del servidor
const URL_SV = "http://localhost:3001";

const App = () => {
  // CONEXION AL SERVIDOR

  // referencia del servidor
  const server = useRef(null);

  // EFECTO PARA SINCRONIZAR LA CONEXION AL SERVIDOR
  useEffect(() => {
    // se conecta al servidor
    server.current = io(URL_SV);

    // se escuchan los eventos de conexion y desconexion
    server.current.on("connect", () => {});
    server.current.on("disconnect", () => {});

    // se emite el evento join - el back lo usa para unir al usuario a una sala
    server.current.emit("join", "sala-1");
    // se puede cambiar el nombre de la sala, obtenerlo de un input, contexto, etc

    return () => {
      // se desconecta del servidor
      server.current.off("connect");
      server.current.off("disconnect");
    };
  }, []);

  // MENSAJES

  // estado para guardar los mensajes
  const [messages, setMessages] = useState([]);

  // referencua para el scroll al final del chat
  const chatRef = useRef(null);

  // funcion para hacer scroll al final del chat
  const scrollToBottom = (el, delay = 200) =>
    setTimeout(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }, delay);

  // EFECTO PARA SINCRONIZAR NUEVOS MENSAJES
  useEffect(() => {
    // se escucha el evento newMessage - el back lo usa para enviar un mensaje a la sala
    server.current.on("newMessage", (message) => {
      /*
        el backend emite el siguiente objeto
        { msg, room, id } 
      */
      setMessages((messages) => [...messages, message]);

      // se hace scroll al final del chat
      scrollToBottom(chatRef.current);
    });

    return () => {
      // se deja de escuchar el evento newMessage
      server.current.off("newMessage");
    };
  }, []);

  // EFECTO PARA SINCRONIZAR EVENTOS DEL NAVEGADOR
  useEffect(() => {
    // se hace scroll al final del chat cuando la ventana esta activa
    window.addEventListener("focus", () => {
      scrollToBottom(chatRef.current, 200);
    });

    return () => {
      window.removeEventListener("focus", () => {});
    };
  }, []);

  // funcion para enviar un mensaje
  const sendMessage = (msg) => {
    // se emite el evento message - el back lo recibe y emite un nuevo evento newMessage
    server.current.emit("message", msg);
  };

  return (
    <main>
      <section ref={chatRef}>
        {messages.map((message, index) => (
          <article key={index}>
            <p>{message.id}</p>
            <p>{message.msg}</p>
          </article>
        ))}
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();

          // esta es una forma de manejar formularios de forma nativa, sin necesidad de utilizar una referencia o un estado

          // se obtiene el formulario
          const form = e.target;
          // se obtienen los datos del formulario
          const data = new FormData(form);
          // se obtiene el valor del input con name="message"
          const message = data.get("message");

          // se envia el mensaje
          sendMessage(message.toString());

          // se limpia el formulario
          form.reset();
        }}
      >
        <input name="message" type="text" />
        <input type="submit" value="Enviar" />
      </form>
    </main>
  );
};

export default App;
