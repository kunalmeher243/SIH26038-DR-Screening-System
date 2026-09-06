import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";
import useAnalysisStore from "./store/useAnalysisStore";


function App() {

  const stage = useAnalysisStore(
    (state) => state.stage
  );


  const analysisStages = [
    "quality",
    "enhance",
    "grade",
    "report",
    "done",
    "error",
  ];


  /*
   * As soon as analysis starts, open the Analysis page.
   * This allows the user to see the live pipeline.
   */

  if (analysisStages.includes(stage)) {
    return <Analysis />;
  }


  return <Upload />;
}


export default App;