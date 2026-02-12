import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";

const VideoPage = () => {
    const { id } = useParams();
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await api.get(`/pages/${id}`);
                setContent(res.data.content);
            } catch (err) {
                console.error("Failed to load video page", err);
            }
        };

        fetchPage();
    }, [id]);

    return (
        <div className="w-full h-screen bg-white">
            <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

export default VideoPage;
