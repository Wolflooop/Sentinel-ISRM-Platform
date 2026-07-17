import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRouter } from "./routes/AppRouter";
import { GlobalHttpBanner } from "./components/GlobalHttpBanner";
import { ThemeProvider } from "./lib/theme/ThemeProvider";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalHttpBanner />
        <AppRouter />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
