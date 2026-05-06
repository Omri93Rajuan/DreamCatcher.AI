import AppProviders from "./AppProviders";
import { RouterProvider } from "../providers/RouterProvider";

export default function App() {
    return (
      <AppProviders>
        <RouterProvider />
      </AppProviders>
    );
}
