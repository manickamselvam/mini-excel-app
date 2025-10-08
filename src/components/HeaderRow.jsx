import React, { memo } from "react";
import "./HeaderRow.css";

const HeaderRow = memo(({ cols, onAddColumn }) => (
  <thead>
    <tr>
      <th className="empty-header"></th>

      {Array.from({ length: cols }).map((_, i) => (
        <th key={i} className="header-cell">
          Head {i + 1}
        </th>
      ))}

      <th className="add-column-cell">
        <button className="add-column-btn" onClick={onAddColumn}>
          Add Column
        </button>
      </th>
    </tr>
  </thead>
));

export default HeaderRow;
