
import React from "react";
import { 
  FileText, 
  File, 
  FileImage, 
  FileAudio 
} from "lucide-react";

interface FileIconProps {
  type: string;
  className?: string;
}

export const FileIcon = ({ type, className = "h-8 w-8" }: FileIconProps) => {
  switch (type) {
    case "pdf":
      return <FileText className={`${className} text-red-500`} />;
    case "document":
      return <FileText className={`${className} text-blue-500`} />;
    case "image":
      return <FileImage className={`${className} text-green-500`} />;
    case "audio":
      return <FileAudio className={`${className} text-purple-500`} />;
    default:
      return <File className={`${className} text-gray-500`} />;
  }
};
