import React, { useState, useEffect } from 'react';
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
} from "@firebase/firestore";
import {
    ChartBarIcon,
    ChatIcon,
    DotsHorizontalIcon,
    HeartIcon,
    ShareIcon,
    SwitchHorizontalIcon,
    TrashIcon,
} from "@heroicons/react/outline";
import {
    HeartIcon as HeartIconFilled,
    ChatIcon as ChatIconFilled,
} from "@heroicons/react/solid";
import Moment from "react-moment";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useRecoilState } from "recoil";
import { modalState, postIdState } from "../atoms/modalAtom";
import { db } from '../firebase';


function Post({ id, post, postPage}) { // postPage ==> to browse detail page
    
    const { data: session } = useSession();
    const [ isOpen, setIsOpen ] = useRecoilState(modalState); //global state
    const [ postId, setPostId ] = useRecoilState(postIdState); // global state
    const [ comments, setComments ] = useState([]);
    const [ likes, setLikes ] = useState([]);
    const [ liked, setLiked ] = useState(false);
    const router = useRouter();


    // setLikes
    useEffect(() => {
        onSnapshot(collection(db, "posts", id, "likes"), (snapshot) =>
            setLikes(snapshot.docs)
        )
    }, [db, id]);

    // setLiked
    useEffect(() => {
        setLiked(
            likes.findIndex((like) => like.id === session?.user?.uid) !== -1
        )
    }, [likes]);

    // like/unlike post
    const likePost = async () => {
        if (liked) {
            await deleteDoc(doc(db, "posts", id, "likes", session.user.uid));
        } 
        else {
            await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
                username: session.user.name,
            });
        }
    };
    
    return (
        <div onClick={() => router.push(`/{$id}`)} className="p-3 flex cursor-pointer border-b border-gray-700">
            
            {
                !postPage && ( // if postPage is not true
                    <img
                        title={post?.username}
                        src={post?.userImg}
                        alt={post?.username}
                        className='h-11 w-11 rounded-full mr-4'
                    />
                )
            }

            <div className='flex flex-col space-y-2 w-full'>

                {/* user info & post text */}
                <div className={`flex ${!postPage && "justify-between"}`}>
                    {
                        postPage && (
                            <img
                                src={post?.userImg}
                                alt={post?.username}
                                title={post?.username}
                                className='h-11 w-11 rounded-full mr-4'
                            />
                        )
                    }

                    <div className="text-[#6e767d]">
                        <div className='inline-block group'>
                            <h4 className={`font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline ${!postPage && "inline-block"} `}>
                                {post?.username}
                            </h4>
                            <span className={`text-sm sm:text-[15px] ${!postPage && "ml-1.5"}`}>
                                @{post?.tag}
                            </span>
                        </div>
                        .{" "}
                        <span className='hover:underline text-sm sm:text-[15px]'>
                            <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
                        </span>
                        {
                            !postPage && (
                                <p className="text-[#d9d9d9] text-[15px] sm:text-base mt-0.5 ">
                                    {post?.text}
                                </p>
                            )
                        }
                    </div>

                    <div className='icon group flex-shrink-0 ml-auto'>
                        <DotsHorizontalIcon className='h-5 text-[#6e7e7d] group-hover:text-[#1d9bf0]' />
                    </div>

                </div>
                    
                {
                    postPage && (
                        <p className='text-[#d9d9d9] mt-0.5 text-xl'>{post?.text}</p>
                    )
                }

                {
                    post?.image && (

                        <img
                            src={post?.image}
                            alt={post?.text}
                            title={post?.text}
                            className='rounded-2xl max-h-[700px] object-cover mr-2'
                        />

                    )
                }
                
                {/* icons */}
                <div className={`text-[#6e767d] flex justify-between w-10/12 ${postPage && "mx-auto"}`}>


                    <div 
                        onClick={(e) => {
                            e.stopPropagation(); // prevent the route while clicking
                            setPostId(id);
                            setIsOpen(true);
                        }} 
                        className='flex items-center space-x-1 group'
                    >
                        <div className='icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10'>
                            <ChatIcon className='h-6 group-hover:text-[#1d9bf0]'/>
                        </div>
                        {
                            comments.length > 0 && (
                                <span className='group-hover:text-[#1d9bf0] text-sm'>
                                    {comments.length}
                                </span>
                            )
                        }
                    </div>

                    {
                        session.user.uid === post?.id? (
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteDoc(doc(db, "posts", id));
                                    router.push("/");
                                }} 
                                className='flex items-center space-x-1 group'
                            >
                                <div className='icon group-hover:bg-red-600/10'>
                                    <TrashIcon className='h-5 group-hover:text-red-600' />
                                </div>
                            </div>
                        ) : (
                            <div className='flex items-center space-x-1 group'>
                                <div className='icon group-hover:bg-green-500/10'>
                                    <SwitchHorizontalIcon className='h-5 group-hover:text-green-500' />
                                </div>
                            </div>
                        )
                    }

                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            likePost();
                        }} 
                        className='flex items-center space-x-1 group' 
                    >
                        <div className='icon group-hover:bg-pink-600/10'>
                            {
                                liked?(
                                    <HeartIconFilled className="h-5 text-pink-600" />
                                ):(
                                    <HeartIcon className="h-5 group-hover:text-pink-600" />
                                )
                            }
                        </div>
                        {
                            likes.length > 0 && (
                                <span className={`group-hover:text-pink-600 text-sm ${liked & "text-pink-600"}`}>
                                    {likes.length}
                                </span>
                            )
                        }
                    </div>

                    <div className='icon group'>
                        <ShareIcon className='h-5 group-hover:text-[#1d9bf0]'/>
                    </div>

                    <div className='icon group'>
                        <ChartBarIcon className='h-5 group-hover:text-[#1d9bf0]'/>
                    </div>


                </div>

            </div>
        </div>
    )
}

export default Post
