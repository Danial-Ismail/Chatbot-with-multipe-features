import React, { useEffect, useState } from 'react'
import './App.css'
import RoboImg from "./images/Ai-img.avif"
import API_KEY from './config';
import axios from 'axios';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import MarkDown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Avatar } from '@chatscope/chat-ui-kit-react';
import Aipic from "./assets/chatgpt.jpeg";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';








const Chatbot = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const displayInitialMessage = (text) => {
        let initialMessage = [
            {
                message: text,
                sentTime: "just now",
                sender: "system",
                direction: "incoming",
                position: "single",
            },
        ];

        setData(initialMessage);
    };

    useEffect(() => {
        displayInitialMessage("Hello! How Can I Help You Today?");
    }, []);





    const myChat = async (text) => {
        const isTableRequest = text.toLowerCase().includes("table")
        const isImageRequest=text.toLowerCase().includes("image")

        if (isTableRequest) {
            try {
                const tableData = await fetchTableData(text);
                console.log(tableData);
            } catch (error) {
                console.log(error);
            }
        }else if(isImageRequest){
            const url="https://api.openai.com/v1/images/generations"
            const config={
                headers:{
                    Authorization: `Bearer ${API_KEY}`
                }
            }

            const data={
                "model": "dall-e-3",
                "prompt": "a white siamese cat",
                "n": 1,
                "size": "1024x1024"
            }

            try {
                setIsLoading(true);
    
                const response = await axios.post(url, data, config);
    
                let result = response.data.choices[0]?.message?.content || "";
    
              console.log(result)
            } catch (error) {
                console.log(error);
                setIsLoading(false)
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        }
        
        else {
            const url = "https://api.openai.com/v1/chat/completions"
            const config = {
                headers: {
                    Authorization: `Bearer ${API_KEY}`
                }
            }


            const data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": `${text}`
                    },
                ],
                "temperature": 0.7,
                "stream": false
            }
            setIsLoading(true)

            axios.post(url, data, config).then((res) => {
                let result = res.data.choices[0]['message']['content']
                console.log("result", result)

                let my_value = [
                    {
                        message: result,
                        sentTime: "just now",
                        sender: "system",
                        direction: "incoming",
                        position: "single"
                    },
                ]

                setData(prev => [...prev, ...my_value])
                setIsLoading(false)
            }).catch((error) => {
                console.log(error)
                setIsLoading(false)
            })
        }
    }

    const fetchTableData = async (text) => {
        const url = "https://api.openai.com/v1/chat/completions"
        const config = {
            headers: {
                Authorization: `Bearer ${API_KEY}`
            }
        }

        const data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "Provide the response in table format and show full response"
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            "temperature": 0.7,
            "top_p": 1,
        }

        try {
            setIsLoading(true);

            const response = await axios.post(url, data, config);

            let result = response.data.choices[0]?.message?.content || "";

            let my_value = [
                {
                    message: result,
                    sentTime: "just now",
                    sender: "system",
                    direction: "incoming",
                    position: "single",
                },
            ];

            setData((prev) => [...prev, ...my_value]);
            return result;
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    const onclick = (text) => {
        let my_value = [
            {
                message: text,
                sentTime: "just now",
                sender: "user",
                direction: "outgoing",
                position: "single",
            },
        ]

        setData(prev => [...prev, ...my_value])
        myChat(text)
    }
    return (
        <div className='flex flex-col sm:flex-row'>
            <ToastContainer />
            <div className='sm:w-1/2 lg:w-[60%] bg-cover lg:h-screen bg-center'>
                <img src={RoboImg} style={{ width: "100%", height: "100%" }} />
            </div>
            <div className='lg:w-[40%] sm:w-1/2 flex flex-col lg:h-screen'>
                <div className='bg-blue-500 text-white p-4  items-center justify-center'>
                    <h1 className='font-bold text-lg'>AI Chatbot</h1>
                    <div style={{ position: "relative", height: "570px" }}>
                        <MainContainer>
                            <ChatContainer>
                                <MessageList typingIndicator={isLoading ? <TypingIndicator content="Ai is typing..." /> : null}>
                                    {data.map((value, i) => {
                                        if (value?.message && value?.message.includes("|")) {
                                            return (
                                                <div>
                                                    {value.sender === 'user' ? null : <Avatar src={Aipic} />}
                                                    <MarkDown key={String(i)} rehypePlugins={[remarkGfm]}>
                                                        {value?.message}
                                                    </MarkDown>
                                                </div>
                                            );
                                        } else if (value?.message && value?.message.includes("```")) {
                                            return (
                                                <div key={i}>
                                                    {value.sender === 'user' ? null : <Avatar src={Aipic} />}
                                                    <SyntaxHighlighter language="javascript" style={vscDarkPlus}  >
                                                        {value?.message.replace(/```/g, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            )
                                        }
                                        else {
                                            // Render regular message
                                            return (
                                                <div key={String(i)}>
                                                    {value.sender === 'user' ? null : <Avatar src={Aipic} />} 
                                                    <Message
                                                        model={{
                                                            message: value?.message,
                                                            sentTime: value?.sentTime,
                                                            sender: value?.sender,
                                                            direction: value?.direction,
                                                        }}
                                                    />
                                                </div>
                                            );
                                        }
                                    })}
                                </MessageList>
                                <MessageInput placeholder="Type message here" onSend={onclick} />
                            </ChatContainer>
                        </MainContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Chatbot