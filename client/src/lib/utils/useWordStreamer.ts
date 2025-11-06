import * as React from "react";
export function useWordStreamer(fullText: string, speedMs = 55) {
    const [out, setOut] = React.useState("");
    const [isStreaming, setIsStreaming] = React.useState(false);
    const timerRef = React.useRef<number | null>(null);
    const tokens = React.useMemo(() => String(fullText ?? "")
        .split(/(\s+)/)
        .filter((t) => t !== undefined && t !== null), [fullText]);
    React.useEffect(() => {
        if (!fullText) {
            setOut("");
            setIsStreaming(false);
            return;
        }
        setOut("");
        setIsStreaming(true);
        let i = 0;
        const tick = () => {
            if (i >= tokens.length) {
                setIsStreaming(false);
                if (timerRef.current)
                    window.clearInterval(timerRef.current);
                timerRef.current = null;
                return;
            }
            const next = tokens[i++];
            if (typeof next === "string")
                setOut((prev) => prev + next);
        };
        timerRef.current = window.setInterval(tick, speedMs) as unknown as number;
        return () => {
            if (timerRef.current)
                window.clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [fullText, tokens, speedMs]);
    return { streamedText: out, isStreaming };
}
