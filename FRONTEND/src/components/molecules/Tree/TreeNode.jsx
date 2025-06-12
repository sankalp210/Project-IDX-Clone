import { useEffect, useState } from "react";
import { DownOutlined, RightOutlined, FolderOutlined } from "@ant-design/icons";
import { FileIcon } from "../../atoms/FileIcon/FileIcon";
import { useEditorSocketStore } from "../../../store/editorSocketStore";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { useActiveFileTabStore } from "../../../store/activeFileTabStore";
import "./TreeNode.css";

export const TreeNode = ({ fileFolderData }) => {
  const [visibility, setVisibility] = useState({});

  const { editorSocket } = useEditorSocketStore();
  const { setActiveFileTab } = useActiveFileTabStore();

  const {
    setFile,
    setIsOpen: setFileContextMenuIsOpen,
    setX: setFileContextMenuX,
    setY: setFileContextMenuY,
  } = useFileContextMenuStore();

  function toggleVisibility(name) {
    setVisibility((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  function computeExtension(fileFolderData) {
    const names = fileFolderData.name.split(".");
    return names[names.length - 1];
  }

  function handleDoubleClick(fileFolderData) {
    console.log("Double clicked on", fileFolderData);

    // Don't emit here — it's handled in EditorComponent
    setActiveFileTab(
      fileFolderData.path,
      "",
      fileFolderData.name.split(".").pop()
    );
}

  function handleContextMenuForFiles(e, path) {
    e.preventDefault();
    console.log("Right clicked on", path, e);
    setFile(path);
    setFileContextMenuX(e.clientX);
    setFileContextMenuY(e.clientY);
    setFileContextMenuIsOpen(true);
  }

  useEffect(() => {
    console.log("Visibility changed:", visibility);
  }, [visibility]);

  return (
    fileFolderData && (
      <div className="tree-node">
        {fileFolderData.children ? (
          <div className="folder-node">
            <button
              onClick={() => toggleVisibility(fileFolderData.name)}
              className="folder-button"
            >
              {visibility[fileFolderData.name] ? (
                <DownOutlined className="arrow-icon" />
              ) : (
                <RightOutlined className="arrow-icon" />
              )}
              <FolderOutlined className="folder-icon" />
              <span className="node-text">{fileFolderData.name}</span>
            </button>
          </div>
        ) : (
          <div
            className="file-node"
            onContextMenu={(e) =>
              handleContextMenuForFiles(e, fileFolderData.path)
            }
            onDoubleClick={() => handleDoubleClick(fileFolderData)}
          >
            <div className="file-icon-wrapper">
              <FileIcon extension={computeExtension(fileFolderData)} />
            </div>
            <span className="node-text">{fileFolderData.name}</span>
          </div>
        )}
        {visibility[fileFolderData.name] && fileFolderData.children && (
          <div className="children-container">
            {fileFolderData.children.map((child) => (
              <TreeNode fileFolderData={child} key={child.path} />
            ))}
          </div>
        )}
      </div>
    )
  );
};
