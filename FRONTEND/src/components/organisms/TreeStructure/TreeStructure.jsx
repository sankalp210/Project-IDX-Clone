import { useTreeStructureStorage } from "../../../store/treeStructureStorage"
import { useEffect } from "react";
import { TreeNode } from "../../molecules/Tree/TreeNode";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { FileContextMenu } from "../../molecules/ContextMenu/FileContextMenu";

export const TreeStructure = () => {

    const {treeStructure, setTreeStructure } = useTreeStructureStorage();
    const { 
        file,
        isOpen: isFileContextOpen, 
        x: fileContextX, 
        y: fileContextY } = useFileContextMenuStore();

    useEffect(() => {
        if(treeStructure) {
            console.log("tree:", treeStructure);
        } else {
            setTreeStructure();
        }
    }, [setTreeStructure, treeStructure]);

    return (
        <>
        {isFileContextOpen && fileContextX && fileContextY && (
            <FileContextMenu  
                x={fileContextX}
                y={fileContextY}
                path={file}
            />
        )}
            <TreeNode
                fileFolderData={treeStructure}
            />
        </>
    )
}
