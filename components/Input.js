import React, { useRef, useState } from "react";
import {
    CalendarIcon,
    ChartBarIcon,
    EmojiHappyIcon,
    PhotographIcon,
    XIcon,
} from "@heroicons/react/outline";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { db, storage } from "../firebase";
import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
} from "@firebase/firestore";
import { getDownloadURL, ref, uploadString } from "@firebase/storage";
import { useSession } from "next-auth/react";

function Input(){
    const { data: session } = useSession();
    const [input, setInput]= useState("");
    const [selectedFile, setSelectedFile]=  useState(null);
    const [loading, setLoading] = useState(false);
    const filePickerRef = useRef(null);
    const [ showEmojis, setShowEmojis ] = useState(false);

    // Post submit
    const sendPost = async () => {
        if(loading) return;
        setLoading(true);

        const docRef = await addDoc(collection(db,'posts'),{
            id: session.user.uid,
            username: session.user.name,
            userImg: session.user.image,
            tag: session.user.tag,
            text: input,
            timestamp: serverTimestamp(),
        });

        const imageRef = ref(storage, `posts/${docRef.id}/image`);

        if(selectedFile){
            await uploadString(imageRef, selectedFile, "data_url").then(async()=>{
                const downloadURL = await getDownloadURL(imageRef);
                await updateDoc(doc(db, "posts", docRef.id), {
                    image: downloadURL,
                });  
            });
        }

        setLoading(false);
        setInput("");
        setSelectedFile(null);
        setShowEmojis(false);

    };

    // Add Image
    const addImageToPost = (e) =>{
        const reader = new FileReader();
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0]);
        }

        reader.onload = (readerEvent) => {
            setSelectedFile(readerEvent.target.result);
        };
    };

    // Add Emoji
    const addEmoji = (e) => {
        let sym = e.unified.split("-");
        let codesArray = [];
        sym.forEach((el) => codesArray.push("0x" + el));
        let emoji = String.fromCodePoint(...codesArray);
        setInput(input + emoji);
    };

    return (
        <div className={`border-b border-gray-700 p-3 flex space-x-3 overflow-y-auto ${loading && "opacity-60"}`}>
            <img 
                src={session.user.image} 
                alt={session.user.name}
                className="h-11 w-11 rounded-full xl:mr-2.5"
            />
            <div className="w-full divide-y divide-gray-700">
                <div className={``}>

                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-transparent outline-none text-[#d9d9d9] text-lg placeholder-gray-500 tracking-wide w-full min-h-[50px]"
                        rows="2"
                        placeholder="What's happening?"
                    />

                    {
                        selectedFile && (
                            <div className="relative">
                                <div onClick={() => setSelectedFile(null)} className="absolute w-8 h-8 hover:bg-[#272c26] hover:rounded-full bg-opacity-75 flex items-center justify-center top-1 left-1 cursor-pointer">
                                    <XIcon className="text-white h-5" />
                                </div>
                                <img
                                    src={selectedFile}
                                    alt=""
                                    className="rounded-2xl max-h-80 object-contain"
                                />  
                            </div>
                        )
                    }

                    {
                        !loading && (
                            <div className="flex items-center justify-between pt-2.5">
                                <div className="flex items-center">
                                    <div className="icon" onClick={() => filePickerRef.current.click()}>
                                        <PhotographIcon className="text-[#1d9bf0] h-[22px]"/>
                                        <input
                                            type="file"
                                            ref={filePickerRef}
                                            hidden
                                            onChange={addImageToPost}
                                        />
                                    </div>
                                    <div className="icon rotate-90">
                                        <ChartBarIcon className="text-[#1d0bf0] h-[22px]" />
                                    </div>
                                    <div className="icon" onClick={() => setShowEmojis(!showEmojis)}>
                                        <EmojiHappyIcon className="text-[#1d9bf0] h-[22px]" />
                                    </div>
                                    <div className="icon">
                                        <CalendarIcon className="text-[#1d9bf0] h-[22px]"/>
                                    </div>
                                    {
                                        showEmojis && (
                                            <Picker
                                                onSelect={addEmoji}
                                                style={{
                                                    position: "absolute",
                                                    marginTop: "465px",
                                                    marginLeft: -40,
                                                    maxWidth: "320px",
                                                    borderRadius: "20px",
                                                }}
                                                theme="dark"
                                            />
                                        )
                                    }
                                </div>
                                <button 
                                    onClick={sendPost}
                                    className="bg-[#1d9bf0] text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50 disabled:cursor-default"
                                    disabled={!input && !selectedFile}
                                >
                                    Tweet
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
};

export default Input;