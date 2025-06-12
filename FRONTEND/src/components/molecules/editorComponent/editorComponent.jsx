import { Editor } from "@monaco-editor/react";
import { useEffect, useState, useRef } from "react";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { useActiveFileTabStore } from "../../../store/activeFileTabStore";
import { extensionToFileType } from "../../../utils/extensionToFileType";
import { useEditorValueStore } from "../../../store/editorValueStore";

export const EditorComponent = () => {
    const { editorSocket } = useEditorSocketStore();
    const { activeFileTab } = useActiveFileTabStore();
    const { setValue } = useEditorValueStore();

    const [editorState, setEditorState] = useState({
        theme: null
    });

    const [fileContentsMap, setFileContentsMap] = useState(new Map());
    const [fileContent, setFileContent] = useState('// Welcome to the playground');
    const timerIdRef = useRef(null);

    // Load NightOwl theme
    useEffect(() => {
        async function downloadTheme() {
            try {
                const response = await fetch('/NightOwl.json');
                const data = await response.json();
                console.log("Theme data:", data);
                setEditorState((prev) => ({ ...prev, theme: data }));
            } catch (error) {
                console.error("Failed to load theme:", error);
            }
        }

        downloadTheme();
    }, []);

    // Apply theme
    function handleEditorTheme(editor, monaco) {
        if (editorState.theme) {
            monaco.editor.defineTheme('nightowl', editorState.theme);
            monaco.editor.setTheme('nightowl');
        }
    }
    function handleEditorTheme(editor, monaco) {
  if (editorState.theme) {
    const patchedTheme = {
      ...editorState.theme,
      colors: {
        ...editorState.theme.colors,
        "editor.background": "#011627",      // fix background
        "editor.foreground": "#d6deeb",      // optional, nice text color
        "editor.lineHighlightBackground": "#010E17"  // line highlight
      }
    };

    monaco.editor.defineTheme('nightowl', patchedTheme);
    monaco.editor.setTheme('nightowl');
  }
}

    // Debounced file save + update map
    function handleChange(value) {
        if (timerIdRef.current !== null) {
            clearTimeout(timerIdRef.current);
        }

        timerIdRef.current = setTimeout(() => {
            if (!editorSocket || !activeFileTab?.path) return;

            editorSocket.emit("writeFile", {
                pathToFileOrFolder: activeFileTab.path,
                data: value
            });

            // Update map and store
            setFileContentsMap((prev) => {
                const newMap = new Map(prev);
                newMap.set(activeFileTab.path, value);
                return newMap;
            });

            setValue(value);
        }, 2000);
    }

    // Read file from backend only when new
    useEffect(() => {
        if (activeFileTab && !fileContentsMap.has(activeFileTab.path)) {
            editorSocket.emit("readFile", { pathToFileOrFolder: activeFileTab.path });
        }
    }, [activeFileTab]);

    // Update file content when file tab changes
    useEffect(() => {
        if (activeFileTab?.path && fileContentsMap.has(activeFileTab.path)) {
            setFileContent(fileContentsMap.get(activeFileTab.path));
        }
    }, [activeFileTab, fileContentsMap]);

    // Handle readFileSuccess
    useEffect(() => {
        if (!editorSocket) return;

        const handleReadSuccess = (data) => {
            if (!data?.path) return;

            setFileContentsMap((prev) => {
                const newMap = new Map(prev);
                newMap.set(data.path, data.value);
                return newMap;
            });

            if (data.path === activeFileTab?.path) {
                setFileContent(data.value);
            }
        };

        editorSocket.on("readFileSuccess", handleReadSuccess);

        return () => {
            editorSocket.off("readFileSuccess", handleReadSuccess);
        };
    }, [activeFileTab, editorSocket]);

    return (
        <>
            {editorState.theme && activeFileTab ? (
                <Editor
                    height="100vh"
                    language={extensionToFileType(activeFileTab?.extension)}
                    value={fileContent || '// Welcome to the playground'}
                    onChange={handleChange}
                    onMount={handleEditorTheme}
                    options={{
                        fontSize: 18,
                        fontFamily: "JetBrains Mono",
                        lineNumbers: "on",
                        minimap: {
                            enabled: true,
                            scale: 1,
                        },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            ) : (
                <div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#aaa',
  textAlign: 'center'
}}>
  <img
    src="public/folder-open.png"
    alt="No File Selected"
    style={{ width: 150, opacity: 0.5 }}
  />
  <h2 style={{ fontSize: '24px', marginTop: '24px' }}>No file selected</h2>
  <p style={{ fontSize: '14px', marginTop: '8px', color: '#777' }}>
    Please double-click a file from the sidebar to start editing
  </p>
</div>

            )}
        </>
    );
};
