
# Dynamic Grid Editor

A React-based grid editor that allows users to create, edit, and manage a dynamic table with Excel-like functionality, including multiple cell selection with Shift + Arrow keys, clipboard operations (copy, cut, paste), and row/column addition.

## Setup Instructions

### Prerequisites
- Node.js (v14.x or later)
- npm (v6.x or later) or yarn

### Installation
1. **Clone the Repository**
   ```bash
   git clone https://github.com/manickamselvam/mini-excel-app.git
   cd dynamic-grid-editor
   
2. Install Dependencies
    npm install
    # or
    yarn install

3. Run the Development Server
    npm run dev
    # or
    yarn run dev

4. Project Structure
    src/
       Grid.jsx: Main component for the dynamic grid.
       Cell.jsx: Individual cell component.
       HeaderRow.jsx: Header row component.
       LabelColumn.jsx: Label column component.
       Cell.css: Styles for the cells.

5  Data Model Explanation
State Management
The application uses React's useState and useRef hooks to manage the grid's state and DOM references.

rows: Number of rows in the grid (initially 4).
cols: Number of columns in the grid (initially 4).
data: 2D array representing the grid's content, initialized as an array of empty strings.
editingCell: Object { row, col } indicating the currently edited cell, or null if no cell is being edited.
selectedRange: Object { anchorRow, anchorCol, activeRow, activeCol } defining the selection range, or null if no range is selected.
selecting: Boolean indicating if a mouse-based selection is in progress.
cellRefs: 2D array of refs for focusing individual cells.
prevEditing: Ref to track the previously edited cell for focus restoration.

Data Flow

Initialization: The grid starts with a 4x4 matrix of empty strings.
Updates: Changes to cell values, row/column additions, and selection ranges update the data and selectedRange states immutably.
Clipboard Operations: Paste operations dynamically adjust rows and cols if the pasted data exceeds current dimensions.

Selection Model

Anchor Point: Set by the initial click or focus, stored in anchorRow and anchorCol.
Active Point: Updated with arrow keys or mouse movement, stored in activeRow and activeCol.
Range Calculation: getMinMax computes the min/max boundaries for highlighting selected cells via isCellSelected.

Demo
Features Demonstrated

Dynamic Grid Creation: Add rows and columns using the "Add Row" and "Add Column" buttons.
Cell Editing: Double-click a cell to edit its content, press Enter to save, or click outside to cancel.
Multiple Cell Selection:

Click a cell to set the anchor.
Hold Shift and use arrow keys to extend the selection continuously, mimicking Excel.
Release Shift to keep the selection, or click elsewhere to reset.


Clipboard Operations:

Copy: Select a range and press Ctrl + C (or Cmd + C on Mac).
Cut: Select a range and press Ctrl + X (or Cmd + X).
Paste: Select a starting cell and press Ctrl + V (or Cmd + V) to paste tab-separated data.



Usage Example

Start the app and click cell (0,0).
Hold Shift and press ArrowDown three times to select a 4x1 range.
Press Ctrl + C to copy, click cell (2,1), and press Ctrl + V to paste.
Double-click a cell to edit, type a value, and press Enter to save.

Screenshots

<img width="652" height="503" alt="image" src="https://github.com/user-attachments/assets/05ad6d3f-7bd5-4708-b2cb-66c5e871e5fd" />


Known Limitations

No undo/redo functionality.
Paste operation assumes tab-separated text; complex formatting is not supported.
Selection styling depends on CSS; ensure .cell--selected is styled appropriately.

Future Improvements

Add undo/redo capabilities.
Keyboard shortcuts for row/column deletion.

