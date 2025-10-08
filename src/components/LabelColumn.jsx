import React, { memo } from "react";
import "./LabelColumn.css";

const LabelColumn = memo(({ rowIdx }) => (
  <td className="label-cell">Label {rowIdx + 1}</td>
));

export default LabelColumn;
