import { ChangeEvent, ReactNode } from 'react';

export interface SkeletonProps{
    className?: string
}
export interface MaxWidthProps{
    className?: string,
    children: ReactNode
}

export interface PdfRendererProps {
    url: string
}

export interface PdfFullscreenProps {
    fileUrl: string
}

export interface ChatWrapperProps {
    fileId: string
    isSubscribed: boolean
}

export interface ChatProviderProps {
    fileId: string;
    children: ReactNode
}

export type StreamResponse = {
    addMessage: ()=> void,
    handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void,
    message: string,
    isLoading: boolean
}
