import "./TableActions.css";

const TableActions = ({ onAddRow }) => (
  <tr>
    <td className="action-cell">
      <button className="add-row-btn" onClick={onAddRow}>
        Add Row
      </button>
    </td>
  </tr>
);

export default TableActions;
