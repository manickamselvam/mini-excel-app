import React, { useState, useRef, useEffect, useCallback } from "react";
import Cell from "./Cell";
import HeaderRow from "./HeaderRow";
import LabelColumn from "./LabelColumn";

const Grid = () => {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [data, setData] = useState(
    Array.from({ length: 4 }, () => Array(4).fill(""))
  );
  const [editingCell, setEditingCell] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null); // { anchorRow, anchorCol, activeRow, activeCol }
  const [selecting, setSelecting] = useState(false);
  const tableRef = useRef(null);
  const cellRefs = useRef([]); // 2D array of refs for cells
  const prevEditing = useRef(null);

  // ---------- Helpers ----------
  const getMinMax = useCallback((range) => {
    if (!range) return { minRow: -1, maxRow: -1, minCol: -1, maxCol: -1 };
    return {
      minRow: Math.min(range.anchorRow, range.activeRow),
      maxRow: Math.max(range.anchorRow, range.activeRow),
      minCol: Math.min(range.anchorCol, range.activeCol),
      maxCol: Math.max(range.anchorCol, range.activeCol),
    };
  }, []);

  const isCellSelected = useCallback(
    (rowIdx, colIdx) => {
      const { minRow, maxRow, minCol, maxCol } = getMinMax(selectedRange);
      return (
        rowIdx >= minRow &&
        rowIdx <= maxRow &&
        colIdx >= minCol &&
        colIdx <= maxCol
      );
    },
    [selectedRange, getMinMax]
  );

  // ---------- Add row/column ----------
  const addRow = useCallback(() => {
    setRows((prevRows) => prevRows + 1);
    setData((prev) => [...prev, Array(cols).fill("")]);
  }, [cols]);

  const addColumn = useCallback(() => {
    setCols((prevCols) => prevCols + 1);
    setData((prev) => prev.map((row) => [...row, ""]));
  }, []);

  // ---------- Editing ----------
  const handleChange = useCallback((rowIdx, colIdx, value) => {
    setData((prev) => {
      const newData = [...prev];
      newData[rowIdx] = [...newData[rowIdx]];
      newData[rowIdx][colIdx] = value;
      return newData;
    });
  }, []);

  // ---------- Mouse selection ----------
  const handleMouseDown = useCallback((rowIdx, colIdx) => {
    setSelectedRange({
      anchorRow: rowIdx,
      anchorCol: colIdx,
      activeRow: rowIdx,
      activeCol: colIdx,
    });
    setSelecting(true);
    setEditingCell(null);
  }, []);

  const handleMouseEnter = useCallback(
    (rowIdx, colIdx) => {
      if (selecting) {
        setSelectedRange((prev) => ({
          ...prev,
          activeRow: rowIdx,
          activeCol: colIdx,
        }));
      }
    },
    [selecting]
  );

  const handleDoubleClick = useCallback((rowIdx, colIdx) => {
    setEditingCell({ row: rowIdx, col: colIdx });
    setSelectedRange(null);
  }, []);

  // ---------- Keyboard handling ----------
  const handleKeyDown = useCallback(
    (rowIdx, colIdx, e) => {
      if (editingCell) return; // Ignore key events while editing

      const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      // Prevent default behavior for navigation keys
      if (
        [...arrowKeys, "Tab", "Enter", "Backspace", "Delete"].includes(e.key)
      ) {
        e.preventDefault();
      }

      const isPrintableKey =
        (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) ||
        e.key === " ";

      if (isPrintableKey && selectedRange && editingCell === null) {
        setEditingCell({ row: rowIdx, col: colIdx });
        handleChange(rowIdx, colIdx, e.key === " " ? " " : e.key);
        return;
      }

      if (e.key === "Enter") {
        setEditingCell({ row: rowIdx, col: colIdx });
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedRange) {
          const { minRow, maxRow, minCol, maxCol } = getMinMax(selectedRange);
          const newData = [...data];
          for (let r = minRow; r <= maxRow; r++) {
            newData[r] = [...newData[r]];
            for (let c = minCol; c <= maxCol; c++) {
              newData[r][c] = "";
            }
          }
          setData(newData);
        }
        return;
      }

      // ---------- Tab navigation ----------
      if (e.key === "Tab") {
        let delta = e.shiftKey ? -1 : 1;
        let newActiveCol = colIdx + delta;
        let newActiveRow = rowIdx;

        if (newActiveCol >= cols) {
          newActiveCol = 0;
          newActiveRow++;
        }
        if (newActiveCol < 0) {
          newActiveCol = cols - 1;
          newActiveRow--;
        }

        newActiveRow = Math.max(0, Math.min(rows - 1, newActiveRow));
        newActiveCol = Math.max(0, Math.min(cols - 1, newActiveCol));

        setSelectedRange({
          anchorRow: e.shiftKey ? rowIdx : newActiveRow,
          anchorCol: e.shiftKey ? colIdx : newActiveCol,
          activeRow: newActiveRow,
          activeCol: newActiveCol,
        });

        const nextCell = cellRefs.current[newActiveRow]?.[newActiveCol];
        if (nextCell) nextCell.focus();
        return;
      }

      // ---------- Arrow navigation with shift for range selection ----------
      if (arrowKeys.includes(e.key)) {
        let anchorRow = selectedRange ? selectedRange.anchorRow : rowIdx;
        let anchorCol = selectedRange ? selectedRange.anchorCol : colIdx;
        let activeRow = selectedRange ? selectedRange.activeRow : rowIdx;
        let activeCol = selectedRange ? selectedRange.activeCol : colIdx;

        // Update active position based on arrow key
        if (e.key === "ArrowUp") activeRow = Math.max(0, activeRow - 1);
        if (e.key === "ArrowDown")
          activeRow = Math.min(rows - 1, activeRow + 1);
        if (e.key === "ArrowLeft") activeCol = Math.max(0, activeCol - 1);
        if (e.key === "ArrowRight")
          activeCol = Math.min(cols - 1, activeCol + 1);

        // If Shift is held, extend the selection from the anchor
        if (e.shiftKey) {
          setSelectedRange({
            anchorRow,
            anchorCol,
            activeRow,
            activeCol,
          });
        } else {
          // Without Shift, move the selection to a new single cell
          anchorRow = activeRow;
          anchorCol = activeCol;
          setSelectedRange({
            anchorRow,
            anchorCol,
            activeRow,
            activeCol,
          });
        }

        // Focus the new active cell
        const nextCell = cellRefs.current[activeRow]?.[activeCol];
        if (nextCell) nextCell.focus();
        return;
      }
    },
    [selectedRange, rows, cols, data, handleChange, getMinMax, editingCell]
  );

  // ---------- Focus restoration after edit ----------
  useEffect(() => {
    if (prevEditing.current && !editingCell) {
      const { row, col } = prevEditing.current;
      if (cellRefs.current[row] && cellRefs.current[row][col]) {
        cellRefs.current[row][col].focus();
        setSelectedRange({
          anchorRow: row,
          anchorCol: col,
          activeRow: row,
          activeCol: col,
        });
      }
    }
    prevEditing.current = editingCell;
  }, [editingCell]);

  // ---------- Global mouseup to end selection ----------
  useEffect(() => {
    const handleMouseUp = () => setSelecting(false);
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // ---------- Clipboard events ----------
  useEffect(() => {
    const handlePaste = (e) => {
      if (
        !tableRef.current ||
        !tableRef.current.contains(document.activeElement)
      )
        return;
      if (editingCell !== null) return;

      const paste = e.clipboardData.getData("text");
      e.preventDefault();
      const pasteRows = paste.split("\n").map((row) => row.split("\t"));
      while (
        pasteRows.length > 0 &&
        pasteRows[pasteRows.length - 1].every((cell) => cell === "")
      ) {
        pasteRows.pop();
      }
      const pasteHeight = pasteRows.length;
      if (pasteHeight === 0) return;
      const pasteWidth = Math.max(...pasteRows.map((r) => r.length));

      const startRow = selectedRange
        ? Math.min(selectedRange.anchorRow, selectedRange.activeRow)
        : 0;
      const startCol = selectedRange
        ? Math.min(selectedRange.anchorCol, selectedRange.activeCol)
        : 0;

      const newRowsNeeded = startRow + pasteHeight;
      const newColsNeeded = startCol + pasteWidth;
      setRows((prevRows) => Math.max(prevRows, newRowsNeeded));
      setCols((prevCols) => Math.max(prevCols, newColsNeeded));

      setData((prevData) => {
        const currentDataLength = prevData.length;
        const newTableData = Array.from(
          { length: Math.max(currentDataLength, newRowsNeeded) },
          (_, r) => {
            if (r < currentDataLength) {
              const currentRowLength = prevData[r].length;
              return [
                ...prevData[r],
                ...Array(Math.max(0, newColsNeeded - currentRowLength)).fill(
                  ""
                ),
              ];
            } else {
              return Array(newColsNeeded).fill("");
            }
          }
        );
        for (let i = 0; i < pasteHeight; i++) {
          for (let j = 0; j < pasteRows[i].length; j++) {
            const targetRow = startRow + i;
            const targetCol = startCol + j;
            if (
              newTableData[targetRow] &&
              newTableData[targetRow][targetCol] !== undefined
            ) {
              newTableData[targetRow][targetCol] = pasteRows[i][j];
            }
          }
        }
        return newTableData;
      });
    };

    const handleCopyCut = (e, cut = false) => {
      if (
        !tableRef.current ||
        !tableRef.current.contains(document.activeElement)
      )
        return;
      if (!selectedRange || editingCell !== null) return;

      const { minRow, maxRow, minCol, maxCol } = getMinMax(selectedRange);
      const copyData = [];
      for (let r = minRow; r <= maxRow; r++) {
        const rowData = [];
        for (let c = minCol; c <= maxCol; c++) {
          rowData.push(data[r][c] || "");
        }
        copyData.push(rowData.join("\t"));
      }
      e.clipboardData.setData("text/plain", copyData.join("\n"));
      e.preventDefault();

      if (cut) {
        setData((prevData) => {
          const newData = [...prevData];
          for (let r = minRow; r <= maxRow; r++) {
            newData[r] = [...newData[r]];
            for (let c = minCol; c <= maxCol; c++) {
              newData[r][c] = "";
            }
          }
          return newData;
        });
      }
    };

    const handleCopy = (e) => handleCopyCut(e, false);
    const handleCut = (e) => handleCopyCut(e, true);

    document.addEventListener("paste", handlePaste);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);

    return () => {
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
    };
  }, [selectedRange, editingCell, data, getMinMax]);

  // ---------- Render ----------
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "10px" }}>Grid Table</h1>
      <table
        ref={tableRef}
        style={{
          borderCollapse: "collapse",
          fontFamily: "Arial, sans-serif",
          marginTop: "10px",
          userSelect: "none",
        }}
      >
        <HeaderRow cols={cols} onAddColumn={addColumn} />
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              <LabelColumn rowIdx={rowIdx} />
              {Array.from({ length: cols }).map((_, colIdx) => (
                <Cell
                  key={`${rowIdx}-${colIdx}`}
                  rowIdx={rowIdx}
                  colIdx={colIdx}
                  value={data[rowIdx][colIdx]}
                  isEditing={
                    editingCell?.row === rowIdx && editingCell?.col === colIdx
                  }
                  isSelected={isCellSelected(rowIdx, colIdx)}
                  onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  onDoubleClick={() => handleDoubleClick(rowIdx, colIdx)}
                  onChange={(e) => handleChange(rowIdx, colIdx, e.target.value)}
                  onBlur={() => setEditingCell(null)}
                  onKeyDown={(e) => handleKeyDown(rowIdx, colIdx, e)}
                  ref={(el) => {
                    if (!cellRefs.current[rowIdx])
                      cellRefs.current[rowIdx] = [];
                    cellRefs.current[rowIdx][colIdx] = el;
                  }}
                />
              ))}
            </tr>
          ))}
          <tr>
            <td style={{ border: "none" }}>
              <button
                onClick={addRow}
                style={{
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                Add Row
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Grid;
