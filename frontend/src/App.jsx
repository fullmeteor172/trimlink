import { useEffect } from "react";
import { themeChange } from "theme-change";
function App() {
  useEffect(() => {
    themeChange(false);
  }, []);
  return (
    <>
      <h1 class="text-3xl font-bold underline">Hello world!</h1>
    </>
  );
}

export default App;
