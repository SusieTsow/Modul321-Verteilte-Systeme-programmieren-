import { useKeycloak } from "@react-keycloak/web";
import "./App.css";
import JsonView from "@uiw/react-json-view";

function App() {
  const { keycloak, initialized } = useKeycloak();
  if (!initialized) {
    return <h2>Loading...</h2>;
  }
  return (
    <>
      {keycloak.authenticated ? (
        <>
          <h2>Authenticated</h2>
          <JsonView value={keycloak.tokenParsed} />
        </>
      ) : (
        <h2>Not Authenticated</h2>
      )}
    </>
  );
}

export default App;
