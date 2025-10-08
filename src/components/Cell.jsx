import React, { forwardRef, memo } from "react";
import "./Cell.css";

const Cell = memo(
  forwardRef(
    (
      {
        value,
        isEditing,
        isSelected,
        onMouseDown,
        onMouseEnter,
        onDoubleClick,
        onKeyDown,
        onChange,
        onBlur,
        rowIdx,
        colIdx,
      },
      ref
    ) => {
      return (
        <td className={`cell ${isSelected ? "cell--selected" : ""}`}>
          {isEditing ? (
            <input
              type="text"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              onKeyDown={onKeyDown} // Pass all key events to parent
              autoFocus
              ref={ref}
              className="cell-input"
            />
          ) : (
            <div
              tabIndex={0}
              onMouseDown={onMouseDown}
              onMouseEnter={onMouseEnter}
              onDoubleClick={onDoubleClick}
              onKeyDown={onKeyDown} // Pass all key events to parent
              ref={ref}
              className="cell-content"
            >
              {value}
            </div>
          )}
        </td>
      );
    }
  )
);

export default Cell;
