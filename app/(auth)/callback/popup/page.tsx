"use client";

import { useEffect } from "react";

export default function PopupCallbackPage() {
    useEffect(() => {
        window.close();
    }, []);

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <p className="text-[13px] text-text-muted">Signing in... You can close this window.</p>
        </div>
    );
}
