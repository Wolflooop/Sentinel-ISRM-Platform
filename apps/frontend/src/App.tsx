import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./routes/AppRouter";
import { GlobalHttpBanner } from "./components/GlobalHttpBanner";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalHttpBanner />
      <AppRouter />
    </QueryClientProvider>
  );
}
