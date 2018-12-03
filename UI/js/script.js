const deleteTableRow = () => {
    // event.target is the input button element. 
    // event.target.parentNode is the td cell containing the button
    const td = event.target.parentNode;
    const tr = td.parentNode; // the row to be removed
    const table = tr.parentNode; 
    table.removeChild(tr);
}