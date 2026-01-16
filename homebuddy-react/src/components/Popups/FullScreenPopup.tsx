import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type FullScreenPopupProps = {
    open: boolean;
    onClose: () => void;
    childSize?: ChildSize;
    children?: React.ReactNode;
};

type ChildSize = {
    width: string;
    height: string;
};

export default function FullScreenPopup({
    open,
    onClose,
    childSize = { width: 'w-[35rem]', height: 'h-fit' },
    children
}: FullScreenPopupProps) {
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = open ? "hidden" : originalOverflow;
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [open]);

    if (!open) return null;

    const popupContent = (
        <div
            className="fixed inset-0 w-screen h-screen z-70 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
                onClick={onClose}
                aria-label="Close modal"
            />

            {/* Modal content */}
            <div
                className={`relative z-1000 pointer-events-auto flex justify-center items-center ${childSize.width} ${childSize.height}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );

    // Render the popup as a portal to document.body
    return typeof document !== 'undefined'
        ? createPortal(popupContent, document.body)
        : null;
}