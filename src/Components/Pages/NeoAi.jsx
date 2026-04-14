import { faChevronLeft, faClose, faMicrophone, faPaperclip, faPaperPlane, faPhone, faPlugCircleBolt, faPlusCircle, faSearch, faVideo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";
// import '../../assets/css/chat.css'
import { toast } from "react-toastify";
import { Link, NavLink } from "react-router-dom";
import { getSecureApiData, securePostData } from "../../Services/api";
import AudioWaveform from "../AudioWaveform";
import Loader from "../Layouts/Loader";
import base_url from "../../../baseUrl";
function NeoAi() {
    const bottomRef = useRef(null);
    const userId = localStorage.getItem('userId')
    const [generalQuestions, setGeneralQuestions] = useState([]);
    const [myQuestions, setMyQuestions] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState()
    const [loading, setLoading] = useState(false)
    const [question, setQuestion] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [recording, setRecording] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [recordSeconds, setRecordSeconds] = useState(0);
    const recordTimerRef = useRef(null);
    const [chatSessions, setChatSessions] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    async function fetchGeneralQuestions() {
        if (!question.trim()) return;
        setMyQuestions(prev => [
            ...prev,
            {
                type: "user",
                question,
                file: previewFile || null,
                audio: recordedAudio || null
            },
        ]);

        setIsTyping(true);
        setRecording(false)
        setQuestion("");
        const data = new FormData()
        data.append("question", question)
        let chatSessionId
        if (!activeChatId) {
            const res = await securePostData("api/comman/create-chat");
            chatSessionId = res.data?._id
            setActiveChatId(res.data?._id)
        } else {
            chatSessionId = activeChatId
        }
        data.append("chatSessionId", chatSessionId)
        data.append("userId", userId)
        if (previewFile) {
            data.append("file", previewFile)
        } if (recordedAudio) {
            data.append("audio", recordedAudio)
        }
        try {
            const response = await securePostData(`api/comman/follow-up-question`, data)
            if (response.success) {
                setPreviewFile(null);
                setPreviewUrl(null);
                setRecordedAudio(null);
                const formattedMessages = [];
                response.questions.forEach(item => {
                    // USER QUESTION (RIGHT)
                    // formattedMessages.push({
                    //     type: "user",
                    //     question: item.question,
                    //     file: item.file || null,
                    //     audio: item.audio || null
                    // });
                    if (item.labResponseId) {
                        formattedMessages.push({
                            type: "ai",
                            answer: {
                                medicalBoundaryNote: "",
                                clinicalSummary: "",
                                summary: item?.labResponseId.summary,
                                followUpQuestions: item?.labResponseId.followUpQuestions || [],
                                recommendedInvestigations: [],
                                possibleTreatmentClasses: [],
                                redFlags: [],

                            }
                        });
                    }
                });
                setMyQuestions(prev => [...prev, ...formattedMessages]);
            }
            else {
                toast.error("Please try after some time")
            }
        } catch (error) {
            toast.error(error?.message)
        } finally {
            setIsTyping(false);
        }
    }
    async function fetchMyQuestions(chatId) {
        try {
            const response = await getSecureApiData(`api/comman/ask/question?chatSessionId=${chatId}`);

            if (response.success) {
                const formattedMessages = [];
                response.data.forEach(item => {
                    // USER QUESTION (RIGHT)
                    formattedMessages.push({
                        type: "user",
                        question: item.question,
                        file: item.file || null,
                        audio: item.audio || null
                    });

                    // AI ANSWER (LEFT)
                    if (item.labResponseId) {
                        formattedMessages.push({
                            type: "ai",
                            answer: {
                                summary: item?.labResponseId?.summary,
                                followUpQuestions: item?.labResponseId?.followUpQuestions || [],

                            }
                        });
                    }
                });

                setMyQuestions(formattedMessages);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function askQuestion(text = question) {
        if (!text.trim()) return;
        setMyQuestions(prev => [...prev, { type: "user", question: text, }]);
        setIsTyping(true);
        setQuestion("");
        let chatSessionId
        if (!activeChatId) {
            const res = await securePostData("api/comman/create-chat");
            chatSessionId = res.data?._id
            setActiveChatId(res.data?._id)
        } else {
            chatSessionId = activeChatId
        }
        try {
            const response = await securePostData(`api/comman/ask-question`, {
                question: text,
                userId,
                chatSessionId

            });

            if (response.success) {
                setMyQuestions(prev => [...prev, {
                    type: "ai",
                    answer: {
                        summary: response.data.labResponseId ? response.data.labResponseId?.summary : response.data?.summary,
                        followUpQuestions: response?.data?.followUpQuestions || []
                    }
                }]);
            } else {
                toast.error("Please try after some time")
            }
        } catch (err) {
            toast.error(err?.message)
        } finally {
            setIsTyping(false);
        }
    }


    useEffect(() => {
        if (activeChatId) {
            fetchMyQuestions(activeChatId);
        }
    }, [activeChatId]);
    useEffect(() => {
        fetchChatSessions();
    }, []);

    async function fetchChatSessions() {
        setLoading(true)
        try {

            const res = await getSecureApiData("api/comman/chat-sessions");
            if (res.success) {
                setChatSessions(res.data);

                if (res.data.length > 0) {
                    setActiveChatId(res.data[0]._id);
                }
            }
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }
    async function startNewChat() {
        const res = await securePostData("api/comman/create-chat");
        if (res.success) {
            setChatSessions(prev => [res.data, ...prev]);
            setActiveChatId(res.data._id);
            setMyQuestions([]); // clear messages
        }
    }


    useEffect(() => {
        myQuestions?.length > 0 && bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [myQuestions, isTyping]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreviewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };
    const uploadAudio = async (file) => {
        if (!selectedChat) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await securePostData("api/chat/upload", formData);

        socketRef.current.emit("send-message", {
            toUserId: selectedChat.participants[0]._id,
            message: "",
            file: {
                ...res.file,
                isAudio: true,
            },
        });

        setMessages((prev) => [
            ...prev,
            {
                sender: { _id: myUserId },
                file: { ...res.file, isAudio: true },
                createdAt: new Date(),
            },
        ]);
    };

    const toggleRecording = async () => {
        if (recording) {
            mediaRecorderRef.current.stop();
            clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
            setRecording(false);
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
            });

            setRecordedAudio(audioBlob); // ✅ STORE, NOT SEND
        };

        mediaRecorderRef.current.start();
        setRecording(true);
        setRecordSeconds(0);
        recordTimerRef.current = setInterval(() => {
            setRecordSeconds((s) => s + 1);
        }, 1000);

    };
    return (
        <>
            {loading ? <Loader />
                :
                <>
                    <div className="main-content flex-grow-1 p-3 overflow-auto">
                        <div className="row mb-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h3 className="innr-title mb-0"> Neo AI</h3>
                                    <div className="admin-breadcrumb">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb custom-breadcrumb">
                                                <li className="breadcrumb-item">
                                                    <NavLink to="/dashboard" className="breadcrumb-link">
                                                        Dashboard
                                                    </NavLink>
                                                </li>
                                                <li
                                                    className="breadcrumb-item active"
                                                    aria-current="page"
                                                >
                                                    Neo Ai
                                                </li>
                                            </ol>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-3 pe-lg-0 mb-3">
                                <div className="chat-left-usr-bx position-relative">

                                    <div>
                                        <h6 className="">Message</h6>


                                        {chatSessions?.map((chat) => (
                                            <a href="#" key={chat._id}>
                                                <div
                                                    className="chat-usr-card nw-chat-usr-card"
                                                    onClick={() => setActiveChatId(chat?._id)}
                                                >
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="chat-usr-avatr-crd">

                                                            <div className="chat-usr-info">
                                                                <h5 className="text-capitalize mb-0">{chat?.title}</h5>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-9 ps-lg-0">
                                <div className="right-chat-card chat-tp-header">
                                    <div className="lab-tp-title patient-bio-tab  d-flex align-items-center justify-content-between py-2">
                                        <div className="d-flex align-items-center justify-content-between w-100">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="chat-usr-avatr-crd">
                                                    <div className="chat-usr-avatr-bx nw-chat-add-live">
                                                        <img src={"/logo.png"} alt="" />
                                                    </div>
                                                    <div className="chat-usr-info">
                                                        <h5 className="mb-0">Neo Ai Chat</h5>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        {(
                                            (activeChatId && myQuestions.length > 0)
                                        ) && (
                                                <div>
                                                    <button
                                                        className="thm-btn rounded-3"
                                                        onClick={() => startNewChat()}
                                                    >
                                                        <FontAwesomeIcon icon={faPlusCircle} />
                                                    </button>
                                                </div>
                                            )}



                                    </div>

                                    <div className="all-chating-content-bx">
                                        <div className="chat-container">
                                            {myQuestions?.map((msg, i) => {
                                                const isMe = msg.type == "user";
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`d-flex align-items-start mb-4 ${isMe ? "justify-content-end" : ""
                                                            }`}
                                                    >
                                                        <div>
                                                            <div
                                                                className={`chat-bubble ${isMe ? "nw-right" : "nw-left"
                                                                    }`}
                                                            >
                                                                {msg.type === "user" && (
                                                                    <>


                                                                        {msg?.file && (() => {
                                                                            const isFileObject = typeof msg.file === "object";

                                                                            // ---------- FILE OBJECT (Preview) ----------
                                                                            if (isFileObject) {
                                                                                if (msg.file.type === "application/pdf") {
                                                                                    return (
                                                                                        <p className="text-info mt-1">
                                                                                            📄 {msg.file.name}
                                                                                        </p>
                                                                                    );
                                                                                }

                                                                                const imageUrl = URL.createObjectURL(msg.file);

                                                                                return (
                                                                                    <img
                                                                                        src={imageUrl}
                                                                                        alt="uploaded"
                                                                                        style={{ maxWidth: "200px", marginTop: "8px" }}
                                                                                    />
                                                                                );
                                                                            }

                                                                            // ---------- STRING PATH (Backend) ----------
                                                                            const isPdf = msg.file.toLowerCase().endsWith(".pdf");

                                                                            if (isPdf) {
                                                                                return (
                                                                                    <p className="text-info mt-1">
                                                                                        📄 {msg.file.split("/").pop()}
                                                                                    </p>
                                                                                );
                                                                            }
                                                                            return (
                                                                                <img
                                                                                    src={`${base_url}/${msg.file}`}
                                                                                    alt="uploaded"
                                                                                    style={{ maxWidth: "200px", marginTop: "8px" }}
                                                                                />
                                                                            );
                                                                        })()}
                                                                        {/* -------- AUDIO RENDER -------- */}
                                                                        {msg?.audio && (() => {
                                                                            const isAudioObject = typeof msg.audio === "object";

                                                                            // ---------- AUDIO OBJECT (Preview) ----------
                                                                            if (isAudioObject) {
                                                                                const audioUrl = URL.createObjectURL(msg.audio);

                                                                                return (
                                                                                    <div className="audio-preview mt-2">
                                                                                        <audio controls src={audioUrl} />
                                                                                        <div className="text-muted small">{msg.audio.name}</div>
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            // ---------- STRING PATH (Backend) ----------
                                                                            return (
                                                                                <div className="audio-preview mt-2">
                                                                                    <audio controls src={`${base_url}/${msg.audio}`} />
                                                                                </div>
                                                                            );
                                                                        })()}

                                                                        <p className="mb-0 text-white">{msg.question}</p>

                                                                    </>
                                                                )}


                                                                {/* AI ANSWER */}
                                                                {msg.type === "ai" && (
                                                                    <>
                                                                        <p><strong>{msg.answer.summary}</strong></p>

                                                                        {msg?.answer?.followUpQuestions?.length > 0 && (
                                                                            <>
                                                                                {/* {msg?.answer?.summary && <p className="mt-2 "><strong>Summary:</strong>{msg?.answer?.summary}</p>} */}
                                                                                <p className="mt-2 text-danger"><strong>Follow Up Questions</strong></p>
                                                                                <ul className="list-group">
                                                                                    {msg?.answer?.followUpQuestions.map((item, idx) => (
                                                                                        <li className="list-group-item" key={idx}
                                                                                            style={{ cursor: "pointer" }}
                                                                                            onClick={() => askQuestion(item)}>{item}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </>
                                                                        )}

                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {isTyping &&
                                                <div class="chat-typing-indicator">
                                                    <div class="chat-typing-dots">
                                                        <span class="chat-dot"></span>
                                                        <span class="chat-dot"></span>
                                                        <span class="chat-dot"></span>
                                                    </div>
                                                </div>
                                            }
                                            <div ref={bottomRef} />
                                        </div>
                                        <div className="">
                                            {recording && (
                                                <div className="recording-indicator mb-2">
                                                    <span className="text-danger fw-bold">
                                                        🔴 Recording… {recordSeconds}s
                                                    </span>
                                                    <small className="d-block text-muted">
                                                        Tap mic to stop
                                                    </small>
                                                </div>
                                            )}

                                            {recordedAudio && !isTyping && (
                                                <div className="audio-preview mb-2">
                                                    <small className="text-success d-block mb-1">
                                                        🎧 Audio ready to send
                                                    </small>

                                                    <AudioWaveform audioBlob={recordedAudio} />

                                                    <button
                                                        className="btn btn-sm btn-outline-danger mt-1"
                                                        onClick={() => setRecordedAudio(null)}
                                                    >
                                                        ❌ Cancel Audio
                                                    </button>
                                                </div>
                                            )}

                                            <div className="custom-frm-bx mb-0">


                                                <div className="chat-papperclip-bx">
                                                    {/* 📎 FILE */}
                                                    <button
                                                        type="button"
                                                        className="papperclip-btn px-0"
                                                        onClick={() => fileInputRef.current.click()}
                                                    >
                                                        <FontAwesomeIcon icon={faPaperclip} />
                                                    </button>

                                                    {/* 🎤 MIC */}
                                                    <button
                                                        type="button"
                                                        className={`mic-btn px-0 ${recording ? "recording" : ""}`}
                                                        onClick={toggleRecording}
                                                    >
                                                        {recording ? "⏹️" : <FontAwesomeIcon icon={faMicrophone} style={{ color: '#00B4B5' }} />}
                                                    </button>
                                                </div>
                                                {previewUrl && !isTyping && (
                                                    <div className="image-preview chat-picture-box mb-2">
                                                        <img
                                                            src={previewUrl}
                                                            alt="preview"
                                                            style={{
                                                                maxWidth: "200px",
                                                                borderRadius: "8px",
                                                                display: "block",
                                                                marginBottom: "5px",
                                                            }}
                                                        />

                                                        <button
                                                            className="chat-close-btn mt-1"
                                                            onClick={() => {
                                                                setPreviewFile(null);
                                                                setPreviewUrl(null);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faClose} />
                                                        </button>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    hidden
                                                    ref={fileInputRef}
                                                    onChange={handleFileSelect}
                                                />
                                                <input
                                                    type="text"
                                                    style={{ paddingLeft: '75px', paddingRight: '70px' }}
                                                    className="form-control"
                                                    value={question}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setQuestion(value);
                                                    }}
                                                    onKeyDown={(e) => e.key === "Enter" && fetchGeneralQuestions()}
                                                />

                                                <div className="chat-papper-plane-bx">
                                                    <button onClick={() => fetchGeneralQuestions()} className="chat-papper-plane-btn"><FontAwesomeIcon icon={faPaperPlane} className="paper-plane-icon" /></button>
                                                </div>


                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="text-end ">
                            <Link to={-1} className="nw-thm-btn rounded-3 outline" >
                                Go Back
                            </Link>
                        </div>



                    </div>


                </>
            }
        </>
    )
}

export default NeoAi