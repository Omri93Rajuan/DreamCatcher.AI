import { RouterProvider as RRProvider } from "react-router-dom";
import { useState } from "react";
import { createAppRouter } from "@/routes";

export function RouterProvider() {
    const [router] = useState(() => createAppRouter());
    return <RRProvider router={router}/>;
}
