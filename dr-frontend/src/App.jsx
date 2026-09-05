import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";
import useAnalysisStore from "./store/useAnalysisStore";

function App() {
  const stage = useAnalysisStore((state) => state.stage);

  if (stage === "done") {
    return <Analysis />;
  }

  return <Upload />;
}

export default App;